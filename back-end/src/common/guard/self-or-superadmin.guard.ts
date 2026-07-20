import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';

// Only the account holder themself or the Super Admin (role 2) can pass —
// used specifically for account deletion, where a plain Admin (role 1) must
// NOT be able to delete another member's account.
@Injectable()
export class SelfOrSuperAdminGuard implements CanActivate {
  private readonly logger = new Logger(SelfOrSuperAdminGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requestedUserId = request.params.id;

    if (!user) {
      this.logger.warn('Access denied: no user found in request');
      return false;
    }

    if (user.id === requestedUserId) {
      this.logger.log('Access granted: user is deleting their own account');
      return true;
    }

    if (user.role === 2) {
      this.logger.log('Access granted: user is Super Admin');
      return true;
    }

    this.logger.warn(`Access denied: user ${user.id} (role ${user.role}) cannot delete account ${requestedUserId}`);
    return false;
  }
}
