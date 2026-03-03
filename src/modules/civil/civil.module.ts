import { Module } from '@nestjs/common';
import { CivilService } from './civil.service';
import { CivilController } from './civil.controller';

@Module({
  controllers: [CivilController],
  providers: [CivilService],
  exports: [CivilService],
})
export class CivilModule {}
