
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
require('dotenv').config();
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

export const mailerConfig: MailerOptions = {
  
  transport: {
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: true, // true for secure connection (TLS), false otherwise
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  },
  defaults: {
    from: '"MMA-Association" <noreply@gmail.com>',
  },
  template: {
    dir: process.cwd() + '/templates/email/',
    adapter: new HandlebarsAdapter(), // or any other adapter
    options: {
      strict: false,
    },
  },
};
