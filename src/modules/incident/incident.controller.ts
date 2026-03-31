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
import { IncidentService } from './incident.service';
import { EvidenceService } from './evidence.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { SetStatusDto } from './dto/set-status.dto';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';
import { Permissions } from '../../common/decorators/permission.decorator';
import { CurrentOfficer } from '../../common/decorators/current-officer.decorator';
import type { OfficerWithDept } from '../auth/strategies/jwt.strategy';
import { IncidentEditLockService } from '../mdt/incident-edit-lock.service';
import { MdtGatewayService } from '../mdt/mdt-gateway.service';

@ApiTags('Incidents')
@ApiBearerAuth()
@Controller('incidents')
export class IncidentController {
  constructor(
    private readonly incidents: IncidentService,
    private readonly evidence: EvidenceService,
    private readonly editLocks: IncidentEditLockService,
    private readonly gateway: MdtGatewayService,
  ) {}

  // ── Incidents ─────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Create an incident' })
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
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.incidents.update(id, dto);
  }

  //@TODO think how to track which is edited (basically each officer can has only one note for each incident, so we can derive the note id from officer and incident id). Update DB
  @ApiOperation({ summary: 'Add notes from other officers' })
  @Patch(':id/note')
  addNoteToEvidence(
    @Param('id', ParseIntPipe) _id: number,
    @Body() _dto: UpdateEvidenceDto,
  ) {
    // return this.incidents.editNote(_id, _dto);
  }

  @ApiOperation({ summary: 'Set incident status' })
  @Patch(':id/status')
  setStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: SetStatusDto) {
    return this.incidents.setStatus(id, dto.status);
  }

  @ApiOperation({ summary: 'Add an officer to the incident by badge' })
  @Post(':id/officers')
  addOfficer(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { badge: string },
  ) {
    return this.incidents.addOfficer(id, body.badge);
  }

  @ApiOperation({ summary: 'Remove an officer from the incident' })
  @Delete(':id/officers/:officerId')
  removeOfficer(
    @Param('id', ParseIntPipe) id: number,
    @Param('officerId', ParseIntPipe) officerId: number,
  ) {
    return this.incidents.removeOfficer(id, officerId);
  }

  @ApiOperation({ summary: 'Add a suspect by civil ID' })
  @Post(':id/suspects')
  addSuspect(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { civilId: number },
  ) {
    return this.incidents.addSuspect(id, body.civilId);
  }

  @ApiOperation({ summary: 'Remove a suspect from the incident' })
  @Delete(':id/suspects/:civilId')
  removeSuspect(
    @Param('id', ParseIntPipe) id: number,
    @Param('civilId', ParseIntPipe) civilId: number,
  ) {
    return this.incidents.removeSuspect(id, civilId);
  }

  @ApiOperation({ summary: 'Link an arrest report to the incident' })
  @Post(':id/arrests')
  linkArrest(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { arrestId: number },
  ) {
    return this.incidents.linkArrest(id, body.arrestId);
  }

  @ApiOperation({ summary: 'Link a BOLO to the incident' })
  @Post(':id/bolos')
  linkBolo(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { boloId: number },
  ) {
    return this.incidents.linkBolo(id, body.boloId);
  }

  @ApiOperation({ summary: 'Unlink a BOLO from the incident' })
  @Delete(':id/bolos/:boloId')
  unlinkBolo(
    @Param('id', ParseIntPipe) id: number,
    @Param('boloId', ParseIntPipe) boloId: number,
  ) {
    return this.incidents.unlinkBolo(id, boloId);
  }

  // ── Edit lock ─────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Get current editor for an incident' })
  @Get(':id/edit-lock')
  getEditLock(@Param('id', ParseIntPipe) id: number) {
    return { editor: this.editLocks.getEditor(id) };
  }

  @ApiOperation({ summary: 'Try to acquire the edit lock for an incident' })
  @Post(':id/edit-lock')
  acquireEditLock(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOfficer() officer: OfficerWithDept,
  ) {
    const editorInfo = {
      id: officer.id,
      badge: officer.badge,
      callsign: officer.callsign,
    };
    const result = this.editLocks.tryAcquire(id, editorInfo);
    if (result.acquired) {
      this.gateway.broadcastToAll('incident:editing', {
        incidentId: id,
        editor: editorInfo,
      });
    }
    return result;
  }

  @ApiOperation({ summary: 'Release the edit lock for an incident' })
  @Delete(':id/edit-lock')
  releaseEditLock(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOfficer() officer: OfficerWithDept,
  ) {
    const released = this.editLocks.release(id, officer.id);
    if (released) {
      this.gateway.broadcastToAll('incident:editing', {
        incidentId: id,
        editor: null,
      });
    }
    return { released };
  }

  // ── Evidence ──────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Add evidence to an incident' })
  @Post(':incidentId/evidence')
  createEvidence(
    @Param('incidentId', ParseIntPipe) incidentId: number,
    @Body() dto: CreateEvidenceDto,
    @CurrentOfficer() officer: OfficerWithDept,
  ) {
    return this.evidence.createEvidence(incidentId, dto, officer.id);
  }

  @ApiOperation({ summary: 'Get all evidence for an incident' })
  @Get(':incidentId/evidence')
  getEvidence(@Param('incidentId', ParseIntPipe) incidentId: number) {
    return this.evidence.getByIncident(incidentId);
  }

  @ApiOperation({ summary: 'Update a piece of evidence' })
  @Patch(':incidentId/evidence/:id')
  updateEvidence(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEvidenceDto,
  ) {
    return this.evidence.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a piece of evidence' })
  @Delete(':incidentId/evidence/:id')
  deleteEvidence(@Param('id', ParseIntPipe) id: number) {
    return this.evidence.delete(id);
  }
}
