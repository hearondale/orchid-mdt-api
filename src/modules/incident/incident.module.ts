import { Module } from '@nestjs/common';
import { IncidentService } from './incident.service';
import { EvidenceService } from './evidence.service';
import { IncidentController } from './incident.controller';

@Module({
  controllers: [IncidentController],
  providers: [IncidentService, EvidenceService],
  exports: [IncidentService],
})
export class IncidentModule {}
