import { Module } from '@nestjs/common';
import { ServerVehicleController } from './server-vehicle.controller';
import { VehicleModule } from '../../vehicle/vehicle.module';

@Module({
  imports: [VehicleModule],
  controllers: [ServerVehicleController],
})
export class ServerVehicleModule {}
