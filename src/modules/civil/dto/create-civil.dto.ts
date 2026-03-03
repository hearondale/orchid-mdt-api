import { ApiProperty } from '@nestjs/swagger';

export class CreateCivilDto {
  @ApiProperty({ example: 'John' })
  name: string;

  @ApiProperty({ example: 'Doe' })
  surname: string;

  @ApiProperty({ example: '1967-05-21' })
  dob: string;

  @ApiProperty({ example: ['driver', 'weapons'], type: [String] })
  licenses: string[];
}
