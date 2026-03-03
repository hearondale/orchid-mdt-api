import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ServerGuard } from '../../common/guards/server.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CivilService } from '../civil/civil.service';
import { VehicleService } from '../vehicle/vehicle.service';
import { WeaponService } from '../weapon/weapon.service';
import { CreateCivilDto } from '../civil/dto/create-civil.dto';
import { UpdateCivilDto } from '../civil/dto/update-civil.dto';
import { CreateVehicleDto } from '../vehicle/dto/create-vehicle.dto';
import { CreateWeaponDto } from '../weapon/dto/create-weapon.dto';
import { MarkStolenDto as VehicleStolenDto } from '../vehicle/dto/mark-stolen.dto';
import { MarkStolenDto as WeaponStolenDto } from '../weapon/dto/mark-stolen.dto';

@ApiTags('Server (FiveM)')
@ApiHeader({ name: 'Authorization', description: 'Bearer FIVEM_SECRET' })
@Public()
@UseGuards(ServerGuard)
@Controller('server')
export class ServerController {
  constructor(
    private readonly civil: CivilService,
    private readonly vehicles: VehicleService,
    private readonly weapons: WeaponService,
  ) {}

  // ── Civil ─────────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'FiveM: create a civil profile' })
  @Post('civil')
  createCivil(@Body() dto: CreateCivilDto) {
    return this.civil.create(dto);
  }

  @ApiOperation({ summary: 'FiveM: update a civil profile' })
  @Patch('civil/:id')
  updateCivil(@Param('id') id: string, @Body() dto: UpdateCivilDto) {
    return this.civil.update(parseInt(id, 10), dto);
  }

  // ── Vehicle ───────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'FiveM: register a vehicle' })
  @Post('vehicle')
  createVehicle(@Body() dto: CreateVehicleDto) {
    return this.vehicles.create(dto);
  }

  @ApiOperation({ summary: 'FiveM: mark vehicle stolen/not stolen' })
  @Patch('vehicle/:plate/stolen')
  markVehicleStolen(
    @Param('plate') plate: string,
    @Body() dto: VehicleStolenDto,
  ) {
    return this.vehicles.markStolen(plate, dto.stolen);
  }

  // ── Weapon ────────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'FiveM: register a weapon' })
  @Post('weapon')
  createWeapon(@Body() dto: CreateWeaponDto) {
    return this.weapons.create(dto);
  }

  @ApiOperation({ summary: 'FiveM: mark weapon stolen/not stolen' })
  @Patch('weapon/:serial/stolen')
  markWeaponStolen(
    @Param('serial') serial: string,
    @Body() dto: WeaponStolenDto,
  ) {
    return this.weapons.markStolen(serial, dto.stolen);
  }
}
