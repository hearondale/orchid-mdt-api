import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { DutyStatus } from '../../../common/types/runtime.types';

export class SetDutyStatusDto {
  @ApiProperty({ enum: DutyStatus, example: DutyStatus.ON_DUTY })
  @IsEnum(DutyStatus)
  dutyStatus!: DutyStatus;
}
