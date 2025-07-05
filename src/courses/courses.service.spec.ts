import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { Course } from './schemas/course.schema';
import { Adjustment } from '../adjustments/schemas/adjustment.schema';

describe('CoursesService', () => {
  let service: CoursesService;
  let model: any;
  let adjustmentModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getModelToken(Course.name),
          useValue: {
            find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
            findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
          },
        },
        {
          provide: getModelToken(Adjustment.name),
          useValue: {
            find: jest.fn().mockReturnValue({ 
              lean: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([])
              })
            }),
          },
        },
        { provide: getModelToken('Student'), useValue: {} },
      ],
    }).compile();
    service = module.get<CoursesService>(CoursesService);
    model = module.get(getModelToken(Course.name));
    adjustmentModel = module.get(getModelToken(Adjustment.name));
  });

  it('getTopCoursesWithNEE debe devolver un array vacío si no hay ajustes', async () => {
    const result = await service.getTopCoursesWithNEE('2025-1');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
