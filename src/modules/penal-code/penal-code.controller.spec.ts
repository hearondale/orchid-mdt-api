import { Test, TestingModule } from '@nestjs/testing';
import { PenalCodeController } from './penal-code.controller';
import { PenalCodeService } from './penal-code.service';

describe('PenalCodeController', () => {
  let controller: PenalCodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PenalCodeController],
      providers: [{ provide: PenalCodeService, useValue: {} }],
    }).compile();

    controller = module.get<PenalCodeController>(PenalCodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
