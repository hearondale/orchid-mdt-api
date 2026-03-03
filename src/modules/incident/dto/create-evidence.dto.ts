import { ApiProperty } from '@nestjs/swagger';
import { EvidenceType } from '@prisma/client';

export class CreateEvidenceDto {
  @ApiProperty({ example: 'Surveillance footage' })
  label: string;

  @ApiProperty({ enum: EvidenceType, example: EvidenceType.DIGITAL })
  type: EvidenceType;

  @ApiProperty({ example: 'Footage from Maze Bank Ave camera at 21:32' })
  description: string;
}
