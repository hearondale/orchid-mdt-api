import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DepartmentType } from '@prisma/client';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Los Santos Police Department' })
  name: string;

  @ApiProperty({ enum: DepartmentType, example: DepartmentType.LSPD })
  type: DepartmentType;

  @ApiPropertyOptional({
    example: ['mdt', 'dispatch', 'records'],
    type: [String],
  })
  access?: string[];
}
