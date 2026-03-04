import { Global, Module } from '@nestjs/common';
import { UnitManagerService } from './unit-manager.service';
import { UnitManagerController } from './unit-manager.controller';

@Global()
@Module({
  controllers: [UnitManagerController],
  providers: [UnitManagerService],
  exports: [UnitManagerService],
})
export class UnitManagerModule {}
