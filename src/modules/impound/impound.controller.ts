import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { ImpoundService } from './impound.service';
import { CreateImpoundDto } from './dto/create-impound.dto';
import { UpdateImpoundDto } from './dto/update-impound.dto';
import { Permissions } from '../../common/decorators/permission.decorator';
import { CurrentOfficer } from '../../common/decorators/current-officer.decorator';
import type { OfficerWithDept } from '../auth/strategies/jwt.strategy';

@ApiTags('Impounds')
@ApiBearerAuth()
@Controller('impounds')
export class ImpoundController {
  constructor(private readonly impounds: ImpoundService) {}

  @ApiOperation({ summary: 'Create an impound — requires manage_impounds' })
  @Permissions('manage_impounds')
  @Post()
  create(
    @Body() dto: CreateImpoundDto,
    @CurrentOfficer() officer: OfficerWithDept,
  ) {
    return this.impounds.create({ ...dto, issuedById: officer.id });
  }

  @ApiOperation({
    summary: 'Get paginated impounds, search by plate/ownerName',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'ABC123' })
  @Get()
  getPage(@Query('page') rawPage?: string, @Query('q') q?: string) {
    const page = parseInt(rawPage ?? '1', 10) || 1;
    return this.impounds.getPage(page, q);
  }

  @ApiOperation({ summary: 'Get an impound by ID' })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.impounds.getById(id);
  }

  @ApiOperation({ summary: 'Update an impound — requires manage_impounds' })
  @Permissions('manage_impounds')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateImpoundDto) {
    return this.impounds.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete an impound — requires manage_impounds' })
  @Permissions('manage_impounds')
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.impounds.delete(id);
  }
}
