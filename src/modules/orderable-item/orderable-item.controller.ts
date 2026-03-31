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
import { OrderableItemService } from './orderable-item.service';
import { CreateOrderableItemDto } from './dto/create-orderable-item.dto';
import { UpdateOrderableItemDto } from './dto/update-orderable-item.dto';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';

@ApiTags('Orderable Items')
@ApiBearerAuth()
@Controller('orderable-items')
export class OrderableItemController {
  constructor(private readonly items: OrderableItemService) {}

  @ApiOperation({ summary: 'Create an orderable item — admin only' })
  @AdminOnly()
  @Post()
  create(@Body() dto: CreateOrderableItemDto) {
    return this.items.create(dto);
  }

  @ApiOperation({
    summary:
      'Get paginated items, optionally filter by type (WEAPON|EQUIPMENT|VEHICLE)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['WEAPON', 'EQUIPMENT', 'VEHICLE'],
  })
  @Get()
  getPage(@Query('page') rawPage?: string, @Query('type') type?: string) {
    const page = parseInt(rawPage ?? '1', 10) || 1;
    return this.items.getPage(page, type);
  }

  @ApiOperation({ summary: 'Get an orderable item by ID' })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.items.getById(id);
  }

  @ApiOperation({ summary: 'Update an orderable item — admin only' })
  @AdminOnly()
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderableItemDto,
  ) {
    return this.items.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete an orderable item — admin only' })
  @AdminOnly()
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.items.delete(id);
  }
}
