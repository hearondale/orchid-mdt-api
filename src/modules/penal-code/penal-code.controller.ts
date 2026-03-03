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
import { PenalCodeService } from './penal-code.service';
import { CreatePenalCodeDto } from './dto/create-penal-code.dto';
import { UpdatePenalCodeDto } from './dto/update-penal-code.dto';
import { Permissions } from '../../common/decorators/permission.decorator';

@ApiTags('Penal Codes')
@ApiBearerAuth()
@Controller('penal-codes')
export class PenalCodeController {
  constructor(private readonly penalCodes: PenalCodeService) {}

  @ApiOperation({ summary: 'Create a penal code — requires manage_records' })
  @Permissions('manage_records')
  @Post()
  create(@Body() dto: CreatePenalCodeDto) {
    return this.penalCodes.create(dto);
  }

  @ApiOperation({
    summary: 'Get paginated penal codes, search by code/title/category',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'PC-187' })
  @Get()
  getPage(@Query('page') rawPage?: string, @Query('q') q?: string) {
    const page = parseInt(rawPage ?? '1', 10) || 1;
    return this.penalCodes.getPage(page, q);
  }

  @ApiOperation({
    summary: 'Get a penal code by code string — declare before :id',
  })
  @Get('code/:code')
  getByCode(@Param('code') code: string) {
    return this.penalCodes.getByCode(code);
  }

  @ApiOperation({ summary: 'Get a penal code by ID' })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.penalCodes.getById(id);
  }

  @ApiOperation({ summary: 'Update a penal code — requires manage_records' })
  @Permissions('manage_records')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePenalCodeDto,
  ) {
    return this.penalCodes.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a penal code — requires manage_records' })
  @Permissions('manage_records')
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.penalCodes.delete(id);
  }
}
