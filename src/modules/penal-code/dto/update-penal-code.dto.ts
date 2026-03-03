import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePenalCodeDto {
  @ApiPropertyOptional({ example: 'Murder' })
  title?: string;

  @ApiPropertyOptional({ example: 'Crimes Against Persons' })
  category?: string;

  @ApiPropertyOptional({ example: 'Updated description.' })
  description?: string;

  @ApiPropertyOptional({ example: 500000 })
  fineAmount?: number;
}
