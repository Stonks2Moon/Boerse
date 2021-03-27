import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { verify } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { BrokerModel } from './broker/models/Broker.model';

@WebSocketGateway()
export class MSSocket {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() token: string,
    @ConnectedSocket() client: Socket,
  ): void {
    const broker = verify(token, process.env.JWT_SECRET) as BrokerModel;
    client.join(broker.id);
  }
}
