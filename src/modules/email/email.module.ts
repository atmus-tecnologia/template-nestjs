import { Module } from '@nestjs/common';
import { MailgunModule } from '@nextnm/nestjs-mailgun';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailgunModule.forRoot({
      key: process.env.MAILGUN_TOKEN,
      username: 'api',
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
