import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OnboardOfficerDto {
  // Civil fields
  @ApiProperty({ example: 'John' })
  name: string;

  @ApiProperty({ example: 'Doe' })
  surname: string;

  @ApiProperty({ example: '1990-05-21' })
  dob: string;

  @ApiProperty({ example: ['driver', 'weapons'], type: [String] })
  licenses: string[];

  // Officer fields
  @ApiProperty({ example: 1 })
  departmentId: number;

  @ApiProperty({ example: 'license:abc123' })
  identifier: string;

  @ApiProperty({ example: 'PD-101' })
  badge: string;

  @ApiProperty({ example: 'Officer' })
  rank: string;

  @ApiPropertyOptional({ example: false })
  isAdmin?: boolean;

  @ApiPropertyOptional({ example: ['manage_bolos'], type: [String] })
  permissions?: string[];

  @ApiProperty({ example: '4L-14' })
  callsign: string;
}
