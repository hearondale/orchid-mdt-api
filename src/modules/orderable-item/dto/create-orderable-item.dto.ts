import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { OrderItemType } from '@prisma/client';

export class CreateOrderableItemDto {
  @ApiProperty({ example: 'Combat Pistol' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: OrderItemType, example: OrderItemType.WEAPON })
  @IsEnum(OrderItemType)
  type!: OrderItemType;

  @ApiProperty({ example: 'WEAPON_COMBATPISTOL' })
  @IsString()
  spawncode!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  amount?: number;

  @ApiProperty({ example: [1, 2], type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  departmentIds!: number[];
}
