import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PenalCodeService } from './penal-code.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PenalCodeService', () => {
  let service: PenalCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PenalCodeService,
        { provide: PrismaService, useValue: {} },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PenalCodeService>(PenalCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
