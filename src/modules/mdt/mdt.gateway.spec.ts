import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MdtGateway } from './mdt.gateway';
import { MdtGatewayService } from './mdt-gateway.service';

describe('MdtGateway', () => {
  let gateway: MdtGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MdtGateway,
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: MdtGatewayService, useValue: {} },
      ],
    }).compile();

    gateway = module.get<MdtGateway>(MdtGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
