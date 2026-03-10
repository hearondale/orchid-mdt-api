import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePenalCodeDto {
  @ApiProperty({ example: 'PC-187' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'Murder' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Crimes Against Persons' })
  @IsString()
  category!: string;

  @ApiProperty({
    example: 'The unlawful killing of a human being with malice aforethought.',
  })
  @IsString()
  description!: string;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @IsInt()
  fineAmount?: number;
}
