import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UsersModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule { }
