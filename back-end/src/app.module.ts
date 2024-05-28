import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { Module, OnModuleInit } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { User } from "./users/users.entity";
import { ListsMember } from "./lists-members/lists-member.entity";
import { UsersModule } from "./users/users.module";
import { EventsModule } from "./events/events.module";
import { ListsMembersModule } from "./lists-members/lists-members.module";
import { AuthModule } from "./auth/auth.module";
import { AdminModule } from "./admin/admin.module";
import { AlertModule } from "./alert/alert.module";
import { CronjobsModule } from "./cronjobs/cronjobs.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import configuration from "./config/configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: false, // Note: Set to true if using port 465, or if explicitly needed
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: '"Association MMA Baisieux" <no-reply@mmabaisieux.fr>',
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
        const host = configService.get<string>('DATABASE_HOST');
        const port = configService.get<number>('DATABASE_PORT');
        const username = configService.get<string>('DATABASE_USERNAME');
        const password = configService.get<string>('DATABASE_PASSWORD');
        const database = configService.get<string>('DATABASE_NAME');
        const sslCa = configService.get<string>('DATABASE_SSL_CA');
        const typeOrmSync = configService.get<boolean>('TYPEORM_SYNC');

        console.log('LOG - DATABASE_HOST:', host);
        console.log('LOG - DATABASE_PORT:', port);
        console.log('LOG - DATABASE_USERNAME:', username);
        console.log('LOG - DATABASE_PASSWORD:', password);
        console.log('LOG - DATABASE_NAME:', database);
        console.log('LOG - DATABASE_SSL_CA:', sslCa);
        console.log('LOG - TYPEORM_SYNC:', typeOrmSync);

        const dbConfig: TypeOrmModuleOptions = {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          autoLoadEntities: true,
          entities: [User, ListsMember],
          ssl: {
            rejectUnauthorized: false,
            ca: sslCa
          },
          synchronize: typeOrmSync,
        };
        console.log('LOG - Database Config:', dbConfig);
        return dbConfig;
      },
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
  constructor(private configService: ConfigService) { }

  async onModuleInit() {
    const databaseHost = this.configService.get<string>('DATABASE_HOST');
    console.log(`Database Host: ${databaseHost}`);
  }
}
