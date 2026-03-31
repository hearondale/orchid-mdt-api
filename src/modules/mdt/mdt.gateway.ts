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
import { IncidentEditLockService } from './incident-edit-lock.service';

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
    private readonly editLocks: IncidentEditLockService,
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
      const payload = this.jwtService.verify<{
        sub: number;
        departmentId: number;
      }>(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
      client.data.officerId = payload.sub;
      void client.join(`department:${payload.departmentId}`);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const officerId = client.data?.officerId as number | undefined;
    if (officerId) {
      const released = this.editLocks.releaseAll(officerId);
      for (const incidentId of released) {
        this.gatewayService.broadcastToAll('incident:editing', {
          incidentId,
          editor: null,
        });
      }
    }
  }
}
