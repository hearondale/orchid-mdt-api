import { ApiPropertyOptional } from '@nestjs/swagger';
import { IncidentStatus } from '@prisma/client';

export class UpdateIncidentDto {
  @ApiPropertyOptional({ example: 'Updated title' })
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  description?: string;

  @ApiPropertyOptional({ enum: IncidentStatus, example: IncidentStatus.CLOSED })
  status?: IncidentStatus;
}
