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
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Permissions } from '../../common/decorators/permission.decorator';

@ApiTags('Departments')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departments: DepartmentService) {}

  @ApiOperation({
    summary: 'Create a department — requires manage_departments',
  })
  @Permissions('manage_departments')
  @Post()
  create(@Body() dto: CreateDepartmentDto) {
    console.log('Creating department with data:', dto);
    return this.departments.create(dto);
  }

  @ApiOperation({
    summary: 'Get paginated departments, optionally filtered by name',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'fib' })
  @Get()
  getPage(@Query('page') rawPage?: string, @Query('q') q?: string) {
    const page = parseInt(rawPage ?? '1', 10) || 1;
    return this.departments.getPage(page, q);
  }

  @ApiOperation({ summary: 'Get a department by ID' })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.departments.getById(id);
  }

  @ApiOperation({
    summary: 'Update a department — requires manage_departments',
  })
  @Permissions('manage_departments')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departments.update(id, dto);
  }

  @ApiOperation({
    summary: 'Delete a department — requires manage_departments',
  })
  @Permissions('manage_departments')
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.departments.delete(id);
  }
}
