import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { HandshakeStore } from '../auth/handshake.store';
import { UnitManagerService } from '../unit-manager/unit-manager.service';
import { DispatchService } from '../dispatch/dispatch.service';

@WebSocketGateway(3001, { cors: false })
export class FivemGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly config: ConfigService,
    private readonly handshake: HandshakeStore,
    private readonly unitManager: UnitManagerService,
    private readonly dispatch: DispatchService,
  ) {}

  handleConnection(client: Socket) {
    const secret = client.handshake.auth?.secret;

    console.log(secret, this.config.get<string>('FIVEM_SECRET'));

    if (secret !== this.config.get<string>('FIVEM_SECRET')) {
      client.disconnect(true);
      return;
    }

    console.log('[FiveM WS] FiveM server connected');
  }

  handleDisconnect() {
    console.log('[FiveM WS] FiveM server disconnected');
  }

  @SubscribeMessage('player:handshake')
  handleHandshake(@MessageBody() data: { key: string; identifier: string }) {
    if (!data?.key || !data?.identifier) {
      return { ok: false };
    }

    this.handshake.set(data.key, data.identifier);
    console.log(`[FiveM WS] Handshake stored for ${data.identifier}`);

    return { ok: true };
  }

  @SubscribeMessage('player:disconnect')
  handlePlayerDisconnect(@MessageBody() data: { identifier: string }) {
    if (!data?.identifier) return;

    this.unitManager.officerDisconnected(data.identifier);
    console.log(`[FiveM WS] Officer disconnected: ${data.identifier}`);
  }

  @SubscribeMessage('call:response')
  async handleCallResponse(
    @MessageBody()
    data: {
      callId: number;
      identifier: string;
      accepted: boolean;
    },
  ) {
    if (!data?.callId || !data?.identifier) return;
    if (!data.accepted) return;

    const officer = this.unitManager.getOnlineOfficer(data.identifier);
    if (!officer?.unitId) return;

    await this.dispatch.assignUnit(data.callId, officer.unitId);
  }
}
