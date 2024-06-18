import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

const logger = new Logger('MailerConfig');

export const mailerConfig = (configService: ConfigService): MailerOptions => {
  const smtpHost = configService.get<string>('SMTP_HOST');
  const smtpPort = configService.get<number>('SMTP_PORT');
  const smtpUser = configService.get<string>('SMTP_USER');
  const smtpPass = configService.get<string>('SMTP_PASS');

  logger.log(`SMTP Host: ${smtpHost}`);
  logger.log(`SMTP Port: ${smtpPort}`);
  logger.log(`SMTP User: ${smtpUser}`);

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
      logger: true,
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

  logger.log(`Mailer options: ${JSON.stringify(options, null, 2)}`);
  return options;
};
