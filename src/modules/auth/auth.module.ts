import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from '../email';
import { UsersModule } from '../users';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthStrategy, AuthWsStrategy, ResetPasswordStrategy, VerifyEmailStrategy } from './strategies';

@Module({
  imports: [
    PassportModule.register({ property: 'user' }),
    JwtModule.register({
      secret: process.env.APP_SECRET,
      signOptions: { expiresIn: process.env.JWT_LIFETIME },
    }),
    EmailModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthStrategy, AuthWsStrategy, ResetPasswordStrategy, VerifyEmailStrategy],
  exports: [AuthStrategy, AuthWsStrategy, ResetPasswordStrategy, VerifyEmailStrategy],
})
export class AuthModule {}
