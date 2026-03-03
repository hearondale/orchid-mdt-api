import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { WeaponService } from './weapon.service';
import { UpdateWeaponDto } from './dto/update-weapon.dto';
import { MarkStolenDto } from './dto/mark-stolen.dto';

@ApiTags('Weapons')
@ApiBearerAuth()
@Controller('weapons')
export class WeaponController {
  constructor(private readonly weapons: WeaponService) {}

  @ApiOperation({
    summary: 'Get paginated weapons, search by serial/type/owner',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'SN-123' })
  @Get()
  getPage(@Query('page') rawPage?: string, @Query('q') q?: string) {
    const page = parseInt(rawPage ?? '1', 10) || 1;
    return this.weapons.getPage(page, q);
  }

  @ApiOperation({ summary: 'Get a weapon by ID' })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.weapons.getById(id);
  }

  @ApiOperation({ summary: 'Update a weapon by serial number' })
  @Patch(':serialNumber')
  update(@Param('serialNumber') serial: string, @Body() dto: UpdateWeaponDto) {
    return this.weapons.update(serial, dto);
  }

  @ApiOperation({ summary: 'Mark a weapon as stolen/not stolen' })
  @Patch(':serialNumber/stolen')
  markStolen(
    @Param('serialNumber') serial: string,
    @Body() dto: MarkStolenDto,
  ) {
    return this.weapons.markStolen(serial, dto.stolen);
  }

  @ApiOperation({ summary: 'Delete a weapon' })
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.weapons.delete(id);
  }
}
