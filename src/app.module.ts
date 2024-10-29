import { Module } from '@nestjs/common';
import { CoreModule } from './core';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { WebsocketModule } from './modules/websocket';

@Module({
  imports: [CoreModule, AuthModule, UsersModule, WebsocketModule],
})
export class AppModule {}
