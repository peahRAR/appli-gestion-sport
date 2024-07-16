import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';

@Injectable()
export class UserIdOradminRoleGuard implements CanActivate {
  private readonly logger = new Logger(UserIdOradminRoleGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requestedUserId = request.params.id; // Comparez les UUIDs comme des chaînes

    this.logger.debug(`Guard Check - User: ${JSON.stringify(user)}`); // Log des informations utilisateur
    this.logger.debug(`Guard Check - Requested User ID: ${requestedUserId}`); // Log de l'ID utilisateur demandé

    if (!user) {
      this.logger.warn('Access denied: No user found in request'); // Log si aucun utilisateur n'est trouvé
      return false;
    }

    if (user.id === requestedUserId) {
      this.logger.log('Access granted: User is accessing their own data'); // Log si l'utilisateur accède à ses propres données
      return true;
    }

    if (user.role === 1) {
      this.logger.log('Access granted: User has admin role (role 1)'); // Log si l'utilisateur a le rôle d'admin
      return true;
    }

    if (user.role === 2) {
      this.logger.log('Access granted: User has role 2'); // Log si l'utilisateur a le rôle 2
      return true;
    }

    if (user.role === 0) {
      this.logger.warn('Access denied: User with role 0 can only access their own data'); // Log spécifique pour le rôle 0
    } else {
      this.logger.warn('Access denied: User does not have the required permissions'); // Log si l'utilisateur n'a pas les permissions nécessaires
    }

    return false;
  }
}
