import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { EmploymentStatus } from '@prisma/client';
import { CreateOfficerDto } from './create-officer.dto';

export class UpdateOfficerDto extends PartialType(CreateOfficerDto) {
  @ApiPropertyOptional({
    enum: EmploymentStatus,
    example: EmploymentStatus.ACTIVE,
  })
  employmentStatus?: EmploymentStatus;
}
