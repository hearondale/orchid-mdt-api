import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { VehicleService } from './vehicle.service';

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
}
