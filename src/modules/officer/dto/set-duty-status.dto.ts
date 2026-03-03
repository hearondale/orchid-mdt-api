import { ApiProperty } from '@nestjs/swagger';
import { DutyStatus } from '../../../common/types/runtime.types';

export class SetDutyStatusDto {
  @ApiProperty({ enum: DutyStatus, example: DutyStatus.ON_DUTY })
  dutyStatus: DutyStatus;
}
