import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';
import { EmploymentStatus, Officer, Department } from '@prisma/client';

export type OfficerWithDept = Officer & {
  department: Department;
  identifier: string;
};

export const officerAuthCacheKey = (id: number) => `officer:auth:${id}`;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly cacheTtl: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
    this.cacheTtl = parseInt(
      config.get<string>('OFFICER_CACHE_TTL') ?? '300000',
      10,
    );
  }

  async validate(payload: {
    sub: number;
    identifier: string;
    isAdmin: boolean;
    departmentId: number;
  }) {
    const key = officerAuthCacheKey(payload.sub);

    const cached = await this.cache.get<OfficerWithDept>(key);
    if (cached) return cached;

    const officer = await this.prisma.officer.findUnique({
      where: { id: payload.sub },
      include: { department: true },
    });

    if (!officer || officer.employmentStatus !== EmploymentStatus.ACTIVE) {
      throw new UnauthorizedException();
    }

    const result = { ...officer, identifier: payload.identifier };
    await this.cache.set(key, result, this.cacheTtl);
    return result;
  }
}
