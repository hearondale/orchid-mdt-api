import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UnitManagerService } from './unit-manager.service';

@ApiTags('Units')
@ApiBearerAuth()
@Controller('units')
export class UnitManagerController {
  constructor(private readonly unitManager: UnitManagerService) {}

  @ApiOperation({ summary: 'Get all active units' })
  @Get()
  getAll() {
    return this.unitManager.getAllUnits();
  }
}
