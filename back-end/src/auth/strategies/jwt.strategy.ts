import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SecretsService } from 'src/secrets/secrets.service';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly secretsService: SecretsService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: async (request, rawJwtToken, callback) => {
        try {
          const secretKey = await secretsService.getSecret('JWT_SECRET');
          callback(null, secretKey); // Assurez-vous que cette fonction callback est bien appelée avec les bons paramètres.
        } catch (error) {
          callback(error, null);
        }
      },
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
