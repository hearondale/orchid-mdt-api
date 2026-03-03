import { Module } from '@nestjs/common';
import { WeaponService } from './weapon.service';
import { WeaponController } from './weapon.controller';

@Module({
  controllers: [WeaponController],
  providers: [WeaponService],
  exports: [WeaponService],
})
export class WeaponModule {}
