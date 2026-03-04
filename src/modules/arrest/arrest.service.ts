import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ArrestReport, PenalCode } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PenalCodeService } from '../penal-code/penal-code.service';
import { BaseService } from '../../common/base/base.service';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
import { CreateArrestDto } from './dto/create-arrest.dto';
import { UpdateArrestDto } from './dto/update-arrest.dto';

type ArrestReportWithCodes = ArrestReport & {
  suspect: { id: number; name: string; surname: string };
  processingOfficer: { id: number; badge: string };
  penalCodes: PenalCode[];
};

const ARREST_INCLUDE = {
  suspect: { select: { id: true, name: true, surname: true } },
  processingOfficer: { select: { id: true, badge: true } },
} as const;

@Injectable()
export class ArrestService extends BaseService<
  ArrestReport,
  CreateArrestDto,
  UpdateArrestDto
> {
  constructor(
    prisma: PrismaService,
    @Inject(CACHE_MANAGER) cache: Cache,
    private readonly penalCodeService: PenalCodeService,
  ) {
    super(prisma, cache, 'arrestReport');
  }

  async getPage(
    page: number,
    query?: string,
  ): Promise<PaginatedResult<ArrestReport>> {
    const q = query?.trim();
    const where = q
      ? {
          OR: [
            {
              suspect: {
                name: { contains: q, mode: 'insensitive' as const },
              },
            },
            {
              suspect: {
                surname: { contains: q, mode: 'insensitive' as const },
              },
            },
            {
              processingOfficer: {
                badge: { contains: q, mode: 'insensitive' as const },
              },
            },
          ],
        }
      : {};

    const fetcher = async () => {
      const [data, total] = await Promise.all([
        this.prisma.arrestReport.findMany({
          where,
          skip: (page - 1) * this.PAGE_SIZE,
          take: this.PAGE_SIZE,
          include: ARREST_INCLUDE,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.arrestReport.count({ where }),
      ]);
      return { data, page, pageSize: this.PAGE_SIZE, total };
    };

    const key = `arrestReport:page:${page}:q:${q ?? ''}`;
    this.trackPageKey(key);
    return this.getCached(key, fetcher, q ? 15_000 : 30_000);
  }

  override async getById(id: number): Promise<ArrestReportWithCodes> {
    const key = `arrestReport:id:${id}`;
    return this.getCached(key, async () => {
      const report = await this.prisma.arrestReport.findUnique({
        where: { id },
        include: ARREST_INCLUDE,
      });
      if (!report)
        throw new NotFoundException(`Arrest report #${id} not found`);

      const penalCodes = await this.penalCodeService.findManyByIds(
        report.penalCodeIds,
      );
      return { ...report, penalCodes } as ArrestReportWithCodes;
    });
  }

  async create(dto: CreateArrestDto): Promise<ArrestReport> {
    const found = await this.penalCodeService.findManyByIds(dto.penalCodeIds);
    if (found.length !== dto.penalCodeIds.length) {
      const foundIds = found.map((p) => p.id);
      const missing = dto.penalCodeIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Penal code IDs not found: ${missing.join(', ')}`,
      );
    }

    const report = await this.prisma.arrestReport.create({
      data: dto as any,
      include: ARREST_INCLUDE,
    });
    await this.invalidatePages();
    return report;
  }

  async update(id: number, dto: UpdateArrestDto): Promise<ArrestReport> {
    await this.getById(id);
    if (dto.penalCodeIds) {
      const found = await this.penalCodeService.findManyByIds(dto.penalCodeIds);
      if (found.length !== dto.penalCodeIds.length) {
        throw new BadRequestException('One or more penal code IDs not found');
      }
    }
    const report = await this.prisma.arrestReport.update({
      where: { id },
      data: dto,
      include: ARREST_INCLUDE,
    });
    await this.invalidateId(id);
    await this.invalidatePages();
    return report;
  }
}
