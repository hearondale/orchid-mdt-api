import { Test, TestingModule } from '@nestjs/testing';
import { CivilController } from './civil.controller';
import { CivilService } from './civil.service';

describe('CivilController', () => {
  let controller: CivilController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CivilController],
      providers: [{ provide: CivilService, useValue: {} }],
    }).compile();

    controller = module.get<CivilController>(CivilController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
