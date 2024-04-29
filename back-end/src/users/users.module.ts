import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { ResetPassword } from './reset-password.entity';
import { ListsMembersModule } from 'src/lists-members/lists-members.module';
import { JwtModule } from '@nestjs/jwt';
import { SecretsModule } from 'src/secrets/secrets.module';
import { SecretsService } from 'src/secrets/secrets.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, ResetPassword]),
    JwtModule.registerAsync({
      imports: [SecretsModule], 
      inject: [SecretsService], 
      useFactory: async (secretsService: SecretsService) => {
        const secret = await secretsService.getSecret('JWT_SECRET'); 
        const expiresIn = await secretsService.getSecret('JWT_EXP'); 
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
