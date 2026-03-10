import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateImpoundDto {
  @ApiProperty({ example: 'ABCD123' })
  @IsString()
  plate!: string;

  @ApiProperty({ example: 'Toyota' })
  @IsString()
  make!: string;

  @ApiProperty({ example: 'Camry' })
  @IsString()
  model!: string;

  @ApiProperty({ example: 'Black' })
  @IsString()
  color!: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @ApiPropertyOptional({ example: 'Illegal parking' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  price!: number;

  @ApiProperty({ example: '2026-12-31T00:00:00.000Z' })
  @IsDateString()
  releaseDate!: string;

  /** Set by controller from req.user.id — not supplied by client */
  issuedById?: number;
}
