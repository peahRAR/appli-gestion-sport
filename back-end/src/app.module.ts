import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import {User} from './users/users.entity'
import {Event} from './events/events.entity';
import {ListsMember} from './lists-members/lists-member.entity'

import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { ListsMembersModule } from './lists-members/lists-members.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { AdminModule } from './admin/admin.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        autoLoadEntities: true,
        entities: [User, Event, ListsMember],
        synchronize: configService.get('TYPEORM_SYNC', 'false') === 'true',
      }),
    }),
    UsersModule,
    EventsModule,
    ListsMembersModule,
    AuthModule,
    AdminModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

