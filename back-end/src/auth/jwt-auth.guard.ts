import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1]; // Récupérer le token JWT depuis les headers

    if (token) {
      try {
        const decoded = this.jwtService.verify(token); // Vérifier le token JWT
        request.user = decoded; // Ajouter les informations de l'utilisateur décodé à la requête
        return true;
      } catch (error) {
        return false;
      }
    }

    return false;
  }
}
