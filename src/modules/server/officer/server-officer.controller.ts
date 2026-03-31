import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ServerGuard } from '../../../common/guards/server.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { OfficerService } from '../../officer/officer.service';
import { CreateOfficerDto } from '../../officer/dto/create-officer.dto';

@ApiTags('Server (FiveM)')
@ApiHeader({ name: 'Authorization', description: 'Bearer FIVEM_SECRET' })
@Public()
@UseGuards(ServerGuard)
@Controller('server/officer')
export class ServerOfficerController {
  constructor(private readonly officers: OfficerService) {}

  @ApiOperation({ summary: 'FiveM: create an officer profile' })
  @Post()
  create(@Body() dto: CreateOfficerDto) {
    console.log('Creating officer with data:', dto);

    return this.officers.create(dto);
  }
}
