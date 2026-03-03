import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PenalCode } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../../common/base/base.service';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
import { CreatePenalCodeDto } from './dto/create-penal-code.dto';
import { UpdatePenalCodeDto } from './dto/update-penal-code.dto';

@Injectable()
export class PenalCodeService extends BaseService<
  PenalCode,
  CreatePenalCodeDto,
  UpdatePenalCodeDto
> {
  constructor(prisma: PrismaService, @Inject(CACHE_MANAGER) cache: Cache) {
    super(prisma, cache, 'penalCode');
  }

  async getPage(
    page: number,
    query?: string,
  ): Promise<PaginatedResult<PenalCode>> {
    const key = `penalCode:page:${page}:q:${query ?? ''}`;
    this.trackPageKey(key);
    return this.getCached(
      key,
      async () => {
        const q = query?.trim();
        const where = q
          ? {
              OR: [
                { code: { contains: q, mode: 'insensitive' as const } },
                { title: { contains: q, mode: 'insensitive' as const } },
                { category: { contains: q, mode: 'insensitive' as const } },
              ],
            }
          : {};

        const [data, total] = await Promise.all([
          this.prisma.penalCode.findMany({
            where,
            skip: (page - 1) * this.PAGE_SIZE,
            take: this.PAGE_SIZE,
          }),
          this.prisma.penalCode.count({ where }),
        ]);

        return { data, page, pageSize: this.PAGE_SIZE, total };
      },
      30_000,
    );
  }

  async getByCode(code: string): Promise<PenalCode> {
    const key = `penalCode:code:${code}`;
    return this.getCached(key, async () => {
      const penalCode = await this.prisma.penalCode.findUnique({
        where: { code },
      });
      if (!penalCode)
        throw new NotFoundException(`Penal code "${code}" not found`);
      return penalCode;
    });
  }

  async findManyByIds(ids: number[]): Promise<PenalCode[]> {
    return this.prisma.penalCode.findMany({ where: { id: { in: ids } } });
  }

  async create(dto: CreatePenalCodeDto): Promise<PenalCode> {
    const existing = await this.prisma.penalCode.findUnique({
      where: { code: dto.code },
    });
    if (existing)
      throw new ConflictException(`Code "${dto.code}" already exists`);
    const penalCode = await this.prisma.penalCode.create({ data: dto });
    await this.invalidatePages();
    return penalCode;
  }

  async update(id: number, dto: UpdatePenalCodeDto): Promise<PenalCode> {
    await this.getById(id);
    const penalCode = await this.prisma.penalCode.update({
      where: { id },
      data: dto,
    });
    await this.invalidateId(id);
    await this.invalidatePages();
    return penalCode;
  }
}
