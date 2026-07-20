import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/users.entity';
import { Federation } from '../federations/federations.entity';

import { AdminFederationsController } from '../federations/federations.controller';
import { AdminFederationsService } from '../federations/federations.service';     

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Federation]),
    UsersModule,
  ],
  controllers: [
    AdminController,
    AdminFederationsController,
  ],
  providers: [
    AdminService,
    AdminFederationsService,
  ],
})
export class AdminModule {}
