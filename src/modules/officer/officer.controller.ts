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
  Request,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { OfficerService } from './officer.service';
import { UnitManagerService } from '../unit-manager/unit-manager.service';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { UpdateOfficerDto } from './dto/update-officer.dto';
import { SetDutyStatusDto } from './dto/set-duty-status.dto';
import { OnboardOfficerDto } from './dto/onboard-officer.dto';
import { UpdateCallsignDto } from './dto/update-callsign.dto';
import { Permissions } from '../../common/decorators/permission.decorator';

interface JwtUser {
  sub: number;
  isAdmin: boolean;
  identifier: string;
  departmentId: number;
}

@ApiTags('Officers')
@ApiBearerAuth()
@Controller('officers')
export class OfficerController {
  constructor(
    private readonly officers: OfficerService,
    private readonly unitManager: UnitManagerService,
  ) {}

  @ApiOperation({
    summary: 'Onboard a new officer — creates Civil + Officer atomically',
  })
  @Permissions('manage_officers')
  @Post('onboard')
  onboard(@Body() dto: OnboardOfficerDto) {
    return this.officers.onboard(dto);
  }

  @ApiOperation({
    summary: 'Create an officer profile — requires manage_officers',
  })
  @Permissions('manage_officers')
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

  @ApiOperation({ summary: 'Get the logged-in officer profile' })
  @Get('me')
  getMe(@Request() req: { user: JwtUser }) {
    return this.officers.getById(req.user.sub);
  }

  @ApiOperation({ summary: 'Get all currently online officers' })
  @Get('online')
  getOnline() {
    return this.unitManager.getAllOnline();
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
    @Request() req: { user: JwtUser },
  ) {
    if (req.user.sub !== id && !req.user.isAdmin) {
      throw new ForbiddenException(
        "Cannot change another officer's duty status",
      );
    }
    return this.officers.setDutyStatus(id, dto.dutyStatus);
  }

  @ApiOperation({ summary: 'Update runtime callsign — does not write to DB' })
  @Patch(':id/callsign')
  updateCallsign(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCallsignDto,
  ) {
    return this.officers.updateCallsign(id, dto.callsign);
  }

  @ApiOperation({ summary: 'Get runtime state (duty status, unit, CAD call)' })
  @Get(':id/runtime')
  getRuntimeState(@Param('id', ParseIntPipe) id: number) {
    return this.officers.getRuntimeState(id);
  }
}
