import { ApiProperty } from '@nestjs/swagger';
import { IncidentStatus } from '@prisma/client';

export class SetStatusDto {
  @ApiProperty({ enum: IncidentStatus, example: IncidentStatus.CLOSED })
  status: IncidentStatus;
}
