// users.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class UsersGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const requestingUserId = request.user.sub; // Supposons que l'ID de l'utilisateur est stocké dans req.user
    const requestingUserRole = request.user.role; // Supposons que le rôle de l'utilisateur est stocké dans req.user

    const id = +request.params.id; // Récupérer l'ID de l'utilisateur à partir des paramètres de la requête

    // Votre logique de vérification d'autorisation ici
    if (requestingUserId === id || requestingUserRole === 1 || requestingUserRole === 2) {
      return true; // L'utilisateur a les autorisations nécessaires
    } else {
      return false; // L'utilisateur n'est pas autorisé à accéder à la ressource
    }
  }
}
