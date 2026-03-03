import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArrestDto {
  @ApiProperty({ example: 1 })
  suspectId: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Defaults to the logged-in officer',
  })
  processingOfficerId?: number;

  @ApiProperty({ example: [1, 2, 3], type: [Number] })
  penalCodeIds: number[];

  @ApiPropertyOptional({ example: 10000 })
  bailAmount?: number;

  @ApiPropertyOptional({ example: 60 })
  sentenceMinutes?: number;

  @ApiPropertyOptional({ example: 'Resisted arrest' })
  notes?: string;
}
