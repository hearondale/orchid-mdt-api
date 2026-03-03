import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBoloDto {
  @ApiPropertyOptional({ example: 'Updated description' })
  description?: string;

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00.000Z' })
  expiresAt?: string;

  @ApiPropertyOptional({ example: true })
  active?: boolean;
}
