import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signIn(email: string, password: string): Promise<{ access_token: string }> {
    // Recherchez l'utilisateur dans la base de données en utilisant le service UsersService
    const user = await this.usersService.findByEmail(email);

    // Vérifiez si l'utilisateur existe et si le mot de passe correspond
    if (!user || user.password !== password) {
      // Si les informations d'identification ne sont pas valides, lancez une UnauthorizedException
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Générez un JWT avec les informations de l'utilisateur comme payload
    const payload = { sub: user.id, email: user.email }; // Utilisez les informations appropriées de l'utilisateur
    const access_token = await this.jwtService.signAsync(payload);

    // Retournez le token JWT
    return { access_token };
  }
}
