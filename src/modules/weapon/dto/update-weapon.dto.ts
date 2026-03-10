import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateWeaponDto {
  @ApiPropertyOptional({ example: 'WEAPON_PISTOL' })
  @IsOptional()
  @IsString()
  weaponType?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  registered?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  stolen?: boolean;

  @ApiPropertyOptional({ example: 'Suppressor attached' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  ownerId?: number;
}
