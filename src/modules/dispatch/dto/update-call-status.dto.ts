import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CallStatus } from '@prisma/client';

export class UpdateCallStatusDto {
  @ApiProperty({ enum: CallStatus, example: CallStatus.ONSCENE })
  @IsEnum(CallStatus)
  status!: CallStatus;
}
