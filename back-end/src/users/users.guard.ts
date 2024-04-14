import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class UserIdOradminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requestedUserId = parseInt(request.params.id, 10); // Supposons que l'ID soit dans les paramètres de la requête
    if (
      user &&
      (user.id === requestedUserId || user.role === 1 || user.role === 2)
    ) {
      return true;
    }
    return false;
  }
}
