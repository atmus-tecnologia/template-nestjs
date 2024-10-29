import { Injectable, Logger } from '@nestjs/common';
import { EmailOptions, MailgunService } from '@nextnm/nestjs-mailgun';
import { User } from '../users/entities';

interface ICreateEmail {
  sendTo: string | string[];
  subject: string;
  template: string;
  variables?: {
    [key: string]: string;
  };
}

@Injectable()
export class EmailService {
  private logger = new Logger(EmailService.name);

  constructor(private readonly mailgunService: MailgunService) {}

  private readonly links = {
    login: process.env.FRONTEND_DOMAIN.concat('/sign-in'),
    changePassword: (token: string) => process.env.FRONTEND_DOMAIN.concat(`/reset-password?token=${token}`),
    verifyEmail: (token: string) => process.env.FRONTEND_DOMAIN.concat(`/verify-email?token=${token}`),
  };

  private createEmail(data: ICreateEmail) {
    try {
      const options: EmailOptions = {
        from: `"${process.env.MAILGUN_FROM_NAME}" <${process.env.MAILGUN_FROM_EMAIL}>`,
        to: data.sendTo,
        subject: data.subject,
        template: data.template,
        'h:X-Mailgun-Variables': JSON.stringify(data.variables),
      };

      return this.mailgunService.createEmail(process.env.MAILGUN_DOMAIN, options);
    } catch (error) {
      this.logger.error(error);
    }

    return null;
  }

  sendWelcome(user: User, password: string) {
    this.logger.debug(`Sending welcome email to ${user.email}`);

    return this.createEmail({
      sendTo: user.email,
      subject: 'Seja bem-vindo(a)',
      template: 'welcome',
      variables: { name: user.name, email: user.email, password, url: this.links.login },
    });
  }

  sendResetPassword(user: User, token: string) {
    this.logger.debug(`Sending reset password email to ${user.email}`);

    return this.createEmail({
      sendTo: user.email,
      subject: 'Redefinição de senha',
      template: 'password-reset',
      variables: { name: user.name, email: user.email, token, url: this.links.changePassword(token) },
    });
  }

  sendChangedPassword(user: User) {
    this.logger.debug(`Sending changed password email to ${user.email}`);

    return this.createEmail({
      sendTo: user.email,
      subject: 'Senha alterada',
      template: 'changed-password',
      variables: { name: user.name, email: user.email, url: this.links.login },
    });
  }

  sendVerifyEmail(user: User, token: string) {
    this.logger.debug(`Sending verify email to ${user.email}`);

    return this.createEmail({
      sendTo: user.email,
      subject: 'Verificação de e-mail',
      template: 'verify-email',
      variables: { name: user.name, email: user.email, token, url: this.links.verifyEmail(token) },
    });
  }

  sendVerifiedEmail(user: User) {
    this.logger.debug(`Sending verified email to ${user.email}`);

    return this.createEmail({
      sendTo: user.email,
      subject: 'E-mail verificado',
      template: 'verified-email',
      variables: { name: user.name, email: user.email, url: this.links.login },
    });
  }

  sendSubscriptionCreated(user: User) {
    this.logger.debug(`Sending subscription created email to ${user.email}`);

    return this.createEmail({
      sendTo: user.email,
      subject: 'Assinatura criada',
      template: 'subscription-created',
      variables: { name: user.name, email: user.email, url: this.links.login },
    });
  }

  sendSubscriptionUpdated(user: User) {
    this.logger.debug(`Sending subscription updated email to ${user.email}`);

    return this.createEmail({
      sendTo: user.email,
      subject: 'Assinatura atualizada',
      template: 'subscription-updated',
      variables: { name: user.name, email: user.email, url: this.links.login },
    });
  }

  sendSubscriptionCancelled(user: User) {
    this.logger.debug(`Sending subscription cancelled email to ${user.email}`);
    return this.createEmail({
      sendTo: user.email,
      subject: 'Assinatura cancelada',
      template: 'subscription-cancelled',
      variables: { name: user.name, email: user.email, url: this.links.login },
    });
  }
}
