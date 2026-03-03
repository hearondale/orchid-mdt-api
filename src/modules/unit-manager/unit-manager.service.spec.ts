import { Test, TestingModule } from '@nestjs/testing';
import { UnitManagerService } from './unit-manager.service';

describe('UnitManagerService', () => {
  let service: UnitManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnitManagerService],
    }).compile();

    service = module.get<UnitManagerService>(UnitManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
