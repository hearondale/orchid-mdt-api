import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Weapon } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../../common/base/base.service';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
import { CreateWeaponDto } from './dto/create-weapon.dto';
import { UpdateWeaponDto } from './dto/update-weapon.dto';

const WEAPON_INCLUDE = { owner: true } as const;

@Injectable()
export class WeaponService extends BaseService<
  Weapon,
  CreateWeaponDto,
  UpdateWeaponDto
> {
  constructor(prisma: PrismaService, @Inject(CACHE_MANAGER) cache: Cache) {
    super(prisma, cache, 'weapon');
  }

  async getPage(
    page: number,
    query?: string,
  ): Promise<PaginatedResult<Weapon>> {
    const q = query?.trim();
    const where = q
      ? {
          OR: [
            { serialNumber: { contains: q, mode: 'insensitive' as const } },
            { weaponType: { contains: q, mode: 'insensitive' as const } },
            {
              owner: {
                firstName: { contains: q, mode: 'insensitive' as const },
              },
            },
          ],
        }
      : {};

    const fetcher = async () => {
      const [data, total] = await Promise.all([
        this.prisma.weapon.findMany({
          where,
          skip: (page - 1) * this.PAGE_SIZE,
          take: this.PAGE_SIZE,
          select: {
            id: true,
            serialNumber: true,
            weaponType: true,
            registered: true,
            stolen: true,
            ownerId: true,
            owner: { select: { id: true, firstName: true, lastName: true } },
          },
        }),
        this.prisma.weapon.count({ where }),
      ]);
      return {
        data: data as unknown as Weapon[],
        page,
        pageSize: this.PAGE_SIZE,
        total,
      };
    };

    const key = `weapon:page:${page}:q:${q ?? ''}`;
    this.trackPageKey(key);
    return this.getCached(key, fetcher, q ? 15_000 : 30_000);
  }

  override async getById(id: number): Promise<Weapon> {
    const key = `weapon:id:${id}`;
    return this.getCached(key, async () => {
      const weapon = await this.prisma.weapon.findUnique({
        where: { id },
        include: WEAPON_INCLUDE,
      });
      if (!weapon) throw new NotFoundException(`Weapon #${id} not found`);
      return weapon;
    });
  }

  async create(dto: CreateWeaponDto): Promise<Weapon> {
    const existing = await this.prisma.weapon.findUnique({
      where: { serialNumber: dto.serialNumber },
    });
    if (existing) throw new ConflictException('Serial number already in use');
    const weapon = await this.prisma.weapon.create({
      data: dto,
      include: WEAPON_INCLUDE,
    });
    await this.invalidatePages();
    return weapon;
  }

  async update(serial: string, dto: UpdateWeaponDto): Promise<Weapon> {
    const existing = await this.prisma.weapon.findUnique({
      where: { serialNumber: serial },
    });
    if (!existing)
      throw new NotFoundException(`Weapon with serial ${serial} not found`);
    const weapon = await this.prisma.weapon.update({
      where: { serialNumber: serial },
      data: dto,
      include: WEAPON_INCLUDE,
    });
    await this.invalidateId(existing.id);
    await this.invalidatePages();
    return weapon;
  }

  async markStolen(serial: string, stolen: boolean): Promise<Weapon> {
    const existing = await this.prisma.weapon.findUnique({
      where: { serialNumber: serial },
    });
    if (!existing)
      throw new NotFoundException(`Weapon with serial ${serial} not found`);
    const weapon = await this.prisma.weapon.update({
      where: { serialNumber: serial },
      data: { stolen },
      include: WEAPON_INCLUDE,
    });
    await this.invalidateId(existing.id);
    await this.invalidatePages();
    return weapon;
  }

  async deleteBySerial(serialNumber: string): Promise<void> {
    const existing = await this.prisma.weapon.findUnique({
      where: { serialNumber },
    });
    if (!existing)
      throw new NotFoundException(
        `Weapon with serial ${serialNumber} not found`,
      );
    await this.prisma.weapon.delete({ where: { serialNumber } });
    await this.invalidateId(existing.id);
    await this.invalidatePages();
  }

  async findBySerial(serialNumber: string): Promise<Weapon | null> {
    return this.prisma.weapon.findUnique({ where: { serialNumber } });
  }
}
