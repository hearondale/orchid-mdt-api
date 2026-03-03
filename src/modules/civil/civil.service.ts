import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Civil } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../../common/base/base.service';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
import { CreateCivilDto } from './dto/create-civil.dto';
import { UpdateCivilDto } from './dto/update-civil.dto';

@Injectable()
export class CivilService extends BaseService<
  Civil,
  CreateCivilDto,
  UpdateCivilDto
> {
  constructor(prisma: PrismaService, @Inject(CACHE_MANAGER) cache: Cache) {
    super(prisma, cache, 'civil');
  }

  async getPage(page: number, query?: string): Promise<PaginatedResult<Civil>> {
    const key = `civil:page:${page}:q:${query ?? ''}`;
    this.trackPageKey(key);
    return this.getCached(
      key,
      async () => {
        const q = query?.trim();
        const where = q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' as const } },
                { surname: { contains: q, mode: 'insensitive' as const } },
              ],
            }
          : {};

        const [data, total] = await Promise.all([
          this.prisma.civil.findMany({
            where,
            skip: (page - 1) * this.PAGE_SIZE,
            take: this.PAGE_SIZE,
            include: { officer: true },
          }),
          this.prisma.civil.count({ where }),
        ]);

        return { data, page, pageSize: this.PAGE_SIZE, total };
      },
      30_000,
    );
  }

  override async getById(id: number): Promise<Civil> {
    const key = `civil:id:${id}`;
    return this.getCached(key, async () => {
      const civil = await this.prisma.civil.findUnique({
        where: { id },
        include: {
          officer: { include: { department: true } },
          vehicles: true,
          weapons: true,
          arrestReports: { orderBy: { createdAt: 'desc' } },
        },
      });
      if (!civil) throw new NotFoundException(`Civil #${id} not found`);
      return civil as unknown as Civil;
    });
  }

  async create(dto: CreateCivilDto): Promise<Civil> {
    const civil = await this.prisma.civil.create({ data: dto });
    await this.invalidatePages();
    return civil;
  }

  async update(id: number, dto: UpdateCivilDto): Promise<Civil> {
    await this.getById(id);
    const civil = await this.prisma.civil.update({ where: { id }, data: dto });
    await this.invalidateId(id);
    await this.invalidatePages();
    return civil;
  }
}
