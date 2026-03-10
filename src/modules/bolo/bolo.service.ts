import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Bolo, BoloType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CivilService } from '../civil/civil.service';
import { VehicleService } from '../vehicle/vehicle.service';
import { WeaponService } from '../weapon/weapon.service';
import { BaseService } from '../../common/base/base.service';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
import { CreateBoloDto } from './dto/create-bolo.dto';
import { UpdateBoloDto } from './dto/update-bolo.dto';

const BOLO_INCLUDE = {
  issuedBy: { select: { id: true, badge: true, callsign: true } },
} as const;

@Injectable()
export class BoloService extends BaseService<
  Bolo,
  CreateBoloDto,
  UpdateBoloDto
> {
  constructor(
    prisma: PrismaService,
    @Inject(CACHE_MANAGER) cache: Cache,
    private readonly civilService: CivilService,
    private readonly vehicleService: VehicleService,
    private readonly weaponService: WeaponService,
  ) {
    super(prisma, cache, 'bolo');
  }

  async getPage(page: number, query?: string): Promise<PaginatedResult<Bolo>> {
    const q = query?.trim();
    const where = q
      ? {
          OR: [
            {
              targetIdentifier: {
                contains: q,
                mode: 'insensitive' as const,
              },
            },
            { description: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const fetcher = async () => {
      const [data, total] = await Promise.all([
        this.prisma.bolo.findMany({
          where,
          skip: (page - 1) * this.PAGE_SIZE,
          take: this.PAGE_SIZE,
          orderBy: { id: 'desc' },
        }),
        this.prisma.bolo.count({ where }),
      ]);
      return { data, page, pageSize: this.PAGE_SIZE, total };
    };

    const key = `bolo:page:${page}:q:${q ?? ''}`;
    this.trackPageKey(key);
    return this.getCached(key, fetcher, q ? 15_000 : 30_000);
  }

  override async getById(id: number): Promise<Bolo> {
    const key = `bolo:id:${id}`;
    return this.getCached(key, async () => {
      const bolo = await this.prisma.bolo.findUnique({
        where: { id },
        include: BOLO_INCLUDE,
      });
      if (!bolo) throw new NotFoundException(`BOLO #${id} not found`);
      return bolo;
    });
  }

  async create(dto: CreateBoloDto): Promise<Bolo> {
    await this.validateTarget(dto.targetType, dto.targetIdentifier);

    const bolo = await this.prisma.bolo.create({
      data: {
        issuedById: dto.issuedById!,
        targetType: dto.targetType,
        targetIdentifier: dto.targetIdentifier,
        description: dto.description,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
      include: BOLO_INCLUDE,
    });
    await this.invalidatePages();
    return bolo;
  }

  async update(id: number, dto: UpdateBoloDto): Promise<Bolo> {
    await this.getById(id);
    const bolo = await this.prisma.bolo.update({
      where: { id },
      data: {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
      include: BOLO_INCLUDE,
    });
    await this.invalidateId(id);
    await this.invalidatePages();
    return bolo;
  }

  async deactivate(id: number): Promise<Bolo> {
    await this.getById(id);
    const bolo = await this.prisma.bolo.update({
      where: { id },
      data: { active: false },
      include: BOLO_INCLUDE,
    });
    await this.invalidateId(id);
    await this.invalidatePages();
    return bolo;
  }

  private async validateTarget(
    type: BoloType,
    identifier: string,
  ): Promise<void> {
    if (type === BoloType.PERSON) {
      await this.civilService.getById(parseInt(identifier, 10));
    } else if (type === BoloType.VEHICLE) {
      const v = await this.vehicleService.findByPlate(identifier);
      if (!v)
        throw new NotFoundException(
          `Vehicle with plate ${identifier} not found`,
        );
    } else if (type === BoloType.WEAPON) {
      const w = await this.weaponService.findBySerial(identifier);
      if (!w)
        throw new NotFoundException(
          `Weapon with serial ${identifier} not found`,
        );
    }
  }
}
