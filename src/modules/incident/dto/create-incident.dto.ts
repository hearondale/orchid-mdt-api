import { ApiProperty } from '@nestjs/swagger';

export class CreateIncidentDto {
  @ApiProperty({ example: 1 })
  departmentId: number;

  @ApiProperty({ example: 'Armed Robbery at Fleeca Bank' })
  title: string;

  @ApiProperty({ example: 'Multiple suspects entered the bank at 21:30...' })
  description: string;
}
