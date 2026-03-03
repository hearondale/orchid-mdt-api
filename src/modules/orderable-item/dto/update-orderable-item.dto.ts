import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderItemType } from '@prisma/client';

export class UpdateOrderableItemDto {
  @ApiPropertyOptional({ example: 'Combat Pistol' })
  name?: string;

  @ApiPropertyOptional({ enum: OrderItemType })
  type?: OrderItemType;

  @ApiPropertyOptional({ example: 'WEAPON_COMBATPISTOL' })
  spawncode?: string;

  @ApiPropertyOptional({ example: 1 })
  amount?: number;

  @ApiPropertyOptional({ example: [1, 2], type: [Number] })
  departmentIds?: number[];
}
