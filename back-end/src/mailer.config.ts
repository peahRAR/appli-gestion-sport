import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';

export const mailerConfig = (configService: ConfigService): MailerOptions => {
  const smtpHost = configService.get<string>('SMTP_HOST');
  const smtpPort = configService.get<number>('SMTP_PORT');
  const smtpUser = configService.get<string>('SMTP_USER');
  const smtpPass = configService.get<string>('SMTP_PASS');

  console.log(process.cwd())

  const options = {
    transport: {
      host: smtpHost,
      port: smtpPort,
      secure: false, // true for secure connection (TLS), false otherwise
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      debug: true,
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

  return options;
};
