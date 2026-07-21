import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { EMBED_COOKIE_NAME, EMBED_TOKEN_TYPE } from './embed.constants';

@Injectable()
export class EmbedSessionGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.[EMBED_COOKIE_NAME];
    if (!token) {
      return false;
    }

    try {
      const payload = this.jwtService.verify(token);
      return payload?.type === EMBED_TOKEN_TYPE;
    } catch {
      return false;
    }
  }
}
