import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const mailerConfig: MailerOptions = {
  transport: {
    host: 'smtp.example.com',
    port: 587,
    secure: false, // true for secure connection (TLS), false otherwise
    auth: {
      user: 'your_smtp_username',
      pass: 'your_smtp_password',
    },
  },
  defaults: {
    from: '"Your Application" <noreply@example.com>',
  },
  template: {
    dir: process.cwd() + '/templates/email/',
    adapter: new HandlebarsAdapter(), // or any other adapter
    options: {
      strict: true,
    },
  },
};
