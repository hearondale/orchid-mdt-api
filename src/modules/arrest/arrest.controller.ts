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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { ArrestService } from './arrest.service';
import { CreateArrestDto } from './dto/create-arrest.dto';
import { UpdateArrestDto } from './dto/update-arrest.dto';
import { Permissions } from '../../common/decorators/permission.decorator';

@ApiTags('Arrests')
@ApiBearerAuth()
@Controller('arrests')
export class ArrestController {
  constructor(private readonly arrests: ArrestService) {}

  @ApiOperation({ summary: 'File an arrest report — requires manage_records' })
  @Permissions('manage_records')
  @Post()
  create(@Body() dto: CreateArrestDto, @Request() req) {
    return this.arrests.create({
      ...dto,
      processingOfficerId: dto.processingOfficerId ?? req.user.id,
    });
  }

  @ApiOperation({
    summary: 'Get paginated arrest reports, search by suspect name or badge',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'doe' })
  @Get()
  getPage(@Query('page') rawPage?: string, @Query('q') q?: string) {
    const page = parseInt(rawPage ?? '1', 10) || 1;
    return this.arrests.getPage(page, q);
  }

  @ApiOperation({
    summary: 'Get an arrest report by ID (includes resolved penal codes)',
  })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.arrests.getById(id);
  }

  @ApiOperation({
    summary: 'Update an arrest report — requires manage_records',
  })
  @Permissions('manage_records')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArrestDto) {
    return this.arrests.update(id, dto);
  }

  @ApiOperation({
    summary: 'Delete an arrest report — requires manage_records',
  })
  @Permissions('manage_records')
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.arrests.delete(id);
  }
}
