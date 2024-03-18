import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.entity';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private createidentifier(email: string): string {
    const secretKey = this.configService.get<string>('PASSWORDMAIL');
    return crypto.createHmac('sha256', secretKey).update(email).digest('hex');
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {

    // Rechercher l'utilisateur dans la base de données en utilisant le service UsersService
    const user = await this.usersService.findByEmail(email);

    // Vérifier si l'utilisateur existe
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Comparer le mot de passe fourni avec le mot de passe chiffré
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Générer un JWT avec les informations de l'utilisateur comme payload
    const payload = { sub: user.id, email: user.email }; // Utilisez les informations appropriées de l'utilisateur
    const access_token = await this.jwtService.signAsync(payload);

    // Retourner le token JWT
    return { access_token };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      // Comparer le mot de passe fourni avec le mot de passe chiffré
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return user; // Retourner l'utilisateur complet
      }
    }
    throw new UnauthorizedException('Email ou mot de passe incorrect');
  }
}
