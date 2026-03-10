import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { DepartmentType } from '@prisma/client';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Los Santos Police Department' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: DepartmentType, example: DepartmentType.LSPD })
  @IsEnum(DepartmentType)
  type!: DepartmentType;

  @ApiPropertyOptional({
    example: ['mdt', 'dispatch', 'records'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  access?: string[];
}
