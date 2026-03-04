import { NotFoundException } from '@nestjs/common';
import type { Cache } from '@nestjs/cache-manager';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { PaginatedResult } from '../dto/paginated-result.dto';

export abstract class BaseService<T, CreateDto, UpdateDto> {
  protected readonly PAGE_SIZE = 20;
  private readonly pageKeys = new Set<string>();

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly cache: Cache,
    protected readonly entityKey: string,
  ) {}

  protected async getCached<R>(
    key: string,
    fetcher: () => Promise<R>,
    ttl = 300_000,
  ): Promise<R> {
    const cached = await this.cache.get<R>(key);
    if (cached !== null && cached !== undefined) return cached;
    const result = await fetcher();
    await this.cache.set(key, result, ttl);
    return result;
  }

  protected async invalidateId(id: number): Promise<void> {
    await this.cache.del(`${this.entityKey}:id:${id}`);
  }

  async invalidatePages(): Promise<void> {
    await Promise.all([...this.pageKeys].map((k) => this.cache.del(k)));
    this.pageKeys.clear();
  }

  protected trackPageKey(key: string): void {
    this.pageKeys.add(key);
  }

  async getById(id: number): Promise<T> {
    const key = `${this.entityKey}:id:${id}`;
    return this.getCached(key, async () => {
      const record = await (this.prisma as any)[this.entityKey].findUnique({
        where: { id },
      });
      if (!record)
        throw new NotFoundException(`${this.entityKey} #${id} not found`);
      return record as T;
    });
  }

  async delete(id: number): Promise<void> {
    await (this.prisma as any)[this.entityKey].delete({ where: { id } });
    await this.invalidateId(id);
    await this.invalidatePages();
  }

  abstract getPage(page: number, query?: string): Promise<PaginatedResult<T>>;
  abstract create(data: CreateDto): Promise<T>;
  abstract update(id: number | string, data: UpdateDto): Promise<T>;
}
