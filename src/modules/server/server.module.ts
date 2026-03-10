import { Module } from '@nestjs/common';
import { ServerController } from './server.controller';
import { CivilModule } from '../civil/civil.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { WeaponModule } from '../weapon/weapon.module';
import { DispatchModule } from '../dispatch/dispatch.module';

@Module({
  imports: [CivilModule, VehicleModule, WeaponModule, DispatchModule],
  controllers: [ServerController],
})
export class ServerModule {}
