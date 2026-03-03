import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

@Injectable()
export class MdtGatewayService {
  server: Server;

  broadcastToDepartment(
    departmentId: number,
    event: string,
    payload: unknown,
  ): void {
    this.server?.to(`department:${departmentId}`).emit(event, payload);
  }
}
