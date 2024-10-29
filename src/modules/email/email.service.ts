import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { User } from '../users/entities';

@Injectable()
export class EmailService {
  private logger = new Logger(EmailService.name);

  constructor(@InjectQueue('mailQueue') private mailQueue: Queue) {}

  sendWelcome(user: User, password: string) {
    this.logger.debug(`Adding job to queue: welcome - ${user.email}`);
    return this.mailQueue.add('welcome', { user, password });
  }

  sendResetPassword(user: User, token: string) {
    this.logger.debug(`Adding job to queue: reset-password - ${user.email}`);
    return this.mailQueue.add('reset-password', { user, token });
  }

  sendChangedPassword(user: User) {
    this.logger.debug(`Adding job to queue: changed-password - ${user.email}`);
    return this.mailQueue.add('changed-password', { user });
  }

  sendVerifyEmail(user: User, token: string) {
    this.logger.debug(`Adding job to queue: verify-email - ${user.email}`);
    return this.mailQueue.add('verify-email', { user, token });
  }

  sendVerifiedEmail(user: User) {
    this.logger.debug(`Adding job to queue: verified-email - ${user.email}`);
    return this.mailQueue.add('verified-email', { user });
  }
}
