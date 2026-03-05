import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmploymentStatus } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: number;
    identifier: string;
    isAdmin: boolean;
    departmentId: number;
  }) {
    const officer = await this.prisma.officer.findUnique({
      where: { id: payload.sub },
      include: { department: true },
    });

    if (!officer || officer.employmentStatus !== EmploymentStatus.ACTIVE) {
      throw new UnauthorizedException();
    }

    // Full officer (including permissions[]) is set as req.user
    return officer;
  }
}
