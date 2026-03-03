import { ApiPropertyOptional } from '@nestjs/swagger';
import { EvidenceType } from '@prisma/client';

export class UpdateEvidenceDto {
  @ApiPropertyOptional({ example: 'Updated label' })
  label?: string;

  @ApiPropertyOptional({ enum: EvidenceType })
  type?: EvidenceType;

  @ApiPropertyOptional({ example: 'Updated description' })
  description?: string;
}
