import { Module } from '@nestjs/common';
import { FivemGateway } from './fivem.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [FivemGateway],
})
export class FivemModule {}
