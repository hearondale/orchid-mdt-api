import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ServerGuard } from '../../../common/guards/server.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { DispatchService } from '../../dispatch/dispatch.service';
import { CreateDispatchCallDto } from '../../dispatch/dto/create-dispatch-call.dto';

@ApiTags('Server (FiveM)')
@ApiHeader({ name: 'Authorization', description: 'Bearer FIVEM_SECRET' })
@Public()
@UseGuards(ServerGuard)
@Controller('server/dispatch')
export class ServerDispatchController {
  constructor(private readonly dispatch: DispatchService) {}

  @ApiOperation({ summary: 'FiveM: create a dispatch call' })
  @Post('call')
  createCall(@Body() dto: CreateDispatchCallDto) {
    return this.dispatch.create(dto);
  }
}
