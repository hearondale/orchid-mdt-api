import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'your-handshake-key' })
  @IsString()
  @IsNotEmpty()
  key!: string;
}
