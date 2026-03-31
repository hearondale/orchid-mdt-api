import { Module } from '@nestjs/common';
import { ServerWeaponController } from './server-weapon.controller';
import { WeaponModule } from '../../weapon/weapon.module';

@Module({
  imports: [WeaponModule],
  controllers: [ServerWeaponController],
})
export class ServerWeaponModule {}
