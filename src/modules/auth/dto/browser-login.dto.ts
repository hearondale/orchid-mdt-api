import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class BrowserLoginDto {
  @ApiProperty({ example: '1234' })
  @IsString()
  @IsNotEmpty()
  badge!: string;
}
