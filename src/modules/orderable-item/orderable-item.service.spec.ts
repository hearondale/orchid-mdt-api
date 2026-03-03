import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { OrderableItemService } from './orderable-item.service';
import { PrismaService } from '../prisma/prisma.service';

describe('OrderableItemService', () => {
  let service: OrderableItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderableItemService,
        { provide: PrismaService, useValue: {} },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<OrderableItemService>(OrderableItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
