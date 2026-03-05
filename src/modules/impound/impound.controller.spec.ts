import { Test, TestingModule } from '@nestjs/testing';
import { ImpoundController } from './impound.controller';
import { ImpoundService } from './impound.service';

describe('ImpoundController', () => {
  let controller: ImpoundController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImpoundController],
      providers: [{ provide: ImpoundService, useValue: {} }],
    }).compile();

    controller = module.get<ImpoundController>(ImpoundController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
