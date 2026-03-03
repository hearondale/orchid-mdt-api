import { ApiProperty } from '@nestjs/swagger';

export class MarkStolenDto {
  @ApiProperty({ example: true })
  stolen: boolean;
}
