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
        host: 'localhost',
        port: 5432,
        username: 'dampess',
        password: 'dgRGQEGGR55<§',
        database: 'appli-gestion-sport',
        autoLoadEntities: true,
        entities: [User, Event, ListsMember],
        synchronize: configService.get('TYPEORM_SYNC', 'false') === 'true',
      }),
    }),
    UsersModule,
    EventsModule,
    ListsMembersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

