import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateIncidentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  departmentId!: number;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsInt()
  leadOfficerId?: number;

  @ApiProperty({ example: 'Armed Robbery at Fleeca Bank' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Multiple suspects entered the bank at 21:30...' })
  @IsString()
  description!: string;
}
