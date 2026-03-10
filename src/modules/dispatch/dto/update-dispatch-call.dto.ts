import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CallStatus } from '@prisma/client';

export class UpdateDispatchCallDto {
  @ApiPropertyOptional({ example: '10-31' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Updated message' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ example: 'LOW' })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({ example: 'Updated location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ enum: CallStatus })
  @IsOptional()
  @IsEnum(CallStatus)
  status?: CallStatus;
}
