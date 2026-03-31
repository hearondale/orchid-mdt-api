import { Module } from '@nestjs/common';
import { ServerOfficerController } from './server-officer.controller';
import { OfficerModule } from '../../officer/officer.module';

@Module({
  imports: [OfficerModule],
  controllers: [ServerOfficerController],
})
export class ServerOfficerModule {}
