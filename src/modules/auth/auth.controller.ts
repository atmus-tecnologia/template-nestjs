import { Body, Controller, Get, Ip, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '~/common/decorators';
import { AuthGuard, ResetPasswordGuard, VerifyEmailGuard } from '~/common/guards';
import { User } from '../users/entities';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPassowordDto } from './dto';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: User) {
    return user;
  }

  @Post('login')
  login(@Ip() remoteAddress: string, @Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, remoteAddress);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Patch('reset-password')
  @UseGuards(ResetPasswordGuard)
  resetPassword(@CurrentUser() user: User, @Body() resetPassowordDto: ResetPassowordDto) {
    return this.authService.resetPassword(user, resetPassowordDto);
  }

  @Post('verify-email')
  @UseGuards(VerifyEmailGuard)
  verifyEmail(@Body() { token }: { token: string }) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification-email')
  resendVerificationEmail(@Body() { email }: { email: string }) {
    return this.authService.resendVerificationEmail(email);
  }
}
