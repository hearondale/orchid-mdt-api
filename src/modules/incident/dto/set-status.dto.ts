import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { IncidentStatus } from '@prisma/client';

export class SetStatusDto {
  @ApiProperty({ enum: IncidentStatus, example: IncidentStatus.CLOSED })
  @IsEnum(IncidentStatus)
  status!: IncidentStatus;
}
