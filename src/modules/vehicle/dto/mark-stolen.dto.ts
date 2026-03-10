import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class MarkStolenDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  stolen!: boolean;
}
