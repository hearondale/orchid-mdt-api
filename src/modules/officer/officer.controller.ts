import {
  Controller,
  Get,
  Post,
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
import { OfficerService } from './officer.service';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { UpdateOfficerDto } from './dto/update-officer.dto';
import { SetDutyStatusDto } from './dto/set-duty-status.dto';
import { OnboardOfficerDto } from './dto/onboard-officer.dto';
import { Permissions } from '../../common/decorators/permission.decorator';

@ApiTags('Officers')
@ApiBearerAuth()
@Controller('officers')
export class OfficerController {
  constructor(private readonly officers: OfficerService) {}

  @ApiOperation({
    summary: 'Onboard a new officer — creates Civil + Officer atomically',
  })
  @Permissions('manage_officers')
  @Post('onboard')
  onboard(@Body() dto: OnboardOfficerDto) {
    return this.officers.onboard(dto);
  }

  @ApiOperation({ summary: 'Create an officer profile' })
  @Post()
  create(@Body() dto: CreateOfficerDto) {
    return this.officers.create(dto);
  }

  @ApiOperation({
    summary:
      'Get paginated officers, optionally filtered by badge/callsign/name',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'eagle' })
  @Get()
  getPage(@Query('page') rawPage?: string, @Query('q') q?: string) {
    const page = parseInt(rawPage ?? '1', 10) || 1;
    return this.officers.getPage(page, q);
  }

  @ApiOperation({ summary: 'Get an officer by ID' })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.officers.getById(id);
  }

  @ApiOperation({ summary: 'Update an officer profile' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOfficerDto) {
    return this.officers.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete an officer profile' })
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.officers.delete(id);
  }

  @ApiOperation({ summary: 'Set runtime duty status — does not write to DB' })
  @Patch(':id/duty')
  setDutyStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetDutyStatusDto,
  ) {
    return this.officers.setDutyStatus(id, dto.dutyStatus);
  }

  @ApiOperation({ summary: 'Get runtime state (duty status, unit, CAD call)' })
  @Get(':id/runtime')
  getRuntimeState(@Param('id', ParseIntPipe) id: number) {
    return this.officers.getRuntimeState(id);
  }
}
