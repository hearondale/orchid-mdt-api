import { Module } from '@nestjs/common';
import { OfficerService } from './officer.service';
import { OfficerController } from './officer.controller';
import { CivilModule } from '../civil/civil.module';

@Module({
  imports: [CivilModule],
  controllers: [OfficerController],
  providers: [OfficerService],
  exports: [OfficerService],
})
export class OfficerModule {}
