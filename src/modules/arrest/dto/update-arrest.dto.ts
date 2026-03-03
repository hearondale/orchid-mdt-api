import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateArrestDto {
  @ApiPropertyOptional({ example: [1, 2], type: [Number] })
  penalCodeIds?: number[];

  @ApiPropertyOptional({ example: 10000 })
  bailAmount?: number;

  @ApiPropertyOptional({ example: 60 })
  sentenceMinutes?: number;

  @ApiPropertyOptional({ example: 'Updated notes' })
  notes?: string;
}
