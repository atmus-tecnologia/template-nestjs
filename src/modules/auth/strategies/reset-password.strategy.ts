import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '~/modules/users';
import { JwtPayload } from '../interfaces';

@Injectable()
export class ResetPasswordStrategy extends PassportStrategy(Strategy, 'reset-password') {
  private logger = new Logger(ResetPasswordStrategy.name);

  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.APP_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const { id, token, tokenType } = payload;
    if (tokenType !== 'reset-password') throw new UnauthorizedException('Invalid token type');

    const user = await this.usersService.findOne(id);
    if (!user || user.tokenResetPassword !== token) throw new UnauthorizedException('Invalid user or recovery token');

    this.logger.debug(`User ${user.id} authenticated`);
    return user;
  }
}
