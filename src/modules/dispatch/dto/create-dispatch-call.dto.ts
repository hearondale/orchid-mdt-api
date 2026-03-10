import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateDispatchCallDto {
  @ApiPropertyOptional({ example: '10-31' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: 'Robbery in progress at Fleeca Bank' })
  @IsString()
  message!: string;

  @ApiProperty({ example: 'HIGH' })
  @IsString()
  priority!: string;

  @ApiProperty({ example: 'Maze Bank Ave & Alta St' })
  @IsString()
  location!: string;
}
