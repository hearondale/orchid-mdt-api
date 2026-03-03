import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: 'Toyota' })
  make?: string;

  @ApiPropertyOptional({ example: 'Camry' })
  model?: string;

  @ApiPropertyOptional({ example: 'Black' })
  color?: string;

  @ApiPropertyOptional({ example: false })
  stolen?: boolean;

  @ApiPropertyOptional({ example: 1 })
  ownerId?: number;
}
