import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmbedProxyService } from './embed-proxy.service';

const BASE_URL = 'https://grade-orange-mma.vercel.app';
const BYPASS_SECRET = 'test-bypass-secret';

function createResponse() {
  return {
    statusCode: 0,
    headers: {} as Record<string, string>,
    ended: false,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(key: string, value: string) {
      this.headers[key.toLowerCase()] = value;
    },
    end() {
      this.ended = true;
    },
    type() {
      return this;
    },
    send() {
      this.ended = true;
      return this;
    },
  };
}

function createRequest(overrides: Partial<Record<string, any>> = {}) {
  return {
    method: 'GET',
    originalUrl: '/embed/mma/',
    headers: {
      cookie: 'embed_session=should-not-be-forwarded',
      authorization: 'Bearer should-not-be-forwarded',
      'user-agent': 'jest-test-agent',
    },
    body: {},
    get(header: string) {
      return this.headers[header.toLowerCase()];
    },
    ...overrides,
  };
}

describe('EmbedProxyService', () => {
  let service: EmbedProxyService;
  let fetchMock: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbedProxyService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'PARTNER_VERCEL_BASE_URL') return BASE_URL;
              if (key === 'PARTNER_VERCEL_BYPASS_SECRET') return BYPASS_SECRET;
              return undefined;
            },
          },
        },
      ],
    }).compile();

    service = module.get<EmbedProxyService>(EmbedProxyService);

    fetchMock = jest.fn();
    global.fetch = fetchMock as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('rewriteLocation', () => {
    it('réécrit une redirection absolue vers le partenaire pour rester sous /embed/mma', () => {
      const result = service.rewriteLocation(`${BASE_URL}/some/page`, BASE_URL);
      expect(result).toBe('/embed/mma/some/page');
    });

    it('réécrit une redirection root-relative vers le partenaire', () => {
      const result = service.rewriteLocation('/some/page?x=1', BASE_URL);
      expect(result).toBe('/embed/mma/some/page?x=1');
    });

    it('laisse passer une redirection vers /_next telle quelle', () => {
      const result = service.rewriteLocation('/_next/static/chunks/app.js', BASE_URL);
      expect(result).toBe('/_next/static/chunks/app.js');
    });

    it('ne touche pas une redirection vers un domaine tiers', () => {
      const result = service.rewriteLocation('https://example.com/foo', BASE_URL);
      expect(result).toBe('https://example.com/foo');
    });

    it('gère la racine du site partenaire sans doubler le slash', () => {
      const result = service.rewriteLocation(`${BASE_URL}/`, BASE_URL);
      expect(result).toBe('/embed/mma');
    });
  });

  describe('stripFrameAncestors', () => {
    it('retire uniquement la directive frame-ancestors', () => {
      const result = service.stripFrameAncestors("default-src 'self'; frame-ancestors 'none'; img-src *");
      expect(result).toBe("default-src 'self'; img-src *");
    });

    it('laisse la CSP intacte quand frame-ancestors est absent', () => {
      const result = service.stripFrameAncestors("default-src 'self'");
      expect(result).toBe("default-src 'self'");
    });
  });

  describe('proxy', () => {
    it('ajoute le secret de bypass et ne relaie jamais le cookie/authorization entrants', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 200, headers: {} }));
      const req = createRequest();
      const res = createResponse();

      await service.proxy(req as any, res as any, '');

      const [, init] = fetchMock.mock.calls[0];
      const sentHeaders = init.headers as Headers;
      expect(sentHeaders.get('x-vercel-protection-bypass')).toBe(BYPASS_SECRET);
      expect(sentHeaders.get('cookie')).toBeNull();
      expect(sentHeaders.get('authorization')).toBeNull();
    });

    it('ne relaie jamais set-cookie ni x-frame-options au navigateur', async () => {
      fetchMock.mockResolvedValue(
        new Response(null, {
          status: 200,
          headers: {
            'set-cookie': 'vercel_session=abc',
            'x-frame-options': 'DENY',
            'content-type': 'text/html',
          },
        }),
      );
      const req = createRequest();
      const res = createResponse();

      await service.proxy(req as any, res as any, '');

      expect(res.headers['set-cookie']).toBeUndefined();
      expect(res.headers['x-frame-options']).toBeUndefined();
      expect(res.headers['content-type']).toBe('text/html');
    });

    it('renvoie une page d\'erreur propre quand la requête vers le partenaire échoue', async () => {
      fetchMock.mockRejectedValue(new Error('network down'));
      const req = createRequest();
      const res = createResponse();

      await service.proxy(req as any, res as any, '');

      expect(res.statusCode).toBe(502);
      expect(res.ended).toBe(true);
    });

    it('bloque une cible qui pointerait vers notre propre domaine (anti-boucle)', async () => {
      const req = createRequest({ headers: { host: 'grade-orange-mma.vercel.app' } });
      const res = createResponse();

      await service.proxy(req as any, res as any, '');

      expect(fetchMock).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(502);
    });
  });
});
