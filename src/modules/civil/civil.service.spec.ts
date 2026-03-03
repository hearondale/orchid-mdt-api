import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CivilService } from './civil.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CivilService', () => {
  let service: CivilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CivilService,
        { provide: PrismaService, useValue: {} },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<CivilService>(CivilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
