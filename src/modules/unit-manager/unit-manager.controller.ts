import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UnitManagerService } from './unit-manager.service';
import { PrismaService } from '../prisma/prisma.service';
import { DutyStatus, OfficerRuntime } from '../../common/types/runtime.types';
import { CurrentOfficer } from '../../common/decorators/current-officer.decorator';
import type { OfficerWithDept } from '../auth/strategies/jwt.strategy';
import { Permissions } from '../../common/decorators/permission.decorator';

@ApiTags('Units')
@ApiBearerAuth()
@Controller('units')
export class UnitManagerController {
  constructor(
    private readonly unitManager: UnitManagerService,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Get all active units' })
  @Get()
  getAll() {
    return this.unitManager.getAllUnits();
  }

  @ApiOperation({
    summary: 'Get the unit of the currently authenticated officer',
  })
  @Get('me')
  getMe(@CurrentOfficer() officer: OfficerWithDept) {
    const unit = this.unitManager.getOfficerUnit(officer.identifier);
    if (!unit) {
      throw new ForbiddenException('You are not assigned to any unit');
    }
    return unit;
  }

  @ApiOperation({
    summary:
      'Assign an officer to a unit. Creates the unit if it does not exist.',
  })
  @Patch(':unitId/assign')
  async assign(
    @Param('unitId') unitId: string,
    @Body('officerId') officerId: number,
  ) {
    const officer = await this.prisma.officer.findUnique({
      where: { id: Number(officerId) },
      include: { department: true, civil: true },
    });
    if (!officer) throw new NotFoundException('Officer not found');

    let unit = this.unitManager.getUnit(unitId);
    if (!unit) {
      unit = this.unitManager.createUnit(
        unitId,
        unitId,
        officer.department.name,
        unitId,
      );
    }

    this.unitManager.joinUnit(officer.civil.identifier!, unitId);
    return this.unitManager.getUnit(unitId);
  }

  @ApiOperation({
    summary:
      'Assign current officer unit to a dispatch call — requires manage_dispatch',
  })
  @Post('assign/:callId')
  attachToCall(
    @Param('callId', ParseIntPipe) callId: number,
    @CurrentOfficer() officer: OfficerWithDept,
  ) {
    return this.unitManager.assignOfficerUnit(callId, officer.identifier);
  }

  @ApiOperation({
    summary:
      'Unassign current officer unit from a dispatch call — requires manage_dispatch',
  })
  @Patch('unassign/:callId')
  unassignFromCall(
    @Param('callId', ParseIntPipe) callId: number,
    @CurrentOfficer() officer: OfficerWithDept,
  ) {
    return this.unitManager.unassignOfficerUnit(callId, officer.identifier);
  }

  @ApiOperation({ summary: 'Leave current unit and return to solo unit' })
  @Patch('me/detach')
  detach(@CurrentOfficer() officer: OfficerWithDept) {
    this.unitManager.leaveCurrentUnit(officer.identifier);

    const soloUnitId = officer.id.toString();
    this.unitManager.disbandUnit(soloUnitId);
    const unit = this.unitManager.createUnit(
      soloUnitId,
      officer.callsign,
      officer.department.name,
      officer.callsign,
    );
    this.unitManager.joinUnit(officer.identifier, soloUnitId);

    return unit;
  }

  @ApiOperation({
    summary:
      'Register the officer as online and place them in a solo unit using their callsign',
  })
  @Post('clockon')
  clockOn(@CurrentOfficer() officer: OfficerWithDept) {
    const runtime: OfficerRuntime = {
      ...officer,
      dutyStatus: DutyStatus.OFF_DUTY,
      unitId: null,
      cadCallId: null,
    };

    this.unitManager.setOnline(runtime);

    const unitId = officer.id.toString();
    this.unitManager.disbandUnit(unitId);

    const unit = this.unitManager.createUnit(
      unitId,
      officer.callsign,
      officer.department.name,
      officer.callsign,
    );

    console.log(`Clocking on officer ${officer.callsign} (${officer.id})`);
    this.unitManager.joinUnit(officer.identifier, unitId);

    return unit;
  }
}
