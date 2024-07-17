import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { ResetPassword } from './entities/reset-password.entity';
import { ListsMembersModule } from 'src/lists-members/lists-members.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { EncryptionService } from './services/encryption.service';
import { EmailService } from './services/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ResetPassword]),
    forwardRef(() => ListsMembersModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXP') },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, EncryptionService, EmailService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule { }
