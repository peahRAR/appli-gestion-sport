import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const mailerConfig = (configService: ConfigService): MailerOptions => {
  const smtpHost = configService.get<string>('SMTP_HOST');
  const smtpPort = configService.get<number>('SMTP_PORT');
  const smtpUser = configService.get<string>('SMTP_USER');
  const smtpPass = configService.get<string>('SMTP_PASS');

  const templateDir = join(__dirname, '..', 'templates', 'email');
  console.log('Template directory:', templateDir); // Log du chemin du template


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
      dir: templateDir,
      adapter: new HandlebarsAdapter(),
      options: {
        strict: false,
      },
    },
  };

  return options;
};
