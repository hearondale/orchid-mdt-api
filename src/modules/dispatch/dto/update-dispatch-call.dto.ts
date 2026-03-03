import { ApiPropertyOptional } from '@nestjs/swagger';
import { CallStatus } from '@prisma/client';

export class UpdateDispatchCallDto {
  @ApiPropertyOptional({ example: '10-31' })
  code?: string;

  @ApiPropertyOptional({ example: 'Updated message' })
  message?: string;

  @ApiPropertyOptional({ example: 'LOW' })
  priority?: string;

  @ApiPropertyOptional({ example: 'Updated location' })
  location?: string;

  @ApiPropertyOptional({ enum: CallStatus })
  status?: CallStatus;
}
