import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderItemType } from '@prisma/client';

export class CreateOrderableItemDto {
  @ApiProperty({ example: 'Combat Pistol' })
  name: string;

  @ApiProperty({ enum: OrderItemType, example: OrderItemType.WEAPON })
  type: OrderItemType;

  @ApiProperty({ example: 'WEAPON_COMBATPISTOL' })
  spawncode: string;

  @ApiPropertyOptional({ example: 1 })
  amount?: number;

  @ApiProperty({ example: [1, 2], type: [Number] })
  departmentIds: number[];
}
