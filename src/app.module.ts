import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { FivemModule } from './modules/fivem/fivem.module';
import { MdtModule } from './modules/mdt/mdt.module';
import { UnitManagerModule } from './modules/unit-manager/unit-manager.module';
import { CivilModule } from './modules/civil/civil.module';
import { OfficerModule } from './modules/officer/officer.module';
import { DepartmentModule } from './modules/department/department.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { WeaponModule } from './modules/weapon/weapon.module';
import { PenalCodeModule } from './modules/penal-code/penal-code.module';
import { ArrestModule } from './modules/arrest/arrest.module';
import { BoloModule } from './modules/bolo/bolo.module';
import { IncidentModule } from './modules/incident/incident.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { OrderableItemModule } from './modules/orderable-item/orderable-item.module';
import { ServerModule } from './modules/server/server.module';
import { JwtGuard } from './modules/auth/strategies/jwt.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true, ttl: 30_000, max: 500 }),
    PrismaModule,
    AuthModule,
    MdtModule,
    FivemModule,
    UnitManagerModule,
    CivilModule,
    OfficerModule,
    DepartmentModule,
    VehicleModule,
    WeaponModule,
    PenalCodeModule,
    ArrestModule,
    BoloModule,
    IncidentModule,
    DispatchModule,
    OrderableItemModule,
    ServerModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
