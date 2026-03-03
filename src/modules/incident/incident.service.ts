import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Incident, IncidentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../../common/base/base.service';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';

const INCIDENT_INCLUDE = {
  department: true,
  officers: {
    include: { officer: { select: { id: true, badge: true, callsign: true } } },
  },
  suspects: {
    include: { civil: { select: { id: true, name: true, surname: true } } },
  },
  arrests: { include: { arrest: true } },
  bolos: { include: { bolo: true } },
  evidence: true,
} as const;

@Injectable()
export class IncidentService extends BaseService<
  Incident,
  CreateIncidentDto,
  UpdateIncidentDto
> {
  constructor(prisma: PrismaService, @Inject(CACHE_MANAGER) cache: Cache) {
    super(prisma, cache, 'incident');
  }

  async getPage(
    page: number,
    query?: string,
  ): Promise<PaginatedResult<Incident>> {
    const key = `incident:page:${page}:q:${query ?? ''}`;
    this.trackPageKey(key);
    return this.getCached(
      key,
      async () => {
        const q = query?.trim();
        const where = q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' as const } },
                { description: { contains: q, mode: 'insensitive' as const } },
                {
                  suspects: {
                    some: {
                      civil: {
                        name: { contains: q, mode: 'insensitive' as const },
                      },
                    },
                  },
                },
                {
                  officers: {
                    some: {
                      officer: {
                        badge: { contains: q, mode: 'insensitive' as const },
                      },
                    },
                  },
                },
              ],
            }
          : {};

        const [data, total] = await Promise.all([
          this.prisma.incident.findMany({
            where,
            skip: (page - 1) * this.PAGE_SIZE,
            take: this.PAGE_SIZE,
            include: { department: true },
            orderBy: { createdAt: 'desc' },
          }),
          this.prisma.incident.count({ where }),
        ]);

        return { data, page, pageSize: this.PAGE_SIZE, total };
      },
      30_000,
    );
  }

  override async getById(id: number): Promise<Incident> {
    const key = `incident:id:${id}`;
    return this.getCached(key, async () => {
      const incident = await this.prisma.incident.findUnique({
        where: { id },
        include: INCIDENT_INCLUDE,
      });
      if (!incident) throw new NotFoundException(`Incident #${id} not found`);
      return incident as unknown as Incident;
    });
  }

  async create(dto: CreateIncidentDto): Promise<Incident> {
    const incident = await this.prisma.incident.create({
      data: dto,
      include: { department: true },
    });
    await this.invalidatePages();
    return incident;
  }

  async update(id: number, dto: UpdateIncidentDto): Promise<Incident> {
    await this.getById(id);
    const incident = await this.prisma.incident.update({
      where: { id },
      data: dto,
      include: INCIDENT_INCLUDE,
    });
    await this.invalidateId(id);
    await this.invalidatePages();
    return incident as unknown as Incident;
  }

  async setStatus(id: number, status: IncidentStatus): Promise<Incident> {
    return this.update(id, { status });
  }

  async addOfficer(id: number, badge: string): Promise<void> {
    const officer = await this.prisma.officer.findUnique({ where: { badge } });
    if (!officer)
      throw new NotFoundException(`Officer with badge ${badge} not found`);
    await this.prisma.incidentOfficer.upsert({
      where: {
        incidentId_officerId: { incidentId: id, officerId: officer.id },
      },
      create: { incidentId: id, officerId: officer.id },
      update: {},
    });
    await this.invalidateId(id);
  }

  async removeOfficer(id: number, officerId: number): Promise<void> {
    await this.prisma.incidentOfficer.delete({
      where: { incidentId_officerId: { incidentId: id, officerId } },
    });
    await this.invalidateId(id);
  }

  async addSuspect(id: number, identifier: string): Promise<void> {
    const officer = await this.prisma.officer.findUnique({
      where: { identifier },
    });
    if (!officer)
      throw new NotFoundException(
        `No officer found for identifier ${identifier}`,
      );
    await this.prisma.incidentSuspect.upsert({
      where: {
        incidentId_civilId: { incidentId: id, civilId: officer.civilId },
      },
      create: { incidentId: id, civilId: officer.civilId },
      update: {},
    });
    await this.invalidateId(id);
  }

  async removeSuspect(id: number, civilId: number): Promise<void> {
    await this.prisma.incidentSuspect.delete({
      where: { incidentId_civilId: { incidentId: id, civilId } },
    });
    await this.invalidateId(id);
  }

  async linkArrest(id: number, arrestId: number): Promise<void> {
    await this.prisma.incidentArrest.upsert({
      where: { incidentId_arrestId: { incidentId: id, arrestId } },
      create: { incidentId: id, arrestId },
      update: {},
    });
    await this.invalidateId(id);
  }

  async linkBolo(id: number, boloId: number): Promise<void> {
    await this.prisma.incidentBolo.upsert({
      where: { incidentId_boloId: { incidentId: id, boloId } },
      create: { incidentId: id, boloId },
      update: {},
    });
    await this.invalidateId(id);
  }
}
