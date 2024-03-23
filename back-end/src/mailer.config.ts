
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

export const mailerConfig: MailerOptions = {
  
  transport: {
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: false, // true for secure connection (TLS), false otherwise
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
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
};
