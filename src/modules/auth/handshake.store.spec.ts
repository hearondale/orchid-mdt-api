import { HandshakeStore } from './handshake.store';

describe('HandshakeStore', () => {
  let store: HandshakeStore;

  beforeEach(() => {
    store = new HandshakeStore();
  });

  it('should be defined', () => {
    expect(store).toBeDefined();
  });

  describe('consume', () => {
    it('returns the identifier for a valid key', () => {
      store.set('key-1', 'license:abc');
      expect(store.consume('key-1')).toBe('license:abc');
    });

    it('returns null for an unknown key', () => {
      expect(store.consume('nonexistent')).toBeNull();
    });

    it('is one-time use — second consume returns null', () => {
      store.set('key-1', 'license:abc');
      store.consume('key-1');
      expect(store.consume('key-1')).toBeNull();
    });

    it('returns null for an expired entry', () => {
      store.set('key-1', 'license:abc');
      // Advance time past TTL by mocking Date.now
      const realNow = Date.now;
      Date.now = () => realNow() + 60_000;
      try {
        expect(store.consume('key-1')).toBeNull();
      } finally {
        Date.now = realNow;
      }
    });

    it('cleans up expired entry from store', () => {
      store.set('key-1', 'license:abc');
      const realNow = Date.now;
      Date.now = () => realNow() + 60_000;
      try {
        store.consume('key-1');
        // Also expired second time — still null, no throw
        expect(store.consume('key-1')).toBeNull();
      } finally {
        Date.now = realNow;
      }
    });
  });

  describe('set', () => {
    it('overwrites an existing key with a new identifier', () => {
      store.set('key-1', 'license:first');
      store.set('key-1', 'license:second');
      expect(store.consume('key-1')).toBe('license:second');
    });

    it('stores multiple keys independently', () => {
      store.set('key-a', 'license:alice');
      store.set('key-b', 'license:bob');
      expect(store.consume('key-a')).toBe('license:alice');
      expect(store.consume('key-b')).toBe('license:bob');
    });
  });
});
