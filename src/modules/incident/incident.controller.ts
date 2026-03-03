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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { IncidentService } from './incident.service';
import { EvidenceService } from './evidence.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { SetStatusDto } from './dto/set-status.dto';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';
import { Permissions } from '../../common/decorators/permission.decorator';

@ApiTags('Incidents')
@ApiBearerAuth()
@Controller('incidents')
export class IncidentController {
  constructor(
    private readonly incidents: IncidentService,
    private readonly evidence: EvidenceService,
  ) {}

  // ── Incidents ─────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Create an incident — requires manage_incidents' })
  @Permissions('manage_incidents')
  @Post()
  create(@Body() dto: CreateIncidentDto) {
    return this.incidents.create(dto);
  }

  @ApiOperation({
    summary:
      'Get paginated incidents, search by title/description/suspect/badge',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'robbery' })
  @Get()
  getPage(@Query('page') rawPage?: string, @Query('q') q?: string) {
    const page = parseInt(rawPage ?? '1', 10) || 1;
    return this.incidents.getPage(page, q);
  }

  @ApiOperation({ summary: 'Get an incident by ID (full details)' })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.incidents.getById(id);
  }

  @ApiOperation({ summary: 'Update an incident — requires manage_incidents' })
  @Permissions('manage_incidents')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.incidents.update(id, dto);
  }

  @ApiOperation({ summary: 'Set incident status' })
  @Permissions('manage_incidents')
  @Patch(':id/status')
  setStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: SetStatusDto) {
    return this.incidents.setStatus(id, dto.status);
  }

  @ApiOperation({ summary: 'Add an officer to the incident by badge' })
  @Permissions('manage_incidents')
  @Post(':id/officers')
  addOfficer(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { badge: string },
  ) {
    return this.incidents.addOfficer(id, body.badge);
  }

  @ApiOperation({ summary: 'Remove an officer from the incident' })
  @Permissions('manage_incidents')
  @Delete(':id/officers/:officerId')
  removeOfficer(
    @Param('id', ParseIntPipe) id: number,
    @Param('officerId', ParseIntPipe) officerId: number,
  ) {
    return this.incidents.removeOfficer(id, officerId);
  }

  @ApiOperation({ summary: 'Add a suspect by FiveM identifier' })
  @Permissions('manage_incidents')
  @Post(':id/suspects')
  addSuspect(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { identifier: string },
  ) {
    return this.incidents.addSuspect(id, body.identifier);
  }

  @ApiOperation({ summary: 'Remove a suspect from the incident' })
  @Permissions('manage_incidents')
  @Delete(':id/suspects/:civilId')
  removeSuspect(
    @Param('id', ParseIntPipe) id: number,
    @Param('civilId', ParseIntPipe) civilId: number,
  ) {
    return this.incidents.removeSuspect(id, civilId);
  }

  @ApiOperation({ summary: 'Link an arrest report to the incident' })
  @Permissions('manage_incidents')
  @Post(':id/arrests')
  linkArrest(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { arrestId: number },
  ) {
    return this.incidents.linkArrest(id, body.arrestId);
  }

  @ApiOperation({ summary: 'Link a BOLO to the incident' })
  @Permissions('manage_incidents')
  @Post(':id/bolos')
  linkBolo(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { boloId: number },
  ) {
    return this.incidents.linkBolo(id, body.boloId);
  }

  // ── Evidence ──────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Add evidence to an incident' })
  @Permissions('manage_incidents')
  @Post(':incidentId/evidence')
  createEvidence(
    @Param('incidentId', ParseIntPipe) incidentId: number,
    @Body() dto: CreateEvidenceDto,
    @Request() req: { user: { id: number } },
  ) {
    return this.evidence.createEvidence(incidentId, dto, req.user.id);
  }

  @ApiOperation({ summary: 'Get all evidence for an incident' })
  @Get(':incidentId/evidence')
  getEvidence(@Param('incidentId', ParseIntPipe) incidentId: number) {
    return this.evidence.getByIncident(incidentId);
  }

  @ApiOperation({ summary: 'Update a piece of evidence' })
  @Permissions('manage_incidents')
  @Patch(':incidentId/evidence/:id')
  updateEvidence(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEvidenceDto,
  ) {
    return this.evidence.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a piece of evidence' })
  @Permissions('manage_incidents')
  @Delete(':incidentId/evidence/:id')
  deleteEvidence(@Param('id', ParseIntPipe) id: number) {
    return this.evidence.delete(id);
  }
}
