import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class SuperadminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user;
    if (user && user.role === 2) {
      return true;
    }
    return false;
  }
}
