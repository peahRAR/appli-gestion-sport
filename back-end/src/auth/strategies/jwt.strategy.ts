import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SecretsService } from 'src/secrets/secrets.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private static async setup(secretsService: SecretsService, usersService: UsersService): Promise<JwtStrategy> {
    const secret = await secretsService.getSecret('JWT_SECRET');
    return new this(secret, usersService);
  }

  constructor(
    secret: string, // Recevez la clé secrète en tant que paramètre
    private readonly usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
