import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    const user = request.user; 

    // Vérifier si l'utilisateur a le rôle requis (1 ou 2 pour admin ou superAdmin)
    return user && (user.role === 1 || user.role === 2);
  }
}
