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
import { BoloService } from './bolo.service';
import { CreateBoloDto } from './dto/create-bolo.dto';
import { UpdateBoloDto } from './dto/update-bolo.dto';
import { Permissions } from '../../common/decorators/permission.decorator';
import { CurrentOfficer } from '../../common/decorators/current-officer.decorator';
import type { OfficerWithDept } from '../auth/strategies/jwt.strategy';

@ApiTags('BOLOs')
@ApiBearerAuth()
@Controller('bolos')
export class BoloController {
  constructor(private readonly bolos: BoloService) {}

  @ApiOperation({ summary: 'Issue a BOLO — requires manage_bolos' })
  @Post()
  create(
    @Body() dto: CreateBoloDto,
    @CurrentOfficer() officer: OfficerWithDept,
  ) {
    return this.bolos.create({ ...dto, issuedById: officer.id });
  }

  @ApiOperation({
    summary: 'Get paginated BOLOs, search by identifier/description',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'ABCD123' })
  @Get()
  getPage(@Query('page') rawPage?: string, @Query('q') q?: string) {
    const page = parseInt(rawPage ?? '1', 10) || 1;
    return this.bolos.getPage(page, q);
  }

  @ApiOperation({ summary: 'Get a BOLO by ID' })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.bolos.getById(id);
  }

  @ApiOperation({ summary: 'Update a BOLO — requires manage_bolos' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBoloDto) {
    return this.bolos.update(id, dto);
  }

  @ApiOperation({ summary: 'Deactivate a BOLO — requires manage_bolos' })
  @Patch(':id/deactivate')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.bolos.deactivate(id);
  }

  @ApiOperation({ summary: 'Delete a BOLO — requires manage_bolos' })
  @Permissions('manage_bolos')
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.bolos.delete(id);
  }
}
