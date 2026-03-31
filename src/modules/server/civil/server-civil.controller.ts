import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ServerGuard } from '../../../common/guards/server.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { CivilService } from '../../civil/civil.service';
import { CreateCivilDto } from '../../civil/dto/create-civil.dto';
import { UpdateCivilDto } from '../../civil/dto/update-civil.dto';

@ApiTags('Server (FiveM)')
@ApiHeader({ name: 'Authorization', description: 'Bearer FIVEM_SECRET' })
@Public()
@UseGuards(ServerGuard)
@Controller('server/civil')
export class ServerCivilController {
  constructor(private readonly civil: CivilService) {}

  @ApiOperation({ summary: 'FiveM: create a civil profile' })
  @Post()
  create(@Body() dto: CreateCivilDto) {
    console.log('Creating civil with data:', dto);

    return this.civil.create(dto);
  }

  @ApiOperation({ summary: 'FiveM: update a civil profile' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCivilDto) {
    return this.civil.update(id, dto);
  }

  @ApiOperation({ summary: 'FiveM: delete a civil profile' })
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.civil.delete(id);
  }
}
