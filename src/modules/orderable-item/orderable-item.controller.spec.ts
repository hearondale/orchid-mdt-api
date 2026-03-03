import { Test, TestingModule } from '@nestjs/testing';
import { OrderableItemController } from './orderable-item.controller';
import { OrderableItemService } from './orderable-item.service';

describe('OrderableItemController', () => {
  let controller: OrderableItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderableItemController],
      providers: [{ provide: OrderableItemService, useValue: {} }],
    }).compile();

    controller = module.get<OrderableItemController>(OrderableItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
