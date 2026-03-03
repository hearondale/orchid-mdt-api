import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePenalCodeDto {
  @ApiProperty({ example: 'PC-187' })
  code: string;

  @ApiProperty({ example: 'Murder' })
  title: string;

  @ApiProperty({ example: 'Crimes Against Persons' })
  category: string;

  @ApiProperty({
    example: 'The unlawful killing of a human being with malice aforethought.',
  })
  description: string;

  @ApiPropertyOptional({ example: 500000 })
  fineAmount?: number;
}
