import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { BoloType } from '@prisma/client';

export class CreateBoloDto {
  @ApiProperty({ enum: BoloType, example: BoloType.VEHICLE })
  @IsEnum(BoloType)
  targetType!: BoloType;

  @ApiProperty({
    example: 'ABCD123',
    description: 'Civil.id (as string) | Vehicle.plate | Weapon.serialNumber',
  })
  @IsString()
  targetIdentifier!: string;

  @ApiProperty({
    example: 'Black Sultan, tinted windows, last seen on Maze Bank Ave',
  })
  @IsString()
  description!: string;

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  /** Set by controller from req.user.id — not supplied by client */
  issuedById?: number;
}
