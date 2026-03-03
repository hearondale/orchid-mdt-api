/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FivemGateway } from './fivem.gateway';
import { HandshakeStore } from '../auth/handshake.store';
import { UnitManagerService } from '../unit-manager/unit-manager.service';
import { DispatchService } from '../dispatch/dispatch.service';

const mockSocket = (secret?: string) =>
  ({
    handshake: { auth: { secret } },
    disconnect: jest.fn(),
  }) as any;

describe('FivemGateway', () => {
  let gateway: FivemGateway;
  let config: { get: jest.Mock };
  let handshake: { set: jest.Mock };
  let unitManager: {
    officerDisconnected: jest.Mock;
    getOnlineOfficer: jest.Mock;
  };
  let dispatch: { assignUnit: jest.Mock };

  beforeEach(async () => {
    config = { get: jest.fn().mockReturnValue('test-secret') };
    handshake = { set: jest.fn() };
    unitManager = {
      officerDisconnected: jest.fn(),
      getOnlineOfficer: jest.fn(),
    };
    dispatch = { assignUnit: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FivemGateway,
        { provide: ConfigService, useValue: config },
        { provide: HandshakeStore, useValue: handshake },
        { provide: UnitManagerService, useValue: unitManager },
        { provide: DispatchService, useValue: dispatch },
      ],
    }).compile();

    gateway = module.get<FivemGateway>(FivemGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  // ── handleConnection ───────────────────────────────────────────────────────

  describe('handleConnection', () => {
    it('accepts a client with the correct secret', () => {
      const client = mockSocket('test-secret');
      gateway.handleConnection(client);
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('disconnects a client with a wrong secret', () => {
      const client = mockSocket('wrong-secret');
      gateway.handleConnection(client);
      expect(client.disconnect).toHaveBeenCalledWith(true);
    });

    it('disconnects a client with no secret', () => {
      const client = mockSocket(undefined);
      gateway.handleConnection(client);
      expect(client.disconnect).toHaveBeenCalledWith(true);
    });
  });

  // ── player:handshake ───────────────────────────────────────────────────────

  describe('handleHandshake', () => {
    it('stores the key and returns { ok: true } for valid data', () => {
      const result = gateway.handleHandshake({
        key: 'abc123',
        identifier: 'license:test',
      });

      expect(handshake.set).toHaveBeenCalledWith('abc123', 'license:test');
      expect(result).toEqual({ ok: true });
    });

    it('returns { ok: false } when key is missing', () => {
      const result = gateway.handleHandshake({
        key: '',
        identifier: 'license:test',
      });
      expect(result).toEqual({ ok: false });
      expect(handshake.set).not.toHaveBeenCalled();
    });

    it('returns { ok: false } when identifier is missing', () => {
      const result = gateway.handleHandshake({ key: 'abc123', identifier: '' });
      expect(result).toEqual({ ok: false });
      expect(handshake.set).not.toHaveBeenCalled();
    });

    it('returns { ok: false } for null data', () => {
      const result = gateway.handleHandshake(null as any);
      expect(result).toEqual({ ok: false });
      expect(handshake.set).not.toHaveBeenCalled();
    });
  });

  // ── player:disconnect ──────────────────────────────────────────────────────

  describe('handlePlayerDisconnect', () => {
    it('calls officerDisconnected with the identifier', () => {
      gateway.handlePlayerDisconnect({ identifier: 'license:cop1' });
      expect(unitManager.officerDisconnected).toHaveBeenCalledWith(
        'license:cop1',
      );
    });

    it('does nothing when identifier is missing', () => {
      gateway.handlePlayerDisconnect({ identifier: '' });
      expect(unitManager.officerDisconnected).not.toHaveBeenCalled();
    });

    it('does nothing for null data', () => {
      gateway.handlePlayerDisconnect(null as any);
      expect(unitManager.officerDisconnected).not.toHaveBeenCalled();
    });
  });

  // ── call:response ──────────────────────────────────────────────────────────

  describe('handleCallResponse', () => {
    it('assigns unit when call is accepted and officer has a unitId', async () => {
      unitManager.getOnlineOfficer.mockReturnValue({ unitId: 'unit-42' });

      await gateway.handleCallResponse({
        callId: 10,
        identifier: 'license:cop1',
        accepted: true,
      });

      expect(dispatch.assignUnit).toHaveBeenCalledWith(10, 'unit-42');
    });

    it('does nothing when accepted is false', async () => {
      await gateway.handleCallResponse({
        callId: 10,
        identifier: 'license:cop1',
        accepted: false,
      });

      expect(dispatch.assignUnit).not.toHaveBeenCalled();
      expect(unitManager.getOnlineOfficer).not.toHaveBeenCalled();
    });

    it('does nothing when callId is missing', async () => {
      await gateway.handleCallResponse({
        callId: 0,
        identifier: 'license:cop1',
        accepted: true,
      });

      expect(dispatch.assignUnit).not.toHaveBeenCalled();
    });

    it('does nothing when identifier is missing', async () => {
      await gateway.handleCallResponse({
        callId: 10,
        identifier: '',
        accepted: true,
      });

      expect(dispatch.assignUnit).not.toHaveBeenCalled();
    });

    it('does nothing when the officer is not online', async () => {
      unitManager.getOnlineOfficer.mockReturnValue(null);

      await gateway.handleCallResponse({
        callId: 10,
        identifier: 'license:offline',
        accepted: true,
      });

      expect(dispatch.assignUnit).not.toHaveBeenCalled();
    });

    it('does nothing when the officer has no unitId', async () => {
      unitManager.getOnlineOfficer.mockReturnValue({ unitId: null });

      await gateway.handleCallResponse({
        callId: 10,
        identifier: 'license:cop1',
        accepted: true,
      });

      expect(dispatch.assignUnit).not.toHaveBeenCalled();
    });

    it('does nothing for null data', async () => {
      await gateway.handleCallResponse(null as any);
      expect(dispatch.assignUnit).not.toHaveBeenCalled();
    });
  });
});
