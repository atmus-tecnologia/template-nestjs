import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  private logger = new Logger(WebsocketGateway.name);

  @WebSocketServer() server: Server;

  @SubscribeMessage('event')
  handleEvent(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    this.logger.log(`Client ${client.id} sent: ${JSON.stringify(data)}`);

    client.emit('event', data);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  afterInit() {
    this.logger.log('Socket server initialized');
  }
}
