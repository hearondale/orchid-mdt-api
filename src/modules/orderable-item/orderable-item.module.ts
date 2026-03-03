import { Module } from '@nestjs/common';
import { OrderableItemService } from './orderable-item.service';
import { OrderableItemController } from './orderable-item.controller';

@Module({
  controllers: [OrderableItemController],
  providers: [OrderableItemService],
  exports: [OrderableItemService],
})
export class OrderableItemModule {}
