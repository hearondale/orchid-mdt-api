import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWeaponDto {
  @ApiProperty({ example: 'SN-123456' })
  serialNumber: string;

  @ApiProperty({ example: 'WEAPON_PISTOL' })
  weaponType: string;

  @ApiPropertyOptional({ example: false })
  registered?: boolean;

  @ApiPropertyOptional({ example: false })
  stolen?: boolean;

  @ApiPropertyOptional({ example: 'Suppressor attached' })
  notes?: string;

  @ApiPropertyOptional({ example: 1 })
  ownerId?: number;
}
