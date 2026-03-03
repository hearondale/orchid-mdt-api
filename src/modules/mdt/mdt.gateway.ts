import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MdtGatewayService } from './mdt-gateway.service';

@WebSocketGateway({ namespace: '/mdt', cors: { origin: '*' } })
export class MdtGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly gatewayService: MdtGatewayService,
  ) {}

  afterInit(server: Server) {
    this.gatewayService.server = server;
  }

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify<{ departmentId: number }>(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
      void client.join(`department:${payload.departmentId}`);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[MDT WS] Client disconnected: ${client.id}`);
  }
}
