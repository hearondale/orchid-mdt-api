import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { EvidenceType } from '@prisma/client';

export class CreateEvidenceDto {
  @ApiProperty({ example: 'Surveillance footage' })
  @IsString()
  label!: string;

  @ApiProperty({ enum: EvidenceType, example: EvidenceType.DIGITAL })
  @IsEnum(EvidenceType)
  type!: EvidenceType;

  @ApiProperty({ example: 'Footage from Maze Bank Ave camera at 21:32' })
  @IsString()
  description!: string;
}
