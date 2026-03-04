import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Officer } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UnitManagerService } from '../unit-manager/unit-manager.service';
import { CivilService } from '../civil/civil.service';
import { BaseService } from '../../common/base/base.service';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { UpdateOfficerDto } from './dto/update-officer.dto';
import { DutyStatus, OfficerRuntime } from '../../common/types/runtime.types';
import { OnboardOfficerDto } from './dto/onboard-officer.dto';

const OFFICER_INCLUDE = {
  civil: true,
  department: true,
} as const;

@Injectable()
export class OfficerService extends BaseService<
  Officer,
  CreateOfficerDto,
  UpdateOfficerDto
> {
  constructor(
    prisma: PrismaService,
    @Inject(CACHE_MANAGER) cache: Cache,
    private readonly unitManager: UnitManagerService,
    private readonly civilService: CivilService,
  ) {
    super(prisma, cache, 'officer');
  }

  async getPage(
    page: number,
    query?: string,
  ): Promise<PaginatedResult<Officer>> {
    const q = query?.trim();
    const hasDigit = q ? /\d/.test(q) : false;
    const where = q
      ? {
          OR: hasDigit
            ? [
                { badge: { contains: q, mode: 'insensitive' as const } },
                { callsign: { contains: q, mode: 'insensitive' as const } },
              ]
            : [
                {
                  civil: {
                    name: { contains: q, mode: 'insensitive' as const },
                  },
                },
                {
                  civil: {
                    surname: { contains: q, mode: 'insensitive' as const },
                  },
                },
              ],
        }
      : {};

    const fetcher = async () => {
      const [data, total] = await Promise.all([
        this.prisma.officer.findMany({
          where,
          skip: (page - 1) * this.PAGE_SIZE,
          take: this.PAGE_SIZE,
          include: OFFICER_INCLUDE,
        }),
        this.prisma.officer.count({ where }),
      ]);
      return { data, page, pageSize: this.PAGE_SIZE, total };
    };

    const key = `officer:page:${page}:q:${q ?? ''}`;
    this.trackPageKey(key);
    return this.getCached(key, fetcher, q ? 15_000 : 30_000);
  }

  override async getById(id: number): Promise<Officer> {
    const key = `officer:id:${id}`;
    return this.getCached(key, async () => {
      const officer = await this.prisma.officer.findUnique({
        where: { id },
        include: OFFICER_INCLUDE,
      });
      if (!officer) throw new NotFoundException(`Officer #${id} not found`);
      return officer;
    });
  }

  async create(dto: CreateOfficerDto): Promise<Officer> {
    const existing = await this.prisma.officer.findFirst({
      where: {
        OR: [{ badge: dto.badge }, { identifier: dto.identifier }],
      },
    });

    if (existing) {
      throw new ConflictException(
        existing.badge === dto.badge
          ? 'Badge already in use'
          : 'Identifier already in use',
      );
    }

    const officer = await this.prisma.officer.create({
      data: dto,
      include: OFFICER_INCLUDE,
    });
    await this.invalidatePages();
    return officer;
  }

  async update(id: number, dto: UpdateOfficerDto): Promise<Officer> {
    await this.getById(id);
    const officer = await this.prisma.officer.update({
      where: { id },
      data: dto,
      include: OFFICER_INCLUDE,
    });
    await this.invalidateId(id);
    await this.invalidatePages();
    return officer;
  }

  async setDutyStatus(
    id: number,
    dutyStatus: DutyStatus,
  ): Promise<OfficerRuntime> {
    const officer = await this.getById(id);
    const runtime = this.unitManager.getOnlineOfficer(officer.identifier);

    if (!runtime) {
      const base: OfficerRuntime = {
        ...officer,
        dutyStatus: DutyStatus.OFF_DUTY,
        unitId: null,
        cadCallId: null,
      };
      this.unitManager.setOnline(base);
    }

    const updated = this.unitManager.setDutyStatus(
      officer.identifier,
      dutyStatus,
    );
    return updated!;
  }

  async getRuntimeState(id: number): Promise<OfficerRuntime | null> {
    const officer = await this.getById(id);
    return this.unitManager.getOnlineOfficer(officer.identifier);
  }

  async onboard(dto: OnboardOfficerDto) {
    const existing = await this.prisma.officer.findFirst({
      where: {
        OR: [{ badge: dto.badge }, { identifier: dto.identifier }],
      },
    });

    if (existing) {
      throw new ConflictException(
        existing.badge === dto.badge
          ? 'Badge already in use'
          : 'Identifier already in use',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const civil = await tx.civil.create({
        data: {
          name: dto.name,
          surname: dto.surname,
          dob: dto.dob,
          licenses: dto.licenses,
        },
      });

      return tx.officer.create({
        data: {
          civilId: civil.id,
          departmentId: dto.departmentId,
          identifier: dto.identifier,
          badge: dto.badge,
          callsign: dto.callsign,
          rank: dto.rank,
          isAdmin: dto.isAdmin ?? false,
          permissions: dto.permissions ?? [],
        },
        include: OFFICER_INCLUDE,
      });
    });

    await this.invalidatePages();
    await this.civilService.invalidatePages();
    return result;
  }

  async updateCallsign(
    id: number,
    callsign: string,
  ): Promise<OfficerRuntime | null> {
    const officer = await this.getById(id);
    const runtime = this.unitManager.getOnlineOfficer(officer.identifier);
    if (runtime) {
      runtime.callsign = callsign;
    }
    return runtime;
  }
}
