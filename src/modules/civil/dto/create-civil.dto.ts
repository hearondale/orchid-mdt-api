import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateCivilDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: '1967-05-21' })
  @IsString()
  dob!: string;

  @ApiProperty({ example: ['driver', 'weapons'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  licenses!: string[];

  @ApiProperty({ example: 'license:abc123' })
  @IsString()
  identifier!: string;
}
