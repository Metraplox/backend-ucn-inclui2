import { Test, TestingModule } from '@nestjs/testing';
import { SemesterSchedulerService } from '../../../src/scheduler/semester-scheduler.service';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../../../src/notifications/notifications.service';

describe('SemesterSchedulerService', () => {
  let service: SemesterSchedulerService;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string, defaultValue?: any) => defaultValue),
  } as unknown as ConfigService;

  const mockNotificationsService = {
    cleanupOldNotifications: jest.fn().mockResolvedValue(undefined),
  } as unknown as NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SemesterSchedulerService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<SemesterSchedulerService>(SemesterSchedulerService);

    jest.clearAllMocks();
  });

  it('debería ejecutarse executeFullSemesterSync con éxito', async () => {
    const result = await service.executeFullSemesterSync('20251');

    expect(result.success).toBe(true);
    expect(result.operation).toBe('FULL_SEMESTER_SYNC');
  });

  it('debería llamar cleanupOldNotifications con 90 días', async () => {
    await service.handleNotificationsCleanup();

    expect(mockNotificationsService.cleanupOldNotifications).toHaveBeenCalledWith(90);
  });
}); 