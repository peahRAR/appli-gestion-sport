import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { ResetPassword } from './reset-password.entity';
import { ListsMembersModule } from 'src/lists-members/lists-members.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ResetPassword]),
    JwtModule.registerAsync({
      imports: [ConfigModule], // S'assurer que ConfigModule est importé
      inject: [ConfigService], // Injecter ConfigService
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET'); // Utiliser ConfigService pour obtenir JWT_SECRET
        const expiresIn = configService.get<string>('JWT_EXP'); // Utiliser ConfigService pour obtenir JWT_EXP
        return {
          secret: secret,
          signOptions: { expiresIn: expiresIn }
        };
      },
    }),
    forwardRef(() => ListsMembersModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
