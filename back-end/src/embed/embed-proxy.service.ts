import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Readable } from 'stream';

// Headers de requête qu'on ne relaie jamais tels quels vers Vercel : soit
// spécifiques à la connexion sortante (host, content-length...), soit
// porteurs de notre propre session (cookie/authorization, jamais transmis
// au partenaire).
const STRIPPED_REQUEST_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'accept-encoding',
  'cookie',
  'authorization',
  'origin',
  'referer',
]);

// Headers de réponse Vercel qu'on ne renvoie jamais au navigateur : cookies
// du partenaire (collision possible avec notre cookie embed_session),
// en-têtes bloquant l'affichage en iframe, en-têtes d'infra qui
// exposeraient l'hébergeur réel, et content-length/encoding devenus
// invalides puisque fetch() décompresse déjà le corps en transit.
const STRIPPED_RESPONSE_HEADERS = new Set([
  'set-cookie',
  'x-frame-options',
  'server',
  'x-vercel-id',
  'x-vercel-cache',
  'x-matched-path',
  'age',
  'strict-transport-security',
  'content-encoding',
  'transfer-encoding',
  'content-length',
  'connection',
]);

export const EMBED_PROXY_STRIPPED_REQUEST_HEADERS = STRIPPED_REQUEST_HEADERS;
export const EMBED_PROXY_STRIPPED_RESPONSE_HEADERS = STRIPPED_RESPONSE_HEADERS;

@Injectable()
export class EmbedProxyService {
  private readonly logger = new Logger(EmbedProxyService.name);

  constructor(private readonly configService: ConfigService) { }

  async proxy(req: Request, res: Response, subPath: string): Promise<void> {
    const baseUrl = this.configService.get<string>('PARTNER_VERCEL_BASE_URL');
    const bypassSecret = this.configService.get<string>('PARTNER_VERCEL_BYPASS_SECRET');

    if (!baseUrl) {
      this.logger.error('PARTNER_VERCEL_BASE_URL non configurée');
      this.sendErrorPage(res, 'Le contenu n\'est pas disponible pour le moment.');
      return;
    }

    const target = this.buildTargetUrl(baseUrl, subPath, req.originalUrl);

    // Garde-fou anti-boucle : la cible ne doit jamais pointer vers notre
    // propre domaine (ce qui indiquerait une URL Vercel mal résolue).
    if (target.host === req.get('host')) {
      this.logger.error(`Boucle de proxy détectée pour ${target.toString()}`);
      this.sendErrorPage(res, 'Le contenu n\'est pas disponible pour le moment.');
      return;
    }

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (!value || STRIPPED_REQUEST_HEADERS.has(key.toLowerCase())) {
        continue;
      }
      headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
    if (bypassSecret) {
      headers.set('x-vercel-protection-bypass', bypassSecret);
      headers.set('x-vercel-set-bypass-cookie', 'samesitenone');
    }
    headers.set('host', target.host);

    const method = req.method.toUpperCase();
    const forwardsBody = !['GET', 'HEAD'].includes(method);
    // Le body parser global de Nest a déjà consommé le flux brut de la
    // requête ; on relaie donc req.body (cas courant : JSON). Le site
    // partenaire n'expose aujourd'hui aucun endpoint POST connu — si un
    // besoin d'upload/body non-JSON apparaît, il faudra désactiver le body
    // parser global sur ces routes pour re-streamer le corps brut.
    const body = forwardsBody && req.body && Object.keys(req.body).length > 0
      ? JSON.stringify(req.body)
      : undefined;
    if (body) {
      headers.set('content-type', 'application/json');
    }

    let upstreamResponse: globalThis.Response;
    try {
      upstreamResponse = await fetch(target.toString(), {
        method,
        headers,
        body,
        redirect: 'manual',
        signal: AbortSignal.timeout(15000),
      });
    } catch (error) {
      this.logger.error(`Échec de la requête vers le partenaire (${target.pathname}) : ${(error as Error).message}`);
      this.sendErrorPage(res, 'Le contenu n\'a pas pu être chargé. Réessayez plus tard.');
      return;
    }

    res.status(upstreamResponse.status);

    upstreamResponse.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (STRIPPED_RESPONSE_HEADERS.has(lowerKey)) {
        return;
      }
      if (lowerKey === 'content-security-policy') {
        res.setHeader(key, this.stripFrameAncestors(value));
        return;
      }
      if (lowerKey === 'location') {
        res.setHeader(key, this.rewriteLocation(value, baseUrl));
        return;
      }
      res.setHeader(key, value);
    });

    if (!upstreamResponse.body) {
      res.end();
      return;
    }

    Readable.fromWeb(upstreamResponse.body as any).pipe(res);
  }

  private buildTargetUrl(baseUrl: string, subPath: string, originalUrl: string): URL {
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const target = new URL(subPath.replace(/^\/+/, ''), normalizedBase);
    const queryIndex = originalUrl.indexOf('?');
    target.search = queryIndex === -1 ? '' : originalUrl.slice(queryIndex);
    return target;
  }

  rewriteLocation(location: string, baseUrl: string): string {
    try {
      const resolved = new URL(location, baseUrl);
      const base = new URL(baseUrl);
      if (resolved.origin !== base.origin) {
        return location;
      }
      if (resolved.pathname.startsWith('/_next/')) {
        return `${resolved.pathname}${resolved.search}`;
      }
      const path = resolved.pathname === '/' ? '' : resolved.pathname;
      return `/embed/mma${path}${resolved.search}`;
    } catch {
      return location;
    }
  }

  stripFrameAncestors(cspValue: string): string {
    return cspValue
      .split(';')
      .map((directive) => directive.trim())
      .filter((directive) => !directive.toLowerCase().startsWith('frame-ancestors'))
      .join('; ');
  }

  // Toujours 200 : Cloudflare substitue sa propre page d'erreur générique
  // pour certains statuts (502/504/520-527), quel que soit le corps que
  // l'origine renvoie réellement — notre page de repli ne parvenait donc
  // jamais au navigateur avec un 502. L'iframe a seulement besoin d'un
  // message propre à afficher, pas d'un vrai code d'échec HTTP.
  private sendErrorPage(res: Response, message: string): void {
    res
      .status(200)
      .type('html')
      .send(`<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><title>Contenu indisponible</title></head>
<body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 1rem;">
  <p>${message}</p>
</body>
</html>`);
  }
}
