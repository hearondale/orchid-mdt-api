import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateArrestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  suspectId!: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Defaults to the logged-in officer',
  })
  @IsOptional()
  @IsInt()
  processingOfficerId?: number;

  @ApiProperty({ example: [1, 2, 3], type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  penalCodeIds!: number[];

  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @IsInt()
  bailAmount?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  sentenceMinutes?: number;

  @ApiPropertyOptional({ example: 'Resisted arrest' })
  @IsOptional()
  @IsString()
  notes?: string;
}
