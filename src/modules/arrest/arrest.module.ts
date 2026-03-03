import { Module } from '@nestjs/common';
import { ArrestService } from './arrest.service';
import { ArrestController } from './arrest.controller';
import { PenalCodeModule } from '../penal-code/penal-code.module';

@Module({
  imports: [PenalCodeModule],
  controllers: [ArrestController],
  providers: [ArrestService],
  exports: [ArrestService],
})
export class ArrestModule {}
