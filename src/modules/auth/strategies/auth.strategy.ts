import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '~/modules/users';
import { JwtPayload } from '../interfaces';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'auth') {
  private logger = new Logger(AuthStrategy.name);

  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.APP_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const { id, tokenType } = payload;
    if (tokenType !== 'user') throw new UnauthorizedException();

    const user = await this.usersService.findOne(id);
    if (!user) throw new UnauthorizedException();

    this.logger.debug(`User ${user.id} authenticated`);
    return user;
  }
}
