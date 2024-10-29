import { Module } from '@nestjs/common';
import { CoreModule } from './core';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { WebsocketModule } from './modules/websocket';
import { WorkspacesModule } from './modules/workspaces';

@Module({
  imports: [CoreModule, AuthModule, UsersModule, WebsocketModule, WorkspacesModule],
})
export class AppModule {}
