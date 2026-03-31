import { Module } from '@nestjs/common';
import { ServerCivilModule } from './civil/server-civil.module';
import { ServerVehicleModule } from './vehicle/server-vehicle.module';
import { ServerWeaponModule } from './weapon/server-weapon.module';
import { ServerDispatchModule } from './dispatch/server-dispatch.module';
import { ServerOfficerModule } from './officer/server-officer.module';

@Module({
  imports: [
    ServerCivilModule,
    ServerVehicleModule,
    ServerWeaponModule,
    ServerDispatchModule,
    ServerOfficerModule,
  ],
})
export class ServerModule {}
