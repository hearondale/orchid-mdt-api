import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Evidence } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../../common/base/base.service';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';

const EVIDENCE_INCLUDE = {
  collectedBy: { select: { id: true, badge: true } },
} as const;

@Injectable()
export class EvidenceService extends BaseService<
  Evidence,
  CreateEvidenceDto,
  UpdateEvidenceDto
> {
  constructor(prisma: PrismaService, @Inject(CACHE_MANAGER) cache: Cache) {
    super(prisma, cache, 'evidence');
  }

  // Minimal implementation to satisfy abstract contract
  async getPage(page: number): Promise<PaginatedResult<Evidence>> {
    const [data, total] = await Promise.all([
      this.prisma.evidence.findMany({
        skip: (page - 1) * this.PAGE_SIZE,
        take: this.PAGE_SIZE,
        include: EVIDENCE_INCLUDE,
      }),
      this.prisma.evidence.count(),
    ]);
    return { data, page, pageSize: this.PAGE_SIZE, total };
  }

  async getByIncident(incidentId: number): Promise<Evidence[]> {
    const key = `evidence:incident:${incidentId}`;
    return this.getCached(key, () =>
      this.prisma.evidence.findMany({
        where: { incidentId },
        include: EVIDENCE_INCLUDE,
      }),
    );
  }

  // Satisfies abstract contract — use createEvidence for actual work
  async create(dto: CreateEvidenceDto): Promise<Evidence> {
    return this.prisma.evidence.create({
      data: dto as any,
      include: EVIDENCE_INCLUDE,
    });
  }

  async createEvidence(
    incidentId: number,
    dto: CreateEvidenceDto,
    collectedById: number,
  ): Promise<Evidence> {
    const evidence = await this.prisma.evidence.create({
      data: { ...dto, incidentId, collectedById },
      include: EVIDENCE_INCLUDE,
    });
    await this.cache.del(`evidence:incident:${incidentId}`);
    return evidence;
  }

  async update(id: number, dto: UpdateEvidenceDto): Promise<Evidence> {
    const existing = await this.prisma.evidence.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Evidence #${id} not found`);
    const evidence = await this.prisma.evidence.update({
      where: { id },
      data: dto,
      include: EVIDENCE_INCLUDE,
    });
    await this.cache.del(`evidence:incident:${existing.incidentId}`);
    return evidence;
  }

  override async delete(id: number): Promise<void> {
    const existing = await this.prisma.evidence.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Evidence #${id} not found`);
    await this.prisma.evidence.delete({ where: { id } });
    await this.cache.del(`evidence:incident:${existing.incidentId}`);
  }
}
