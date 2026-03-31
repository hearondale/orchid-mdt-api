import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { OrderableItem, OrderItemType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../../common/base/base.service';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
import { CreateOrderableItemDto } from './dto/create-orderable-item.dto';
import { UpdateOrderableItemDto } from './dto/update-orderable-item.dto';

const ITEM_INCLUDE = {
  departments: { include: { department: true } },
} as const;

@Injectable()
export class OrderableItemService extends BaseService<
  OrderableItem,
  CreateOrderableItemDto,
  UpdateOrderableItemDto
> {
  constructor(prisma: PrismaService, @Inject(CACHE_MANAGER) cache: Cache) {
    super(prisma, cache, 'orderableItem');
  }

  async getPage(
    page: number,
    query?: string,
  ): Promise<PaginatedResult<OrderableItem>> {
    const type = query?.toUpperCase() as OrderItemType | undefined;

    if (
      type &&
      OrderItemType[type.toUpperCase() as keyof typeof OrderItemType] ===
        undefined
    ) {
      throw new NotFoundException(`Invalid order type: ${query}`);
    }

    const where = type ? { type: type } : {};

    const fetcher = async () => {
      const [data, total] = await Promise.all([
        this.prisma.orderableItem.findMany({
          where,
          skip: (page - 1) * this.PAGE_SIZE,
          take: this.PAGE_SIZE,
        }),
        this.prisma.orderableItem.count({ where }),
      ]);
      return { data, page, pageSize: this.PAGE_SIZE, total };
    };

    if (!type) {
      const key = `orderableItem:page:${page}:type:`;
      this.trackPageKey(key);
      return this.getCached(key, fetcher, 30_000);
    }

    return fetcher();
  }

  override async getById(id: number): Promise<OrderableItem> {
    const key = `orderableItem:id:${id}`;
    return this.getCached(key, async () => {
      const item = await this.prisma.orderableItem.findUnique({
        where: { id },
        include: ITEM_INCLUDE,
      });
      if (!item) throw new NotFoundException(`OrderableItem #${id} not found`);
      return item;
    });
  }

  async create(dto: CreateOrderableItemDto): Promise<OrderableItem> {
    const { departmentIds, ...data } = dto;
    const item = await this.prisma.$transaction(async (tx) => {
      const created = await tx.orderableItem.create({ data });
      await tx.orderableItemDepartment.createMany({
        data: departmentIds.map((departmentId) => ({
          itemId: created.id,
          departmentId,
        })),
      });
      return tx.orderableItem.findUnique({
        where: { id: created.id },
        include: ITEM_INCLUDE,
      });
    });
    await this.invalidatePages();
    return item!;
  }

  async update(
    id: number,
    dto: UpdateOrderableItemDto,
  ): Promise<OrderableItem> {
    const { departmentIds, ...data } = dto;
    const item = await this.prisma.$transaction(async (tx) => {
      if (departmentIds !== undefined) {
        await tx.orderableItemDepartment.deleteMany({ where: { itemId: id } });
        await tx.orderableItemDepartment.createMany({
          data: departmentIds.map((departmentId) => ({
            itemId: id,
            departmentId,
          })),
        });
      }
      return tx.orderableItem.update({
        where: { id },
        data,
        include: ITEM_INCLUDE,
      });
    });
    await this.invalidateId(id);
    await this.invalidatePages();
    return item;
  }
}
