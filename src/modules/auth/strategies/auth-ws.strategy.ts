import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '~/modules/users';
import { JwtPayload } from '../interfaces';

@Injectable()
export class AuthWsStrategy extends PassportStrategy(Strategy, 'auth-ws') {
  private logger = new Logger(AuthWsStrategy.name);

  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.APP_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const { id, tokenType } = payload;
    if (tokenType !== 'user') throw new WsException('Invalid token type');

    const user = await this.usersService.findOne(id);
    if (!user) throw new WsException('User not found');

    this.logger.debug(`User ${user.id} authenticated`);
    return user;
  }
}
