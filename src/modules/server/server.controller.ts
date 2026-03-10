import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ServerGuard } from '../../common/guards/server.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CivilService } from '../civil/civil.service';
import { VehicleService } from '../vehicle/vehicle.service';
import { WeaponService } from '../weapon/weapon.service';
import { DispatchService } from '../dispatch/dispatch.service';
import { CreateCivilDto } from '../civil/dto/create-civil.dto';
import { UpdateCivilDto } from '../civil/dto/update-civil.dto';
import { CreateVehicleDto } from '../vehicle/dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../vehicle/dto/update-vehicle.dto';
import { CreateWeaponDto } from '../weapon/dto/create-weapon.dto';
import { UpdateWeaponDto } from '../weapon/dto/update-weapon.dto';
import { MarkStolenDto as VehicleStolenDto } from '../vehicle/dto/mark-stolen.dto';
import { MarkStolenDto as WeaponStolenDto } from '../weapon/dto/mark-stolen.dto';
import { CreateDispatchCallDto } from '../dispatch/dto/create-dispatch-call.dto';

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
    private readonly dispatch: DispatchService,
  ) {}

  // ── Civil ─────────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'FiveM: create a civil profile' })
  @Post('civil')
  createCivil(@Body() dto: CreateCivilDto) {
    return this.civil.create(dto);
  }

  @ApiOperation({ summary: 'FiveM: update a civil profile' })
  @Patch('civil/:id')
  updateCivil(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCivilDto,
  ) {
    return this.civil.update(id, dto);
  }

  @ApiOperation({ summary: 'FiveM: delete a civil profile' })
  @Delete('civil/:id')
  deleteCivil(@Param('id', ParseIntPipe) id: number) {
    return this.civil.delete(id);
  }

  // ── Vehicle ───────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'FiveM: register a vehicle' })
  @Post('vehicle')
  createVehicle(@Body() dto: CreateVehicleDto) {
    return this.vehicles.create(dto);
  }

  @ApiOperation({ summary: 'FiveM: update a vehicle by plate' })
  @Patch('vehicle/:plate')
  updateVehicle(@Param('plate') plate: string, @Body() dto: UpdateVehicleDto) {
    return this.vehicles.update(plate, dto);
  }

  @ApiOperation({ summary: 'FiveM: mark vehicle stolen/not stolen' })
  @Patch('vehicle/:plate/stolen')
  markVehicleStolen(
    @Param('plate') plate: string,
    @Body() dto: VehicleStolenDto,
  ) {
    return this.vehicles.markStolen(plate, dto.stolen);
  }

  @ApiOperation({ summary: 'FiveM: delete a vehicle by plate' })
  @Delete('vehicle/:plate')
  deleteVehicle(@Param('plate') plate: string) {
    return this.vehicles.deleteByPlate(plate);
  }

  // ── Weapon ────────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'FiveM: register a weapon' })
  @Post('weapon')
  createWeapon(@Body() dto: CreateWeaponDto) {
    return this.weapons.create(dto);
  }

  @ApiOperation({ summary: 'FiveM: update a weapon by serial number' })
  @Patch('weapon/:serial')
  updateWeapon(@Param('serial') serial: string, @Body() dto: UpdateWeaponDto) {
    return this.weapons.update(serial, dto);
  }

  @ApiOperation({ summary: 'FiveM: mark weapon stolen/not stolen' })
  @Patch('weapon/:serial/stolen')
  markWeaponStolen(
    @Param('serial') serial: string,
    @Body() dto: WeaponStolenDto,
  ) {
    return this.weapons.markStolen(serial, dto.stolen);
  }

  @ApiOperation({ summary: 'FiveM: delete a weapon by serial number' })
  @Delete('weapon/:serial')
  deleteWeapon(@Param('serial') serial: string) {
    return this.weapons.deleteBySerial(serial);
  }

  @ApiOperation({ summary: 'FiveM: create a dispatch call' })
  @Post('call')
  createCall(@Body() dto: CreateDispatchCallDto) {
    console.log('Creating dispatch call from FiveM:', dto);
    return this.dispatch.create(dto);
  }
}
