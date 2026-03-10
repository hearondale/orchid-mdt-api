import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignUnitDto {
  @ApiProperty({ example: 'unit-abc123' })
  @IsString()
  unitId!: string;
}
