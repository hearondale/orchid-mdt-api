import { Module } from '@nestjs/common';
import { OfficerService } from './officer.service';
import { OfficerController } from './officer.controller';

@Module({
  controllers: [OfficerController],
  providers: [OfficerService],
  exports: [OfficerService],
})
export class OfficerModule {}
