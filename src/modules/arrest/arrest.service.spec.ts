import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ArrestService } from './arrest.service';
import { PrismaService } from '../prisma/prisma.service';
import { PenalCodeService } from '../penal-code/penal-code.service';

describe('ArrestService', () => {
  let service: ArrestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArrestService,
        { provide: PrismaService, useValue: {} },
        { provide: PenalCodeService, useValue: {} },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ArrestService>(ArrestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
