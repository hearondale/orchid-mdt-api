import { PartialType } from '@nestjs/swagger';
import { CreateCivilDto } from './create-civil.dto';

export class UpdateCivilDto extends PartialType(CreateCivilDto) {}
