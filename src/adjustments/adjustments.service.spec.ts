import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AdjustmentsService } from './adjustments.service';
import { Adjustment } from './schemas/adjustment.schema';

describe('AdjustmentsService', () => {
  let service: AdjustmentsService;
  let model: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdjustmentsService,
        {
          provide: getModelToken(Adjustment.name),
          useValue: {
            findByIdAndUpdate: jest.fn().mockResolvedValue({ _id: 'id', studentId: 'sid', currentAdjustments: [], history: [] }),
            findOneAndUpdate: jest.fn().mockResolvedValue({ _id: 'id', studentId: 'sid', currentAdjustments: [], history: [] }),
          },
        },
        { provide: 'AdjustmentNotificationsService', useValue: {} },
        { provide: getModelToken('DocumentEntity'), useValue: {} },
      ],
    }).compile();
    service = module.get<AdjustmentsService>(AdjustmentsService);
    model = module.get(getModelToken(Adjustment.name));
  });

  it('findByIdAndUpdate debe devolver un Adjustment', async () => {
    const result = await service.findByIdAndUpdate('id', {});
    expect(result).toHaveProperty('_id', 'id');
  });

  it('findOneAndUpdate debe devolver un Adjustment', async () => {
    const result = await service.findOneAndUpdate({ _id: 'id' }, {});
    expect(result).toHaveProperty('_id', 'id');
  });
});
