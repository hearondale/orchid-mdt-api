import { Module } from '@nestjs/common';
import { ServerController } from './server.controller';
import { CivilModule } from '../civil/civil.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { WeaponModule } from '../weapon/weapon.module';

@Module({
  imports: [CivilModule, VehicleModule, WeaponModule],
  controllers: [ServerController],
})
export class ServerModule {}
