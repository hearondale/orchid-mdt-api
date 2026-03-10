import { IsOptional, IsString } from 'class-validator';

export class DevLoginDto {
  @IsOptional()
  @IsString()
  identifier?: string;
}
