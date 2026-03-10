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
import { AssignUnitDto } from './dto/assign-unit.dto';
import { Permissions } from '../../common/decorators/permission.decorator';

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
  @Permissions('manage_dispatch')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDispatchCallDto,
  ) {
    return this.dispatch.update(id, dto);
  }

  @ApiOperation({
    summary: 'Assign a unit to the call — requires manage_dispatch',
  })
  @Permissions('manage_dispatch')
  @Patch(':id/assign')
  assignUnit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignUnitDto,
  ) {
    return this.dispatch.assignUnit(id, dto.unitId);
  }

  @ApiOperation({
    summary: 'Unassign a unit from the call — requires manage_dispatch',
  })
  @Permissions('manage_dispatch')
  @Patch(':id/unassign')
  unassignUnit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignUnitDto,
  ) {
    return this.dispatch.unassignUnit(id, dto.unitId);
  }

  @ApiOperation({ summary: 'Close a dispatch call — requires manage_dispatch' })
  @Permissions('manage_dispatch')
  @Patch(':id/close')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.dispatch.close(id);
  }
}
