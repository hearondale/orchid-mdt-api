import { Global, Module } from '@nestjs/common';
import { UnitManagerService } from './unit-manager.service';

@Global()
@Module({
  providers: [UnitManagerService],
  exports: [UnitManagerService],
})
export class UnitManagerModule {}
