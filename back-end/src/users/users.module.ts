import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { ResetPassword } from './reset-password.entity';
import { ListsMembersModule } from 'src/lists-members/lists-members.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, ResetPassword]),
    forwardRef(() => ListsMembersModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Ne pas exporter le Repository ici
})
export class UsersModule {}
