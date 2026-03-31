import { Injectable } from '@nestjs/common';

export interface EditorInfo {
  id: number;
  badge: string;
  callsign: string;
}

@Injectable()
export class IncidentEditLockService {
  private readonly locks = new Map<number, EditorInfo>();

  /**
   * Try to acquire the edit lock for an incident.
   * If the lock is already held by a different officer, returns the current editor.
   * Re-acquiring your own lock is always allowed.
   */
  tryAcquire(
    incidentId: number,
    editor: EditorInfo,
  ): { acquired: true } | { acquired: false; editor: EditorInfo } {
    const existing = this.locks.get(incidentId);
    if (existing && existing.id !== editor.id) {
      return { acquired: false, editor: existing };
    }
    this.locks.set(incidentId, editor);
    return { acquired: true };
  }

  /** Release a specific incident lock. Only succeeds if the caller owns it. */
  release(incidentId: number, officerId: number): boolean {
    const existing = this.locks.get(incidentId);
    if (existing?.id === officerId) {
      this.locks.delete(incidentId);
      return true;
    }
    return false;
  }

  /** Release all locks held by an officer (called on WS disconnect). */
  releaseAll(officerId: number): number[] {
    const released: number[] = [];
    for (const [incidentId, editor] of this.locks) {
      if (editor.id === officerId) {
        this.locks.delete(incidentId);
        released.push(incidentId);
      }
    }
    return released;
  }

  getEditor(incidentId: number): EditorInfo | null {
    return this.locks.get(incidentId) ?? null;
  }
}
