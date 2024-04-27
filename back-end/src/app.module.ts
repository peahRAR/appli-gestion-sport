import { Module, OnModuleInit } from '@nestjs/common';
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
import { SecretsService } from './secrets/secrets.service';

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
      inject: [ConfigService, SecretsService],

      useFactory: async (configService: ConfigService, secretsService: SecretsService) => ({
        type: 'postgres',
        host: await secretsService.getSecret('DATABASE_HOST'),
        port: parseInt(await secretsService.getSecret('DATABASE_PORT'), 10),
        username: await secretsService.getSecret('DATABASE_USERNAME'),
        password: await secretsService.getSecret('DATABASE_PASSWORD'),
        database: await secretsService.getSecret('DATABASE_NAME'),
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
export class AppModule implements OnModuleInit {
  constructor(private secretsService: SecretsService) { }

  async onModuleInit() {
    const databaseHost = await this.secretsService.getSecret('DATABASE_HOST');
    console.log(`Database Host: ${databaseHost}`);
  }
}

