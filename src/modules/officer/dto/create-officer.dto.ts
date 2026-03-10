import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOfficerDto {
  @ApiProperty({ example: 1, description: 'ID of an existing Civil record' })
  @IsInt()
  civilId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  departmentId!: number;

  @ApiProperty({ example: 'license:abc123' })
  @IsString()
  identifier!: string;

  @ApiProperty({ example: '4143' })
  @IsString()
  badge!: string;

  @ApiProperty({ example: '4L-12' })
  @IsString()
  callsign!: string;

  @ApiProperty({ example: 'Sergeant' })
  @IsString()
  rank!: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @ApiPropertyOptional({ example: ['manage_bolos'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
