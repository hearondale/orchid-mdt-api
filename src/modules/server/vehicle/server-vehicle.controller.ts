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
import { VehicleService } from '../../vehicle/vehicle.service';
import { CreateVehicleDto } from '../../vehicle/dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../../vehicle/dto/update-vehicle.dto';
import { MarkStolenDto } from '../../vehicle/dto/mark-stolen.dto';

@ApiTags('Server (FiveM)')
@ApiHeader({ name: 'Authorization', description: 'Bearer FIVEM_SECRET' })
@Public()
@UseGuards(ServerGuard)
@Controller('server/vehicle')
export class ServerVehicleController {
  constructor(private readonly vehicles: VehicleService) {}

  @ApiOperation({ summary: 'FiveM: register a vehicle' })
  @Post()
  create(@Body() dto: CreateVehicleDto) {
    return this.vehicles.create(dto);
  }

  @ApiOperation({ summary: 'FiveM: update a vehicle by plate' })
  @Patch(':plate')
  update(@Param('plate') plate: string, @Body() dto: UpdateVehicleDto) {
    return this.vehicles.update(plate, dto);
  }

  @ApiOperation({ summary: 'FiveM: mark vehicle stolen/not stolen' })
  @Patch(':plate/stolen')
  markStolen(@Param('plate') plate: string, @Body() dto: MarkStolenDto) {
    return this.vehicles.markStolen(plate, dto.stolen);
  }

  @ApiOperation({ summary: 'FiveM: delete a vehicle by plate' })
  @Delete(':plate')
  delete(@Param('plate') plate: string) {
    return this.vehicles.deleteByPlate(plate);
  }
}
