import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOfficerDto {
  @ApiProperty({ example: 1, description: 'ID of an existing Civil record' })
  civilId: number;

  @ApiProperty({ example: 1 })
  departmentId: number;

  @ApiProperty({ example: 'license:abc123' })
  identifier: string;

  @ApiProperty({ example: '4143' })
  badge: string;

  @ApiProperty({ example: '4L-12' })
  callsign: string;

  @ApiProperty({ example: 'Sergeant' })
  rank: string;

  @ApiPropertyOptional({ example: false })
  isAdmin?: boolean;

  @ApiPropertyOptional({ example: ['manage_bolos'], type: [String] })
  permissions?: string[];
}
