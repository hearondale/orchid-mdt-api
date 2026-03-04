import { ApiProperty } from '@nestjs/swagger';

export class UpdateCallsignDto {
  @ApiProperty({ example: 'ALPHA-1' })
  callsign!: string;
}
