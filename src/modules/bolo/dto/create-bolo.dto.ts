import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BoloType } from '@prisma/client';

export class CreateBoloDto {
  @ApiProperty({ enum: BoloType, example: BoloType.VEHICLE })
  targetType: BoloType;

  @ApiProperty({
    example: 'ABCD123',
    description: 'Civil.id (as string) | Vehicle.plate | Weapon.serialNumber',
  })
  targetIdentifier: string;

  @ApiProperty({
    example: 'Black Sultan, tinted windows, last seen on Maze Bank Ave',
  })
  description: string;

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00.000Z' })
  expiresAt?: string;

  /** Set by controller from req.user.id — not supplied by client */
  issuedById?: number;
}
