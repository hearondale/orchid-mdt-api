import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MdtGateway } from './mdt.gateway';
import { MdtGatewayService } from './mdt-gateway.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [MdtGateway, MdtGatewayService],
  exports: [MdtGatewayService],
})
export class MdtModule {}
