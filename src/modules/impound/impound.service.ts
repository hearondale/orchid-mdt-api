import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Impound } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../../common/base/base.service';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
import { CreateImpoundDto } from './dto/create-impound.dto';
import { UpdateImpoundDto } from './dto/update-impound.dto';

const IMPOUND_INCLUDE = {
  issuedBy: {
    select: {
      id: true,
      badge: true,
      civil: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
} as const;

@Injectable()
export class ImpoundService extends BaseService<
  Impound,
  CreateImpoundDto,
  UpdateImpoundDto
> {
  constructor(prisma: PrismaService, @Inject(CACHE_MANAGER) cache: Cache) {
    super(prisma, cache, 'impound');
  }

  async getPage(
    page: number,
    query?: string,
  ): Promise<PaginatedResult<Impound>> {
    const q = query?.trim();
    const where = q
      ? {
          OR: [
            { plate: { contains: q, mode: 'insensitive' as const } },
            { ownerName: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const fetcher = async () => {
      const [data, total] = await Promise.all([
        this.prisma.impound.findMany({
          where,
          skip: (page - 1) * this.PAGE_SIZE,
          take: this.PAGE_SIZE,
          include: IMPOUND_INCLUDE,
          orderBy: { id: 'desc' },
        }),
        this.prisma.impound.count({ where }),
      ]);
      return { data, page, pageSize: this.PAGE_SIZE, total };
    };

    const key = `impound:page:${page}:q:${q ?? ''}`;
    this.trackPageKey(key);
    return this.getCached(key, fetcher, q ? 15_000 : 30_000);
  }

  override async getById(id: number): Promise<Impound> {
    const key = `impound:id:${id}`;
    return this.getCached(key, async () => {
      const impound = await this.prisma.impound.findUnique({
        where: { id },
        include: IMPOUND_INCLUDE,
      });
      if (!impound) throw new NotFoundException(`Impound #${id} not found`);
      return impound;
    });
  }

  async create(dto: CreateImpoundDto): Promise<Impound> {
    const impound = await this.prisma.impound.create({
      data: {
        plate: dto.plate,
        make: dto.make,
        model: dto.model,
        color: dto.color,
        ownerName: dto.ownerName,
        reason: dto.reason,
        price: dto.price,
        releaseDate: new Date(dto.releaseDate),
        issuedById: dto.issuedById!,
      },
      include: IMPOUND_INCLUDE,
    });
    await this.invalidatePages();
    return impound;
  }

  async update(id: number, dto: UpdateImpoundDto): Promise<Impound> {
    await this.getById(id);
    const impound = await this.prisma.impound.update({
      where: { id },
      data: {
        ...dto,
        releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : undefined,
      },
      include: IMPOUND_INCLUDE,
    });
    await this.invalidateId(id);
    await this.invalidatePages();
    return impound;
  }
}
