import { Test, TestingModule } from '@nestjs/testing';
import { BoloController } from './bolo.controller';
import { BoloService } from './bolo.service';

describe('BoloController', () => {
  let controller: BoloController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoloController],
      providers: [{ provide: BoloService, useValue: {} }],
    }).compile();

    controller = module.get<BoloController>(BoloController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
