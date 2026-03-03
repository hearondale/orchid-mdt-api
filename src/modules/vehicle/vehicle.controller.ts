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
import { VehicleService } from './vehicle.service';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { MarkStolenDto } from './dto/mark-stolen.dto';

@ApiTags('Vehicles')
@ApiBearerAuth()
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicles: VehicleService) {}

  @ApiOperation({
    summary: 'Get paginated vehicles, search by plate/make/model/owner',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'ABCD123' })
  @Get()
  getPage(@Query('page') rawPage?: string, @Query('q') q?: string) {
    const page = parseInt(rawPage ?? '1', 10) || 1;
    return this.vehicles.getPage(page, q);
  }

  @ApiOperation({ summary: 'Get a vehicle by ID' })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.vehicles.getById(id);
  }

  @ApiOperation({ summary: 'Update a vehicle by plate' })
  @Patch(':plate')
  update(@Param('plate') plate: string, @Body() dto: UpdateVehicleDto) {
    return this.vehicles.update(plate, dto);
  }

  @ApiOperation({ summary: 'Mark a vehicle as stolen/not stolen' })
  @Patch(':plate/stolen')
  markStolen(@Param('plate') plate: string, @Body() dto: MarkStolenDto) {
    return this.vehicles.markStolen(plate, dto.stolen);
  }

  @ApiOperation({ summary: 'Delete a vehicle' })
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.vehicles.delete(id);
  }
}
