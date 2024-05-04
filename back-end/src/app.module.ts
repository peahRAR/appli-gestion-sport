import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/users.entity';
import { Event } from './events/events.entity';
import { ListsMember } from './lists-members/lists-member.entity';

import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { ListsMembersModule } from './lists-members/lists-members.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { AlertModule } from './alert/alert.module';
import { PassportModule } from '@nestjs/passport';

import { ScheduleModule } from '@nestjs/schedule';
import { CronjobsModule } from './cronjobs/cronjobs.module';

import { SecretsService } from './secrets/secrets.service';
import { SecretsModule } from './secrets/secrets.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';


@Module({
  imports: [
    SecretsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [SecretsModule], // Assurez-vous que SecretsModule est importé
      inject: [SecretsService], // Injectez SecretsService pour l'utiliser dans useFactory
      useFactory: async (secretsService: SecretsService) => ({
        transport: {
          host: await secretsService.getSecret('SMTP_HOST'),
          port: parseInt(await secretsService.getSecret('SMTP_PORT'), 10),
          secure: false, // Note: Set to true if using port 465, or if explicitly needed
          auth: {
            user: await secretsService.getSecret('SMTP_USER'),
            pass: await secretsService.getSecret('SMTP_PASS'),
          },
        },
        defaults: {
          from: '"MMA-Association" <no-reply@mmabaisieux.fr>',
        },
        template: {
          dir: process.cwd() + '/templates/email/',
          adapter: new HandlebarsAdapter(), // or any other adapter
          options: {
            strict: false,
          },
        },
      }),
    }),
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
          rejectUnauthorized: false,
          ca: await secretsService.getSecret('DATABASE_SSL_CA')
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