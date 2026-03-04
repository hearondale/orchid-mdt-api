import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Department } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../../common/base/base.service';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService extends BaseService<
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto
> {
  constructor(prisma: PrismaService, @Inject(CACHE_MANAGER) cache: Cache) {
    super(prisma, cache, 'department');
  }

  async getPage(
    page: number,
    query?: string,
  ): Promise<PaginatedResult<Department>> {
    const q = query?.trim();
    const where = q
      ? { name: { contains: q, mode: 'insensitive' as const } }
      : {};

    const fetcher = async () => {
      const [data, total] = await Promise.all([
        this.prisma.department.findMany({
          where,
          skip: (page - 1) * this.PAGE_SIZE,
          take: this.PAGE_SIZE,
        }),
        this.prisma.department.count({ where }),
      ]);
      return { data, page, pageSize: this.PAGE_SIZE, total };
    };

    const key = `department:page:${page}:q:${q ?? ''}`;
    this.trackPageKey(key);
    return this.getCached(key, fetcher, q ? 15_000 : 30_000);
  }

  async create(dto: CreateDepartmentDto): Promise<Department> {
    const dept = await this.prisma.department.create({ data: dto });
    await this.invalidatePages();
    return dept;
  }

  async update(id: number, dto: UpdateDepartmentDto): Promise<Department> {
    await this.getById(id);
    const dept = await this.prisma.department.update({
      where: { id },
      data: dto,
    });
    await this.invalidateId(id);
    await this.invalidatePages();
    return dept;
  }
}
