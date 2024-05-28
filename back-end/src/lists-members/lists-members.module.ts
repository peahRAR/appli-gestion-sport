import { Module, forwardRef } from '@nestjs/common';
import { ListsMembersService } from './lists-members.service';
import { ListsMembersController } from './lists-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsMember } from './lists-member.entity';
import { JwtModule } from '@nestjs/jwt';
import { EventsModule } from 'src/events/events.module';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importez ConfigService et ConfigModule

@Module({
  imports: [
    TypeOrmModule.forFeature([ListsMember]),
    JwtModule.registerAsync({
      imports: [ConfigModule], // Remplacez SecretsModule par ConfigModule
      inject: [ConfigService], // Injectez ConfigService au lieu de SecretsService
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET'); // Utilisez ConfigService pour obtenir le secret
        const expiresIn = configService.get<string>('JWT_EXP'); // Utilisez ConfigService pour obtenir la durée d'expiration avec une valeur par défaut
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
