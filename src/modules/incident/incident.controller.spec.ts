import { Test, TestingModule } from '@nestjs/testing';
import { IncidentController } from './incident.controller';
import { IncidentService } from './incident.service';
import { EvidenceService } from './evidence.service';

describe('IncidentController', () => {
  let controller: IncidentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncidentController],
      providers: [
        { provide: IncidentService, useValue: {} },
        { provide: EvidenceService, useValue: {} },
      ],
    }).compile();

    controller = module.get<IncidentController>(IncidentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
