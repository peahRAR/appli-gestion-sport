import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Vérifier si la route est publique
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la route est publique, autoriser l'accès sans vérifier le rôle
    if (isPublic) {
      return true;
    }

    // Si la route n'est pas publique, vérifier le rôle d'administrateur
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Accéder à l'utilisateur à partir de la requête

    // Vérifier si l'utilisateur existe et si son rôle correspond à celui des administrateurs
    return user && (user.role === 1 || user.role === 2);
  }
}
