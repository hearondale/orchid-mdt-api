import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { CivilService } from './civil.service';

@ApiTags('Civil')
@ApiBearerAuth()
@Controller('civil')
export class CivilController {
  constructor(private readonly civil: CivilService) {}

  @ApiOperation({
    summary:
      'Get paginated civil profiles, optionally filtered by name/surname',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'doe' })
  @Get()
  getPage(@Query('page') rawPage?: string, @Query('q') q?: string) {
    const page = parseInt(rawPage ?? '1', 10) || 1;
    return this.civil.getPage(page, q);
  }

  @ApiOperation({ summary: 'Get a civil profile by ID' })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.civil.getById(id);
  }
}
