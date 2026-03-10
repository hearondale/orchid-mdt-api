import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateArrestDto {
  @ApiPropertyOptional({ example: [1, 2], type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  penalCodeIds?: number[];

  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @IsInt()
  bailAmount?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  sentenceMinutes?: number;

  @ApiPropertyOptional({ example: 'Updated notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
