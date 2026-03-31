import { Module } from '@nestjs/common';
import { ServerCivilController } from './server-civil.controller';
import { CivilModule } from '../../civil/civil.module';

@Module({
  imports: [CivilModule],
  controllers: [ServerCivilController],
})
export class ServerCivilModule {}
