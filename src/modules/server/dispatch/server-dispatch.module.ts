import { Module } from '@nestjs/common';
import { ServerDispatchController } from './server-dispatch.controller';
import { DispatchModule } from '../../dispatch/dispatch.module';

@Module({
  imports: [DispatchModule],
  controllers: [ServerDispatchController],
})
export class ServerDispatchModule {}
