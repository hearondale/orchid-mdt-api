import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EmploymentStatus } from '@prisma/client';
import { CreateOfficerDto } from './create-officer.dto';

export class UpdateOfficerDto extends PartialType(CreateOfficerDto) {
  @ApiPropertyOptional({
    enum: EmploymentStatus,
    example: EmploymentStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;
}
