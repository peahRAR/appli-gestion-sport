import { Module, DynamicModule, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { User } from './users/users.entity';
import { ListsMember } from './lists-members/lists-member.entity';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { ListsMembersModule } from './lists-members/lists-members.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { AlertModule } from './alert/alert.module';
import { CronjobsModule } from './cronjobs/cronjobs.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { mailerConfig } from './mailer.config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({})
export class AppModule implements OnModuleInit {
  constructor(private configService: ConfigService) { }

  async onModuleInit() {
    const databaseHost = this.configService.get<string>('DATABASE_HOST');
    console.log(`LOG - Database Host: ${databaseHost}`);
  }

  static forRoot(secrets: Record<string, any>): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              ...secrets,
            }),
          ],
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
            type: 'postgres',
            host: configService.get<string>('DATABASE_HOST'),
            port: configService.get<number>('DATABASE_PORT'),
            username: configService.get<string>('DATABASE_USERNAME'),
            password: configService.get<string>('DATABASE_PASSWORD'),
            database: configService.get<string>('DATABASE_NAME'),
            autoLoadEntities: true,
            entities: [User, ListsMember],
            ssl: {
              rejectUnauthorized: false,
              ca: configService.get<string>('DATABASE_SSL_CA'),
            },
            synchronize: configService.get<boolean>('TYPEORM_SYNC'),
          }),
        }), 
        MailerModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            const options = mailerConfig(configService);
            return options;
          },
        }),
        ScheduleModule.forRoot(),
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
    };
  }
}