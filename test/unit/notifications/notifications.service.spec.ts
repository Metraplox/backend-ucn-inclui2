import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { NotificationsService } from '../../../src/notifications/notifications.service';
import { NotificationRepository } from '../../../src/notifications/repositories/notification.repository';

// Mocks
const mockNotificationRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  getUnreadCount: jest.fn(),
  findByType: jest.fn(),
  deleteOlderThan: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NotificationRepository,
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);

    jest.clearAllMocks();
  });

  it('debería definirse correctamente', () => {
    expect(service).toBeDefined();
  });

  it('debería llamar findAll con paginación', async () => {
    mockNotificationRepository.findAll.mockResolvedValue([]);

    await service.findAll(new Types.ObjectId().toHexString(), '202510', 2, 10);

    expect(mockNotificationRepository.findAll).toHaveBeenCalledWith(
      expect.any(String),
      '202510',
      2,
      10,
    );
  });

  it('debería marcar todas como leídas', async () => {
    mockNotificationRepository.markAllAsRead.mockResolvedValue(undefined);
    const userId = new Types.ObjectId().toHexString();

    await service.markAllAsRead(userId);

    expect(mockNotificationRepository.markAllAsRead).toHaveBeenCalledWith(userId);
  });

  it('debería retornar contador de no leídas', async () => {
    mockNotificationRepository.getUnreadCount.mockResolvedValue(5);
    const userId = new Types.ObjectId().toHexString();

    const count = await service.getUnreadCount(userId);

    expect(count).toBe(5);
    expect(mockNotificationRepository.getUnreadCount).toHaveBeenCalledWith(userId);
  });

  it('debería ejecutar cleanupOldNotifications', async () => {
    mockNotificationRepository.deleteOlderThan.mockResolvedValue(undefined);

    await service.cleanupOldNotifications(60);

    expect(mockNotificationRepository.deleteOlderThan).toHaveBeenCalledWith(60);
  });
}); 