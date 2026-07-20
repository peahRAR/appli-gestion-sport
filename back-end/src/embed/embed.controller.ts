import { Controller, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import {
  EMBED_COOKIE_MAX_AGE_MS,
  EMBED_COOKIE_NAME,
  EMBED_TOKEN_TTL,
  EMBED_TOKEN_TYPE,
} from './embed.constants';

@Controller('embed/mma')
export class EmbedController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  // Protégé par le JwtAuthGuard global (Bearer token normal) : aucun guard
  // supplémentaire nécessaire ici. Émet un JWT courte durée dédié à l'iframe,
  // posé en cookie puisqu'un <iframe> ne peut pas transmettre de header custom.
  @Post('session')
  async createSession(
    @Req() req: Request & { user: { id: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.jwtService.signAsync(
      { sub: req.user.id, type: EMBED_TOKEN_TYPE },
      { expiresIn: EMBED_TOKEN_TTL },
    );

    res.cookie(EMBED_COOKIE_NAME, token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: EMBED_COOKIE_MAX_AGE_MS,
    });

    return { ok: true };
  }
}
