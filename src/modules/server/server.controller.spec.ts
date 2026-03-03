import { Test, TestingModule } from '@nestjs/testing';
import { ServerController } from './server.controller';
import { ServerGuard } from '../../common/guards/server.guard';
import { CivilService } from '../civil/civil.service';
import { VehicleService } from '../vehicle/vehicle.service';
import { WeaponService } from '../weapon/weapon.service';

describe('ServerController', () => {
  let controller: ServerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServerController],
      providers: [
        { provide: CivilService, useValue: {} },
        { provide: VehicleService, useValue: {} },
        { provide: WeaponService, useValue: {} },
      ],
    })
      .overrideGuard(ServerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ServerController>(ServerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
