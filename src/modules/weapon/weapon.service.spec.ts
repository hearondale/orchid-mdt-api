import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { WeaponService } from './weapon.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WeaponService', () => {
  let service: WeaponService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeaponService,
        { provide: PrismaService, useValue: {} },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<WeaponService>(WeaponService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
