import { All, Controller, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { EmbedProxyService } from './embed-proxy.service';
import { EmbedSessionGuard } from './embed-session.guard';

// @Public() saute uniquement le JwtAuthGuard global (qui attend un Bearer
// token que l'iframe ne peut pas fournir) ; EmbedSessionGuard le remplace
// et applique sa propre vérification (cookie embed_session). Ces routes ne
// sont donc jamais accessibles sans être passé par POST /embed/mma/session
// au préalable, qui lui reste derrière le JwtAuthGuard normal.
@Public()
@UseGuards(EmbedSessionGuard)
@Controller('embed/mma')
export class EmbedProxyController {
  constructor(private readonly embedProxyService: EmbedProxyService) { }

  @All()
  async proxyRoot(@Req() req: Request, @Res() res: Response) {
    await this.embedProxyService.proxy(req, res, '');
  }

  @All('*path')
  async proxySubPath(@Req() req: Request, @Res() res: Response) {
    await this.embedProxyService.proxy(req, res, req.params.path as unknown as string);
  }
}

// Next.js sert ses assets sous /_next/* à la racine du domaine, quel que
// soit le chemin d'où la page est chargée : sans ce proxy, le navigateur
// irait chercher ces fichiers sur notre propre domaine racine au lieu de
// passer par /embed/mma/. Préfixe distinct de "_nuxt" (notre propre front),
// donc aucune collision.
@Public()
@UseGuards(EmbedSessionGuard)
@Controller('_next')
export class EmbedAssetsController {
  constructor(private readonly embedProxyService: EmbedProxyService) { }

  @All('*path')
  async proxyAsset(@Req() req: Request, @Res() res: Response) {
    const path = req.params.path as unknown as string;
    await this.embedProxyService.proxy(req, res, `_next/${path}`);
  }
}
