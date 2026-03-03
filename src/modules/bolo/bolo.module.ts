import { Module } from '@nestjs/common';
import { BoloService } from './bolo.service';
import { BoloController } from './bolo.controller';
import { CivilModule } from '../civil/civil.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { WeaponModule } from '../weapon/weapon.module';

@Module({
  imports: [CivilModule, VehicleModule, WeaponModule],
  controllers: [BoloController],
  providers: [BoloService],
  exports: [BoloService],
})
export class BoloModule {}
