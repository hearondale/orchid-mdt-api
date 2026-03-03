import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CallStatus, DispatchCall } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UnitManagerService } from '../unit-manager/unit-manager.service';
import { MdtGatewayService } from '../mdt/mdt-gateway.service';
import { BaseService } from '../../common/base/base.service';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
import { CadCallRuntime } from '../../common/types/runtime.types';
import { CreateDispatchCallDto } from './dto/create-dispatch-call.dto';
import { UpdateDispatchCallDto } from './dto/update-dispatch-call.dto';

@Injectable()
export class DispatchService extends BaseService<
  DispatchCall,
  CreateDispatchCallDto,
  UpdateDispatchCallDto
> {
  constructor(
    prisma: PrismaService,
    @Inject(CACHE_MANAGER) cache: Cache,
    private readonly unitManager: UnitManagerService,
    private readonly mdtGateway: MdtGatewayService,
  ) {
    super(prisma, cache, 'dispatchCall');
  }

  async getPage(
    page: number,
    query?: string,
  ): Promise<PaginatedResult<DispatchCall>> {
    const key = `dispatchCall:page:${page}:q:${query ?? ''}`;
    this.trackPageKey(key);
    return this.getCached(
      key,
      async () => {
        const q = query?.trim();
        const where = q
          ? {
              OR: [
                { code: { contains: q, mode: 'insensitive' as const } },
                { message: { contains: q, mode: 'insensitive' as const } },
                { location: { contains: q, mode: 'insensitive' as const } },
              ],
            }
          : {};

        const [data, total] = await Promise.all([
          this.prisma.dispatchCall.findMany({
            where,
            skip: (page - 1) * this.PAGE_SIZE,
            take: this.PAGE_SIZE,
            orderBy: { createdAt: 'desc' },
          }),
          this.prisma.dispatchCall.count({ where }),
        ]);

        return { data, page, pageSize: this.PAGE_SIZE, total };
      },
      30_000,
    );
  }

  override async getById(id: number): Promise<CadCallRuntime> {
    const key = `dispatchCall:id:${id}`;
    return this.getCached(key, async () => {
      const call = await this.prisma.dispatchCall.findUnique({ where: { id } });
      if (!call) throw new NotFoundException(`Dispatch call #${id} not found`);
      const units = this.unitManager.getUnitSnapshots(
        this.unitManager.getUnit(String(id))?.id ?? '',
      );
      return { ...call, units } as CadCallRuntime;
    });
  }

  async create(dto: CreateDispatchCallDto): Promise<CadCallRuntime> {
    const call = await this.prisma.dispatchCall.create({ data: dto });
    await this.invalidatePages();
    const runtime: CadCallRuntime = { ...call, units: [] };
    // Broadcast to all departments — use departmentId 0 as broadcast workaround
    // In practice, dispatch is broadcast to the department that owns the call
    this.mdtGateway.broadcastToDepartment(0, 'dispatch:created', runtime);
    return runtime;
  }

  async update(
    id: number,
    dto: UpdateDispatchCallDto,
  ): Promise<CadCallRuntime> {
    await this.getById(id);
    const call = await this.prisma.dispatchCall.update({
      where: { id },
      data: dto,
    });
    await this.invalidateId(id);
    await this.invalidatePages();
    const units = this.unitManager.getUnitSnapshots(String(id));
    const runtime: CadCallRuntime = { ...call, units };
    this.mdtGateway.broadcastToDepartment(0, 'dispatch:updated', runtime);
    return runtime;
  }

  async assignUnit(callId: number, unitId: string): Promise<void> {
    const call = await this.prisma.dispatchCall.findUnique({
      where: { id: callId },
    });
    if (!call)
      throw new NotFoundException(`Dispatch call #${callId} not found`);

    const unit = this.unitManager.getUnit(unitId);
    if (!unit) return;

    await this.prisma.$transaction(
      unit.officers.map((o) =>
        this.prisma.dispatchOfficer.upsert({
          where: {
            dispatchId_officerId: { dispatchId: callId, officerId: o.id },
          },
          create: { dispatchId: callId, officerId: o.id },
          update: {},
        }),
      ),
    );

    this.unitManager.assignUnitToCall(unitId, callId);
    await this.invalidateId(callId);

    const units = this.unitManager.getUnitSnapshots(unitId);
    this.mdtGateway.broadcastToDepartment(0, 'dispatch:assigned', {
      callId,
      units,
    });
  }

  async unassignUnit(callId: number, unitId: string): Promise<void> {
    const unit = this.unitManager.getUnit(unitId);
    if (unit) {
      await this.prisma.dispatchOfficer.deleteMany({
        where: {
          dispatchId: callId,
          officerId: { in: unit.officers.map((o) => o.id) },
        },
      });
      this.unitManager.unassignUnitFromCall(unitId);
    }
    await this.invalidateId(callId);
    this.mdtGateway.broadcastToDepartment(0, 'dispatch:assigned', {
      callId,
      units: [],
    });
  }

  async close(callId: number): Promise<CadCallRuntime> {
    const call = await this.prisma.dispatchCall.update({
      where: { id: callId },
      data: { status: CallStatus.CLOSED },
    });
    await this.invalidateId(callId);
    await this.invalidatePages();
    const runtime: CadCallRuntime = { ...call, units: [] };
    this.mdtGateway.broadcastToDepartment(0, 'dispatch:updated', runtime);
    return runtime;
  }
}
