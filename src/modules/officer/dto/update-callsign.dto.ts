import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateCallsignDto {
  @ApiProperty({ example: 'ALPHA-1' })
  @IsString()
  callsign!: string;
}
