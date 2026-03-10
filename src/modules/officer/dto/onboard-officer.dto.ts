import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class OnboardOfficerDto {
  // Civil fields
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: '1990-05-21' })
  @IsString()
  dob!: string;

  @ApiProperty({ example: ['driver', 'weapons'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  licenses!: string[];

  // Officer fields
  @ApiProperty({ example: 1 })
  @IsInt()
  departmentId!: number;

  @ApiProperty({ example: 'license:abc123' })
  @IsString()
  identifier!: string;

  @ApiProperty({ example: 'PD-101' })
  @IsString()
  badge!: string;

  @ApiProperty({ example: 'Officer' })
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

  @ApiProperty({ example: '4L-14' })
  @IsString()
  callsign!: string;
}
