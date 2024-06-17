import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';

export const mailerConfig = (configService: ConfigService): MailerOptions => {
  return {
    transport: {
      host: configService.get<string>('SMTP_HOST'),
      port: parseInt(configService.get<string>('SMTP_PORT')),
      secure: false, // true for secure connection (TLS), false otherwise
      auth: {
        user: configService.get<string>('SMTP_USER'),
        pass: configService.get<string>('SMTP_PASS'),
      },
    },
    defaults: {
      from: '"MMA-Association" <no-reply@mmabaisieux.fr>',
    },
    template: {
      dir: process.cwd() + '/templates/email/',
      adapter: new HandlebarsAdapter(), 
      options: {
        strict: false,
      },
    },
  };
};

