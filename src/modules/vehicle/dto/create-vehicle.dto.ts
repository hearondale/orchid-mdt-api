import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABCD123' })
  plate: string;

  @ApiProperty({ example: '1HGCM82633A123456' })
  vin: string;

  @ApiProperty({ example: 'Toyota' })
  make: string;

  @ApiProperty({ example: 'Camry' })
  model: string;

  @ApiProperty({ example: 'Black' })
  color: string;

  @ApiPropertyOptional({ example: false })
  stolen?: boolean;

  @ApiPropertyOptional({ example: 1 })
  ownerId?: number;
}
