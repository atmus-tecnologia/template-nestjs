import { MailerService } from '@nestjs-modules/mailer';
import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { User } from '../users/entities';

@Processor('mailQueue')
export class EmailProcessor {
  private logger = new Logger(EmailProcessor.name);
  private defaultContext = {
    app_name: process.env.APP_NAME,
    app_url: process.env.FRONTEND_DOMAIN,
  };

  constructor(private readonly mailerService: MailerService) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: unknown) {
    this.logger.log(`Completed job ${job.id} of type ${job.name} with result ${JSON.stringify(result)}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }

  @Process('welcome')
  async sendWelcome(job: Job<{ user: User; password: string }>) {
    const { user, password } = job.data;

    await this.mailerService.sendMail({
      to: user.email,
      subject: `Seja bem-vindo(a)`,
      template: './users/welcome',
      context: {
        ...this.defaultContext,
        user: { ...user, password },
        url: process.env.FRONTEND_DOMAIN.concat(`/auth/login`),
      },
    });
  }

  @Process('reset-password')
  async sendResetPassword(job: Job<{ user: User; token: string }>) {
    const { user, token } = job.data;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Redefinição de senha',
      template: './auth/reset-password',
      context: {
        ...this.defaultContext,
        user,
        token,
        url: process.env.FRONTEND_DOMAIN.concat(`/auth/reset-password/${token}`),
      },
    });
  }

  @Process('changed-password')
  async sendChangedPassword(job: Job<{ user: User }>) {
    const { user } = job.data;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Senha alterada',
      template: './users/changed-password',
      context: {
        ...this.defaultContext,
        user,
        url: process.env.FRONTEND_DOMAIN.concat(`/auth/login`),
      },
    });
  }

  @Process('verify-email')
  async sendVerifyEmail(job: Job<{ user: User; token: string }>) {
    const { user, token } = job.data;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Confirmação de e-mail',
      template: './auth/verify-email',
      context: {
        ...this.defaultContext,
        user,
        token,
        url: process.env.FRONTEND_DOMAIN.concat(`/auth/verify-email/${token}`),
      },
    });
  }

  @Process('verified-email')
  async sendVerifiedEmail(job: Job<{ user: User }>) {
    const { user } = job.data;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'E-mail verificado',
      template: './users/verified-email',
      context: {
        ...this.defaultContext,
        user,
        url: process.env.FRONTEND_DOMAIN.concat(`/auth/login`),
      },
    });
  }
}
