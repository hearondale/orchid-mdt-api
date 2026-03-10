import { Injectable } from '@nestjs/common';

interface HandshakeEntry {
  identifier: string;
  expiresAt: number;
}

@Injectable()
export class HandshakeStore {
  private readonly store = new Map<string, HandshakeEntry>();
  private readonly TTL_MS = 60_000; // 60 seconds

  set(key: string, identifier: string): void {
    this.store.set(key, {
      identifier,
      expiresAt: Date.now() + this.TTL_MS,
    });
  }

  consume(key: string): string | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    this.store.delete(key); // one-time use
    return entry.identifier;
  }
}
