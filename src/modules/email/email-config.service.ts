import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Injectable } from '@nestjs/common';
import path from 'path';

@Injectable()
export class EmailConfigService implements MailerOptionsFactory {
  createMailerOptions(): MailerOptions {
    return {
      transport: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: Boolean(process.env.MAIL_SSL === 'true'),
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: `"${process.env.APP_NAME}" <${process.env.MAIL_FROM}>`,
      },
      template: {
        dir: path.join('storage', 'templates', 'email'),
        adapter: new EjsAdapter(),
      },
    };
  }
}
