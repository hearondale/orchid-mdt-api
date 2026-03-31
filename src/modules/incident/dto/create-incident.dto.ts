import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateIncidentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  departmentId!: number;

  @ApiProperty({ example: 7 })
  @IsInt()
  leadOfficerId!: number;

  @ApiProperty({ example: 'Armed Robbery at Fleeca Bank' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Multiple suspects entered the bank at 21:30...' })
  @IsString()
  description!: string;
}
