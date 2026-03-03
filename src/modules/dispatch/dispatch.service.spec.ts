import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DispatchService } from './dispatch.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnitManagerService } from '../unit-manager/unit-manager.service';
import { MdtGatewayService } from '../mdt/mdt-gateway.service';

describe('DispatchService', () => {
  let service: DispatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: PrismaService, useValue: {} },
        { provide: UnitManagerService, useValue: {} },
        { provide: MdtGatewayService, useValue: {} },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<DispatchService>(DispatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
