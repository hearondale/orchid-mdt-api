import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { OrderItemType } from '@prisma/client';

export class UpdateOrderableItemDto {
  @ApiPropertyOptional({ example: 'Combat Pistol' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: OrderItemType })
  @IsOptional()
  @IsEnum(OrderItemType)
  type?: OrderItemType;

  @ApiPropertyOptional({ example: 'WEAPON_COMBATPISTOL' })
  @IsOptional()
  @IsString()
  spawncode?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  amount?: number;

  @ApiPropertyOptional({ example: [1, 2], type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  departmentIds?: number[];
}
