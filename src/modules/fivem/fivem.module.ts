import { Module } from '@nestjs/common';
import { FivemGateway } from './fivem.gateway';
import { AuthModule } from '../auth/auth.module';
import { DispatchModule } from '../dispatch/dispatch.module';

@Module({
  imports: [AuthModule, DispatchModule],
  providers: [FivemGateway],
})
export class FivemModule {}
