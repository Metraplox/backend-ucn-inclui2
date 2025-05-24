import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationRepository } from './repositories/notification.repository';
import { Notification } from './schemas/notification.schema';
import { Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repository: typeof mockRepository;

  const mockNotification = {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    type: 'info',
    title: 'Test Notification',
    message: 'Test message',
    isRead: false,
    priority: 'medium',
    relatedEntity: 'test',
    entityId: new Types.ObjectId().toString(),
    semester: '2025-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NotificationRepository,
          useValue: mockRepository,
        },
        {
          provide: getModelToken(Notification.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repository = module.get(NotificationRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification successfully', async () => {
      const createDto = {
        userId: mockNotification.userId,
        title: 'New Notification',
        message: 'New message',
        type: 'info',
        priority: 'high',
        relatedEntity: 'test',
        entityId: new Types.ObjectId().toString(),
        semester: '2025-1',
      };

      mockRepository.create.mockResolvedValue(mockNotification);

      const result = await service.create(createDto);

      expect(result).toEqual(mockNotification);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all notifications for a user', async () => {
      const userId = new Types.ObjectId().toString();
      const semester = '2025-1';
      const notifications = [mockNotification];
      mockRepository.findAll.mockResolvedValue(notifications);

      const result = await service.findAll(userId, semester);

      expect(result).toEqual(notifications);
      expect(mockRepository.findAll).toHaveBeenCalledWith(userId, semester);
    });

    it('should throw NotFoundException for invalid userId', async () => {
      const invalidUserId = 'invalid';

      await expect(service.findAll(invalidUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single notification', async () => {
      const notificationId = mockNotification._id.toString();
      mockRepository.findOne.mockResolvedValue(mockNotification);

      const result = await service.findOne(notificationId);

      expect(result).toEqual(mockNotification);
      expect(mockRepository.findOne).toHaveBeenCalledWith(notificationId);
    });

    it('should throw NotFoundException for invalid id', async () => {
      const invalidId = 'invalid';

      await expect(service.findOne(invalidId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when notification not found', async () => {
      const notificationId = new Types.ObjectId().toString();
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(notificationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a notification', async () => {
      const notificationId = mockNotification._id.toString();
      const updateDto = { message: 'Updated message' };
      const updatedNotification = { ...mockNotification, ...updateDto };
      mockRepository.update.mockResolvedValue(updatedNotification);

      const result = await service.update(notificationId, updateDto);

      expect(result).toEqual(updatedNotification);
      expect(mockRepository.update).toHaveBeenCalledWith(
        notificationId,
        updateDto,
      );
    });

    it('should throw NotFoundException when update fails', async () => {
      const notificationId = new Types.ObjectId().toString();
      const updateDto = { message: 'Updated message' };
      mockRepository.update.mockResolvedValue(null);

      await expect(service.update(notificationId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const notificationId = mockNotification._id.toString();
      const readNotification = { ...mockNotification, isRead: true };
      mockRepository.markAsRead.mockResolvedValue(readNotification);

      const result = await service.markAsRead(notificationId);

      expect(result).toEqual(readNotification);
      expect(mockRepository.markAsRead).toHaveBeenCalledWith(notificationId);
    });

    it('should throw NotFoundException when notification not found', async () => {
      const notificationId = new Types.ObjectId().toString();
      mockRepository.markAsRead.mockResolvedValue(null);

      await expect(service.markAsRead(notificationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      const userId = new Types.ObjectId().toString();
      mockRepository.markAllAsRead.mockResolvedValue(undefined);

      await service.markAllAsRead(userId);

      expect(mockRepository.markAllAsRead).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUnreadCount', () => {
    it('should return the count of unread notifications', async () => {
      const userId = new Types.ObjectId().toString();
      const count = 5;
      mockRepository.getUnreadCount.mockResolvedValue(count);

      const result = await service.getUnreadCount(userId);

      expect(result).toEqual(count);
      expect(mockRepository.getUnreadCount).toHaveBeenCalledWith(userId);
    });
  });

  describe('findByType', () => {
    it('should return notifications by type', async () => {
      const userId = new Types.ObjectId().toString();
      const type = 'info';
      const semester = '2025-1';
      const notifications = [mockNotification];
      mockRepository.findByType.mockResolvedValue(notifications);

      const result = await service.findByType(userId, type, semester);

      expect(result).toEqual(notifications);
      expect(mockRepository.findByType).toHaveBeenCalledWith(
        userId,
        type,
        semester,
      );
    });
  });

  describe('createSystemNotification', () => {
    it('should create a system notification', async () => {
      const userId = new Types.ObjectId().toString();
      const title = 'System Notification';
      const message = 'System message';
      const type = 'system';
      const semester = '2025-1';

      mockRepository.create.mockResolvedValue(mockNotification);

      const result = await service.createSystemNotification(
        userId,
        title,
        message,
        type,
        semester,
      );

      expect(result).toEqual(mockNotification);
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('createBulkNotifications', () => {
    it('should create notifications for multiple users', async () => {
      const userIds = [
        new Types.ObjectId().toString(),
        new Types.ObjectId().toString(),
      ];
      const title = 'Bulk Notification';
      const message = 'Bulk message';
      const type = 'info';
      const semester = '2025-1';

      mockRepository.create.mockResolvedValue(mockNotification);

      const result = await service.createBulkNotifications(
        userIds,
        title,
        message,
        type,
        semester,
      );

      expect(result).toHaveLength(2);
      expect(mockRepository.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('cleanupOldNotifications', () => {
    it('should cleanup old notifications', async () => {
      const days = 90;
      mockRepository.deleteOlderThan.mockResolvedValue(undefined);

      await service.cleanupOldNotifications(days);

      expect(mockRepository.deleteOlderThan).toHaveBeenCalledWith(days);
    });
  });
});
