import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { OfficerService } from './officer.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnitManagerService } from '../unit-manager/unit-manager.service';

describe('OfficerService', () => {
  let service: OfficerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfficerService,
        { provide: PrismaService, useValue: {} },
        { provide: UnitManagerService, useValue: {} },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<OfficerService>(OfficerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
