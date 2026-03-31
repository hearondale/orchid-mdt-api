import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { HandshakeStore } from './handshake.store';
import { ConnectedStore } from './connected.store';
import { EmploymentStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly handshake: HandshakeStore,
    private readonly connected: ConnectedStore,
  ) {}

  async login(key: string): Promise<{ access_token: string }> {
    console.log('Login attempt with key:', key);
    const identifier = this.handshake.consume(key);
    if (!identifier) {
      throw new UnauthorizedException('Invalid or expired handshake key');
    }

    const civil = await this.prisma.civil.findUnique({
      where: { identifier },
      include: { officer: true },
    });

    if (!civil?.officer) {
      throw new UnauthorizedException('No officer profile found');
    }

    const officer = civil.officer;

    if (officer.employmentStatus !== EmploymentStatus.ACTIVE) {
      throw new UnauthorizedException('Officer is not active');
    }

    const payload = {
      sub: officer.id,
      identifier,
      isAdmin: officer.isAdmin,
      departmentId: officer.departmentId,
    };

    return { access_token: this.jwt.sign(payload) };
  }

  async browserLogin(badge: string): Promise<{ access_token: string }> {
    const officer = await this.prisma.officer.findUnique({
      where: { badge },
      include: { civil: true },
    });

    if (!officer) {
      throw new UnauthorizedException('Invalid badge');
    }

    const identifier = officer.civil.identifier ?? '';

    if (!this.connected.has(identifier)) {
      throw new UnauthorizedException(
        'Officer is not connected to the game server',
      );
    }

    if (officer.employmentStatus !== EmploymentStatus.ACTIVE) {
      throw new UnauthorizedException('Officer is not active');
    }

    const payload = {
      sub: officer.id,
      identifier,
      isAdmin: officer.isAdmin,
      departmentId: officer.departmentId,
    };

    return { access_token: this.jwt.sign(payload) };
  }

  async devLogin(identifier?: string): Promise<{ access_token: string }> {
    if (process.env.NODE_ENV === 'production') {
      throw new NotFoundException();
    }

    const id = identifier ?? process.env.SEED_IDENTIFIER;
    if (!id) {
      throw new UnauthorizedException('No identifier provided');
    }

    const civil = await this.prisma.civil.findUnique({
      where: { identifier: id },
      include: { officer: true },
    });

    if (!civil?.officer) {
      throw new UnauthorizedException('No officer profile found');
    }

    const officer = civil.officer;

    if (officer.employmentStatus !== EmploymentStatus.ACTIVE) {
      throw new UnauthorizedException('Officer is not active');
    }

    const payload = {
      sub: officer.id,
      identifier: id,
      isAdmin: officer.isAdmin,
      departmentId: officer.departmentId,
    };

    return { access_token: this.jwt.sign(payload) };
  }
}
