import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { IncidentStatus } from '@prisma/client';

export class UpdateIncidentDto {
  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsInt()
  leadOfficerId?: number;

  @ApiPropertyOptional({ example: 'Updated title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: IncidentStatus, example: IncidentStatus.CLOSED })
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;
}
