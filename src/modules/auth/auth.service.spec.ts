import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmploymentStatus } from '@prisma/client';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { HandshakeStore } from './handshake.store';

const mockOfficer = {
  id: 1,
  identifier: 'license:test123',
  isAdmin: false,
  departmentId: 2,
  employmentStatus: EmploymentStatus.ACTIVE,
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { officer: { findUnique: jest.Mock } };
  let jwt: { sign: jest.Mock };
  let handshake: { consume: jest.Mock };

  beforeEach(async () => {
    prisma = { officer: { findUnique: jest.fn() } };
    jwt = { sign: jest.fn() };
    handshake = { consume: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: HandshakeStore, useValue: handshake },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('returns an access_token for a valid key and active officer', async () => {
      handshake.consume.mockReturnValue('license:test123');
      prisma.officer.findUnique.mockResolvedValue(mockOfficer);
      jwt.sign.mockReturnValue('signed.jwt.token');

      const result = await service.login('valid-key');

      expect(result).toEqual({ access_token: 'signed.jwt.token' });
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: mockOfficer.id,
        identifier: mockOfficer.identifier,
        isAdmin: mockOfficer.isAdmin,
        departmentId: mockOfficer.departmentId,
      });
    });

    it('throws UnauthorizedException for an invalid or expired key', async () => {
      handshake.consume.mockReturnValue(null);

      await expect(service.login('bad-key')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.officer.findUnique).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when no officer profile exists', async () => {
      handshake.consume.mockReturnValue('license:unknown');
      prisma.officer.findUnique.mockResolvedValue(null);

      await expect(service.login('valid-key')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException for a SUSPENDED officer', async () => {
      handshake.consume.mockReturnValue('license:test123');
      prisma.officer.findUnique.mockResolvedValue({
        ...mockOfficer,
        employmentStatus: EmploymentStatus.SUSPENDED,
      });

      await expect(service.login('valid-key')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException for an officer on VACATION', async () => {
      handshake.consume.mockReturnValue('license:test123');
      prisma.officer.findUnique.mockResolvedValue({
        ...mockOfficer,
        employmentStatus: EmploymentStatus.VACATION,
      });

      await expect(service.login('valid-key')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('queries the officer by the identifier returned from handshake', async () => {
      handshake.consume.mockReturnValue('license:specific');
      prisma.officer.findUnique.mockResolvedValue(null);

      await expect(service.login('key')).rejects.toThrow(UnauthorizedException);
      expect(prisma.officer.findUnique).toHaveBeenCalledWith({
        where: { identifier: 'license:specific' },
      });
    });
  });
});
