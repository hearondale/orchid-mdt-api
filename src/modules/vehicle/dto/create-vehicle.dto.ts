import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABCD123' })
  @IsString()
  plate!: string;

  @ApiProperty({ example: '1HGCM82633A123456' })
  @IsString()
  vin!: string;

  @ApiProperty({ example: 'Toyota' })
  @IsString()
  make!: string;

  @ApiProperty({ example: 'Camry' })
  @IsString()
  model!: string;

  @ApiProperty({ example: 'Black' })
  @IsString()
  color!: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  stolen?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  ownerId?: number;
}
