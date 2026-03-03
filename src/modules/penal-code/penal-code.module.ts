import { Module } from '@nestjs/common';
import { PenalCodeService } from './penal-code.service';
import { PenalCodeController } from './penal-code.controller';

@Module({
  controllers: [PenalCodeController],
  providers: [PenalCodeService],
  exports: [PenalCodeService],
})
export class PenalCodeModule {}
