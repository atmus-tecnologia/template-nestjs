import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { EmailService } from '../email';
import { UsersService } from '../users';
import { User } from '../users/entities';
import { UserRoleEnum } from '../users/enums';
import { WorkspacesService } from '../workspaces';
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPassowordDto } from './dto';
import { AccessToken, JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly workspacesService: WorkspacesService
  ) {}

  async login({ email, password }: LoginDto, remoteAddress: string): Promise<AccessToken> {
    const user = await this.usersService.findOneBy({ email });
    if (!(user && user.isValidPassword(password))) throw new ForbiddenException('Invalid credentials');

    // Sets the payload to create the JWT token
    const payload: JwtPayload = {
      id: user.id,
      remoteAddress,
      tokenType: 'user',
      role: user.role,
    };

    // Generate access token based on payload
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      ...registerDto,
      email: registerDto.email.toLowerCase(),
      name: `${registerDto.firstName} ${registerDto.lastName}`.toUpperCase(),
    });

    // Generates a random token to verify the email
    const tokenVerifyEmail = randomUUID();

    // Updates the user's email verification token
    await this.usersService.update({
      id: user.id,
      tokenVerifyEmail,
    });

    // Sends the verification email
    this.emailService.sendVerifyEmail(user, tokenVerifyEmail).catch(e => this.logger.error(e));

    return user;
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.usersService.findOneBy({ email });
    if (user) {
      // Check if the user has already requested password reset link in the last 5 minutes
      const lastRequest = user.lastEmailChangePassword;
      const canRequest = lastRequest && lastRequest.getTime() + 5 * 60 * 1000 > new Date().getTime();
      if (canRequest) {
        const diff = Math.ceil(Math.abs(((new Date().getTime() - lastRequest.getTime()) / 1000 - 5 * 60) / 60));
        throw new BadRequestException(`You must wait ${diff} minute(s) to request another password reset.`);
      }

      // Generates a random token to reset the password
      const tokenResetPassword = randomUUID();

      // Updates the user's password reset token
      await this.usersService.update({
        id: user.id,
        tokenResetPassword,
        lastEmailChangePassword: new Date(),
      });

      // Create JWT payload with userid and password reset token
      const payload: JwtPayload = {
        id: user.id,
        token: tokenResetPassword,
        tokenType: 'reset-password',
      };
      const jwtToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      this.emailService.sendResetPassword(user, jwtToken).catch(e => this.logger.error(e));
    }
  }

  async resetPassword(user: User, resetPassowordDto: ResetPassowordDto) {
    // Update user password and clear password reset token
    await this.usersService.update({
      id: user.id,
      password: resetPassowordDto.password,
      tokenResetPassword: null,
    });

    // Enviar email de senha alterada
    this.emailService.sendChangedPassword(user).catch(e => this.logger.error(e));
  }

  async verifyEmail(token: string) {
    const finded = await this.usersService.findOneBy({ tokenVerifyEmail: token });
    if (!(finded && !finded.emailVerifiedAt)) throw new BadRequestException('Invalid token');

    await this.usersService.update({
      id: finded.id,
      emailVerifiedAt: new Date(),
    });

    // Enviar email de email verificado
    this.emailService.sendVerifiedEmail(finded).catch(e => this.logger.error(e));

    return finded;
  }

  async resendVerificationEmail(email: string) {
    const finded = await this.usersService.findOneBy({ email });
    if (!(finded && !finded.emailVerifiedAt)) throw new BadRequestException('Invalid email address');

    const payload: JwtPayload = {
      id: finded.id,
      token: finded.tokenVerifyEmail,
      tokenType: 'verify-email',
    };
    const jwtToken = this.jwtService.sign(payload, { expiresIn: '30d' });
    this.emailService.sendVerifyEmail(finded, jwtToken).catch(e => this.logger.error(e));
  }

  async selectWorkspace(user: User, workspaceId: string, remoteAddress: string) {
    const workspace = await this.workspacesService.findOneBy({ id: workspaceId });
    if (!workspace) throw new BadRequestException('Workspace não encontrado');

    // ** Sets the payload to create the JWT token
    const payload: JwtPayload = {
      id: user.id,
      remoteAddress,
      tokenType: 'user',
      isAdmin: user.role === UserRoleEnum.ADMIN,
      workspaceId,
    };

    user.workspace = workspace;

    // ** Atualiza o último workspace selecionado pelo usuário
    this.usersService
      .update({
        id: user.id,
        lastWorkspaceId: workspaceId,
      })
      .catch(e => this.logger.error({ error: e }));

    // ** Generate access token based on payload
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, userData: user };
  }
}
