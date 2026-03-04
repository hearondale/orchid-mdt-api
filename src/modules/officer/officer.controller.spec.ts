import { Test, TestingModule } from '@nestjs/testing';
import { OfficerController } from './officer.controller';
import { OfficerService } from './officer.service';
import { UnitManagerService } from '../unit-manager/unit-manager.service';

describe('OfficerController', () => {
  let controller: OfficerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfficerController],
      providers: [
        { provide: OfficerService, useValue: {} },
        { provide: UnitManagerService, useValue: {} },
      ],
    }).compile();

    controller = module.get<OfficerController>(OfficerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
