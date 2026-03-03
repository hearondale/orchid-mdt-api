import { ApiProperty } from '@nestjs/swagger';

export class CreateDispatchCallDto {
  @ApiProperty({ example: '10-31' })
  code: string;

  @ApiProperty({ example: 'Robbery in progress at Fleeca Bank' })
  message: string;

  @ApiProperty({ example: 'HIGH' })
  priority: string;

  @ApiProperty({ example: 'Maze Bank Ave & Alta St' })
  location: string;
}
