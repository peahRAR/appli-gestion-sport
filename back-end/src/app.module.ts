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
import { MailerModule } from '@nestjs-modules/mailer';
import { AlertModule } from './alert/alert.module';
import { mailerConfig } from './mailer.config';
import { PassportModule } from '@nestjs/passport';

import { ScheduleModule } from '@nestjs/schedule';
import { CronjobsModule } from './cronjobs/cronjobs.module';

import * as fs from 'fs';
import * as path from 'path';

const pathToPem = path.join(__dirname, '../ca.pem'); 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRoot(mailerConfig),
    ScheduleModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
        ssl: {
          rejectUnauthorized: true,
          ca: fs.readFileSync(pathToPem, 'utf8')
        },
        synchronize: configService.get('TYPEORM_SYNC', 'false') === 'true',
      }),
    }),
    UsersModule,
    EventsModule,
    ListsMembersModule,
    AuthModule,
    AdminModule,
    AlertModule,
    CronjobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

