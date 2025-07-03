import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { NotificationRepository } from './repositories/notification.repository';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification, NotificationPriority, NotificationType } from './schemas/notification.schema';
import { ConflictException } from '@nestjs/common';
import { AdjustmentNotificationDto, AdjustmentNotificationType } from './dto/adjustment-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
  const { adjustmentId, type } = createNotificationDto;

  if (adjustmentId && type) {
    const filter = {
  adjustmentId: adjustmentId, // usa el string directamente
  type,
};

const existingNotification = await this.notificationRepository.findOneByFilter(filter);

    if (existingNotification) {
      throw new ConflictException('Notificación ya existente para este ajuste y tipo.');

    }
  }

  return this.notificationRepository.create(createNotificationDto);
}

async createAdjustmentNotification(dto: AdjustmentNotificationDto): Promise<Notification> {
  const notificationType = this.mapAdjustmentTypeToNotificationType(dto.notificationType);


  const createDto: CreateNotificationDto = {
    userId: dto.userId.toString(),
    title: 'Notificación de Ajuste Razonable',
    message: dto.reason || `Notificación tipo ${dto.notificationType}`,
    type: notificationType,            // <- aquí asignas el tipo correcto para la BD
    semester: dto.semester,
    isRead: false,
    priority: NotificationPriority.HIGH,
    adjustmentId: dto.adjustmentId.toString(),
    metadata: {
      adjustmentIndex: dto.adjustmentIndex,
      status: dto.status,
      reason: dto.reason,               // <- guarda reason en metadata
    },
  };

  return this.create(createDto);
}
private mapAdjustmentTypeToNotificationType(
  type: AdjustmentNotificationType,
): NotificationType {
  switch (type) {
    case AdjustmentNotificationType.NEW_ADJUSTMENT:
      return NotificationType.ADJUSTMENT_CREATED;
    case AdjustmentNotificationType.ADJUSTMENT_APPROVED:
      return NotificationType.ADJUSTMENT_APPROVED;
    case AdjustmentNotificationType.ADJUSTMENT_REJECTED:
      return NotificationType.ADJUSTMENT_REJECTED;
    case AdjustmentNotificationType.ADJUSTMENT_UPDATED:
      return NotificationType.ADJUSTMENT_UPDATED;
    default:
      return NotificationType.ADJUSTMENT_APPROVAL_NEEDED;
  }
}

  async findAll(userId: string, semester?: string): Promise<Notification[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException(`ID de usuario inválido: ${userId}`);
    }

    return this.notificationRepository.findAll(userId, semester);
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
