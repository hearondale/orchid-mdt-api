import { Injectable } from '@nestjs/common';

/**
 * Tracks FiveM identifiers for players currently connected to the game server.
 * Populated by player:handshake, cleared by player:disconnect.
 * Used by browser-login to verify the officer is actively in-game.
 */
@Injectable()
export class ConnectedStore {
  private readonly connected = new Set<string>();

  add(identifier: string): void {
    this.connected.add(identifier);
  }

  remove(identifier: string): void {
    this.connected.delete(identifier);
  }

  has(identifier: string): boolean {
    return this.connected.has(identifier);
  }
}
