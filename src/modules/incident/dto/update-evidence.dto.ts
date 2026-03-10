import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EvidenceType } from '@prisma/client';

export class UpdateEvidenceDto {
  @ApiPropertyOptional({ example: 'Updated label' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ enum: EvidenceType })
  @IsOptional()
  @IsEnum(EvidenceType)
  type?: EvidenceType;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;
}
