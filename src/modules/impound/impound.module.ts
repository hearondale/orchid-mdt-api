import { Module } from '@nestjs/common';
import { ImpoundController } from './impound.controller';
import { ImpoundService } from './impound.service';

@Module({
  controllers: [ImpoundController],
  providers: [ImpoundService],
  exports: [ImpoundService],
})
export class ImpoundModule {}
