import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ServerGuard } from '../../../common/guards/server.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { WeaponService } from '../../weapon/weapon.service';
import { CreateWeaponDto } from '../../weapon/dto/create-weapon.dto';
import { UpdateWeaponDto } from '../../weapon/dto/update-weapon.dto';
import { MarkStolenDto } from '../../weapon/dto/mark-stolen.dto';

@ApiTags('Server (FiveM)')
@ApiHeader({ name: 'Authorization', description: 'Bearer FIVEM_SECRET' })
@Public()
@UseGuards(ServerGuard)
@Controller('server/weapon')
export class ServerWeaponController {
  constructor(private readonly weapons: WeaponService) {}

  @ApiOperation({ summary: 'FiveM: register a weapon' })
  @Post()
  create(@Body() dto: CreateWeaponDto) {
    return this.weapons.create(dto);
  }

  @ApiOperation({ summary: 'FiveM: update a weapon by serial number' })
  @Patch(':serial')
  update(@Param('serial') serial: string, @Body() dto: UpdateWeaponDto) {
    return this.weapons.update(serial, dto);
  }

  @ApiOperation({ summary: 'FiveM: mark weapon stolen/not stolen' })
  @Patch(':serial/stolen')
  markStolen(@Param('serial') serial: string, @Body() dto: MarkStolenDto) {
    return this.weapons.markStolen(serial, dto.stolen);
  }

  @ApiOperation({ summary: 'FiveM: delete a weapon by serial number' })
  @Delete(':serial')
  delete(@Param('serial') serial: string) {
    return this.weapons.deleteBySerial(serial);
  }
}
