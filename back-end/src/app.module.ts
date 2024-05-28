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
        const dbConfig: TypeOrmModuleOptions = {
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
            ca: configService.get<string>('DATABASE_SSL_CA')
          },
          synchronize: configService.get<boolean>('TYPEORM_SYNC'),
        };
        console.log('LOG Database Config Host:', dbConfig.host); 
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
