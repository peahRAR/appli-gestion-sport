import { Module, forwardRef } from '@nestjs/common';
import { ListsMembersService } from './lists-members.service';
import { ListsMembersController } from './lists-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsMember } from './lists-member.entity';import { JwtModule } from '@nestjs/jwt';
import { EventsModule } from 'src/events/events.module';
import { SecretsModule } from 'src/secrets/secrets.module';
import { SecretsService } from 'src/secrets/secrets.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([ListsMember]),
    JwtModule.registerAsync({
      imports: [SecretsModule], // Utilisez SecretsModule au lieu de ConfigModule
      inject: [SecretsService], // Injectez SecretsService au lieu de ConfigService
      useFactory: async (secretsService: SecretsService) => {
        const secret = await secretsService.getSecret('JWT_SECRET'); // Utilisez secretsService pour obtenir le secret
        const expiresIn = await secretsService.getSecret('JWT_EXP'); // Utilisez secretsService pour obtenir la durée d'expiration
        return {
          secret: secret,
          signOptions: { expiresIn: expiresIn }
        };
      },
    }),
    forwardRef(() => EventsModule),
  ],
  controllers: [ListsMembersController],
  providers: [ListsMembersService],
  exports: [ListsMembersService],
})
export class ListsMembersModule { }
