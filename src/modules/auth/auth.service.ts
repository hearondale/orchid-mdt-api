import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { HandshakeStore } from './handshake.store';
import { EmploymentStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly handshake: HandshakeStore,
  ) {}

  async login(key: string): Promise<{ access_token: string }> {
    const identifier = this.handshake.consume(key);
    if (!identifier) {
      throw new UnauthorizedException('Invalid or expired handshake key');
    }

    const officer = await this.prisma.officer.findUnique({
      where: { identifier },
    });

    if (!officer) {
      throw new UnauthorizedException('No officer profile found');
    }

    if (officer.employmentStatus !== EmploymentStatus.ACTIVE) {
      throw new UnauthorizedException('Officer is not active');
    }

    const payload = {
      sub: officer.id,
      identifier: officer.identifier,
      isAdmin: officer.isAdmin,
      departmentId: officer.departmentId,
    };

    return { access_token: this.jwt.sign(payload) };
  }
}
