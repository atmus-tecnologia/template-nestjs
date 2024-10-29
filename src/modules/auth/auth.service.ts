import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { EmailService } from '../email';
import { UsersService } from '../users';
import { User } from '../users/entities';
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPassowordDto } from './dto';
import { AccessToken, JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService
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
    const user = await this.usersService.create(registerDto);

    // Generates a random token to verify the email
    const tokenVerifyEmail = randomUUID();

    // Updates the user's email verification token
    await this.usersService.update({
      id: user.id,
      tokenVerifyEmail,
    });

    // Sends the verification email
    await this.emailService.sendVerifyEmail(user, tokenVerifyEmail);

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
      await this.emailService.sendResetPassword(user, jwtToken);
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
    await this.emailService.sendChangedPassword(user);
  }

  async verifyEmail(token: string) {
    const finded = await this.usersService.findOneBy({ tokenVerifyEmail: token });
    if (!(finded && !finded.emailVerifiedAt)) throw new BadRequestException('Invalid token');

    await this.usersService.update({
      id: finded.id,
      emailVerifiedAt: new Date(),
    });

    // Enviar email de email verificado
    await this.emailService.sendVerifiedEmail(finded);

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
    await this.emailService.sendVerifyEmail(finded, jwtToken);
  }
}
