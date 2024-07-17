import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { EncryptionService } from 'src/users/services/encryption.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UsersModule,
  ],
  providers: [AdminService, EncryptionService],
  controllers: [AdminController],
})
export class AdminModule { }
