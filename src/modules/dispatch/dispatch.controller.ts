import {
  Controller,
  Get,
  Patch,
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
import { DispatchService } from './dispatch.service';
import { UpdateDispatchCallDto } from './dto/update-dispatch-call.dto';
import { UpdateCallStatusDto } from './dto/update-call-status.dto';
import { Permissions } from '../../common/decorators/permission.decorator';
import { CurrentOfficer } from '../../common/decorators/current-officer.decorator';
import type { JwtUser } from '../../common/types/api.types';

@ApiTags('Dispatch')
@ApiBearerAuth()
@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatch: DispatchService) {}

  @ApiOperation({
    summary: 'Get paginated dispatch calls, search by code/message/location',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'q', required: false, type: String, example: '10-31' })
  @Get()
  getPage(@Query('page') rawPage?: string, @Query('q') q?: string) {
    const page = parseInt(rawPage ?? '1', 10) || 1;
    return this.dispatch.getPage(page, q);
  }

  @ApiOperation({ summary: 'Get all non-closed dispatch calls' })
  @Get('active')
  getActive() {
    return this.dispatch.getActive();
  }

  @ApiOperation({
    summary: 'Get a dispatch call by ID (includes live unit data)',
  })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.dispatch.getById(id);
  }

  @ApiOperation({ summary: 'Update call status — any authenticated officer' })
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCallStatusDto,
  ) {
    return this.dispatch.update(id, dto);
  }

  @ApiOperation({
    summary: 'Update a dispatch call — requires manage_dispatch',
  })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDispatchCallDto,
  ) {
    return this.dispatch.update(id, dto);
  }

  @ApiOperation({
    summary: 'Resolve a dispatch call — records resolving unit callsign',
  })
  @Patch(':id/resolve')
  resolve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOfficer() officer: JwtUser,
  ) {
    return this.dispatch.resolve(id, officer.identifier);
  }

  @ApiOperation({ summary: 'Close a dispatch call — requires manage_dispatch' })
  @Patch(':id/close')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.dispatch.close(id);
  }
}
