import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ImpoundService } from './impound.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ImpoundService', () => {
  let service: ImpoundService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImpoundService,
        { provide: PrismaService, useValue: {} },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ImpoundService>(ImpoundService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
