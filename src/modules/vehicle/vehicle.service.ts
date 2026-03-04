import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Vehicle } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../../common/base/base.service';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

const VEHICLE_INCLUDE = { owner: true } as const;

@Injectable()
export class VehicleService extends BaseService<
  Vehicle,
  CreateVehicleDto,
  UpdateVehicleDto
> {
  constructor(prisma: PrismaService, @Inject(CACHE_MANAGER) cache: Cache) {
    super(prisma, cache, 'vehicle');
  }

  async getPage(
    page: number,
    query?: string,
  ): Promise<PaginatedResult<Vehicle>> {
    const q = query?.trim();
    const where = q
      ? {
          OR: [
            { plate: { contains: q, mode: 'insensitive' as const } },
            { make: { contains: q, mode: 'insensitive' as const } },
            { model: { contains: q, mode: 'insensitive' as const } },
            {
              owner: {
                name: { contains: q, mode: 'insensitive' as const },
              },
            },
          ],
        }
      : {};

    const fetcher = async () => {
      const [data, total] = await Promise.all([
        this.prisma.vehicle.findMany({
          where,
          skip: (page - 1) * this.PAGE_SIZE,
          take: this.PAGE_SIZE,
          include: VEHICLE_INCLUDE,
        }),
        this.prisma.vehicle.count({ where }),
      ]);
      return { data, page, pageSize: this.PAGE_SIZE, total };
    };

    const key = `vehicle:page:${page}:q:${q ?? ''}`;
    this.trackPageKey(key);
    return this.getCached(key, fetcher, q ? 15_000 : 30_000);
  }

  override async getById(id: number): Promise<Vehicle> {
    const key = `vehicle:id:${id}`;
    return this.getCached(key, async () => {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id },
        include: VEHICLE_INCLUDE,
      });
      if (!vehicle) throw new NotFoundException(`Vehicle #${id} not found`);
      return vehicle;
    });
  }

  async create(dto: CreateVehicleDto): Promise<Vehicle> {
    const existing = await this.prisma.vehicle.findFirst({
      where: { OR: [{ plate: dto.plate }, { vin: dto.vin }] },
    });
    if (existing) {
      throw new ConflictException(
        existing.plate === dto.plate
          ? 'Plate already in use'
          : 'VIN already in use',
      );
    }
    const vehicle = await this.prisma.vehicle.create({
      data: dto,
      include: VEHICLE_INCLUDE,
    });
    await this.invalidatePages();
    return vehicle;
  }

  async update(plate: string, dto: UpdateVehicleDto): Promise<Vehicle> {
    const existing = await this.prisma.vehicle.findUnique({ where: { plate } });
    if (!existing)
      throw new NotFoundException(`Vehicle with plate ${plate} not found`);
    const vehicle = await this.prisma.vehicle.update({
      where: { plate },
      data: dto,
      include: VEHICLE_INCLUDE,
    });
    await this.invalidateId(existing.id);
    await this.invalidatePages();
    return vehicle;
  }

  async markStolen(plate: string, stolen: boolean): Promise<Vehicle> {
    const existing = await this.prisma.vehicle.findUnique({ where: { plate } });
    if (!existing)
      throw new NotFoundException(`Vehicle with plate ${plate} not found`);
    const vehicle = await this.prisma.vehicle.update({
      where: { plate },
      data: { stolen },
      include: VEHICLE_INCLUDE,
    });
    await this.invalidateId(existing.id);
    await this.invalidatePages();
    return vehicle;
  }

  async deleteByPlate(plate: string): Promise<void> {
    const existing = await this.prisma.vehicle.findUnique({ where: { plate } });
    if (!existing)
      throw new NotFoundException(`Vehicle with plate ${plate} not found`);
    await this.prisma.vehicle.delete({ where: { plate } });
    await this.invalidateId(existing.id);
    await this.invalidatePages();
  }

  async findByPlate(plate: string): Promise<Vehicle | null> {
    return this.prisma.vehicle.findUnique({ where: { plate } });
  }
}
