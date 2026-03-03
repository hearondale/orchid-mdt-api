import { ApiProperty } from '@nestjs/swagger';

export class AssignUnitDto {
  @ApiProperty({ example: 'unit-abc123' })
  unitId: string;
}
