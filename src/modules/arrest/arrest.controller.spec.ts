import { Test, TestingModule } from '@nestjs/testing';
import { ArrestController } from './arrest.controller';
import { ArrestService } from './arrest.service';

describe('ArrestController', () => {
  let controller: ArrestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArrestController],
      providers: [{ provide: ArrestService, useValue: {} }],
    }).compile();

    controller = module.get<ArrestController>(ArrestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
