import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { NotificationRepository } from './repositories/notification.repository';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification, NotificationType } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.notificationRepository.create(createNotificationDto);
  }

  async findAll(userId: string, semester?: string, page = 1, limit = 20): Promise<Notification[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException(`ID de usuario inválido: ${userId}`);
    }

    return this.notificationRepository.findAll(userId, semester, page, limit);
  }

  async findOne(id: string): Promise<Notification> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`ID de notificación inválido: ${id}`);
    }

    const notification = await this.notificationRepository.findOne(id);
    if (!notification) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }

    return notification;
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`ID de notificación inválido: ${id}`);
    }

    const updatedNotification = await this.notificationRepository.update(
      id,
      updateNotificationDto,
    );
    if (!updatedNotification) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }

    return updatedNotification;
  }

  async markAsRead(id: string): Promise<Notification> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`ID de notificación inválido: ${id}`);
    }

    const notification = await this.notificationRepository.markAsRead(id);
    if (!notification) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }

    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException(`ID de usuario inválido: ${userId}`);
    }

    return this.notificationRepository.markAllAsRead(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException(`ID de usuario inválido: ${userId}`);
    }

    return this.notificationRepository.getUnreadCount(userId);
  }

  async findByType(
    userId: string,
    type: string,
    semester?: string,
  ): Promise<Notification[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException(`ID de usuario inválido: ${userId}`);
    }

    return this.notificationRepository.findByType(userId, type, semester);
  }

  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    semester: string,
    relatedTo?: { type: string; id: Types.ObjectId },
  ): Promise<Notification> {
    // Construimos un objeto DTO básico
    const notificationDto: any = {
      userId,
      title,
      message,
      type,
      semester,
      isRead: false,
    };
    
    // Solo añadimos relatedTo si está definido
    if (relatedTo) {
      notificationDto.relatedTo = relatedTo;
    }

    return this.create(notificationDto);
  }

  async createBulkNotifications(
    userIds: string[],
    title: string,
    message: string,
    type: NotificationType,
    semester: string,
    relatedTo?: { type: string; id: Types.ObjectId },
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];

    for (const userId of userIds) {
      if (Types.ObjectId.isValid(userId)) {
        const notification = await this.createSystemNotification(
          userId,
          title,
          message,
          type,
          semester,
          relatedTo,
        );
        notifications.push(notification);
      }
    }

    return notifications;
  }

  async cleanupOldNotifications(days: number = 90): Promise<void> {
    return this.notificationRepository.deleteOlderThan(days);
  }
}
