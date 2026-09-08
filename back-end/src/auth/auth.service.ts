import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/services/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    await this.usersService.touchLastLogin(user.id);
    return { access_token: token };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      if (!user.isActive) {
        throw new UnauthorizedException('Compte non active');
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // Checked only after a correct password, so a wrong-password attempt
        // doesn't reveal whether the account is deactivated (no enumeration).
        if (user.status === 'deactivated_inactivity') {
          throw new UnauthorizedException(
            'Votre compte a été désactivé pour inactivité. Contactez un administrateur pour le réactiver.',
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return user;
      }
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
