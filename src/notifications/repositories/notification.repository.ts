import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from '../schemas/notification.schema';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const createdNotification = new this.notificationModel(
      createNotificationDto,
    );
    return createdNotification.save();
  }

  async findAll(userId: string, semester?: string, page = 1, limit = 20): Promise<Notification[]> {
    const query: any = { userId: new Types.ObjectId(userId) };

    if (semester) {
      query.semester = semester;
    }

    const skip = (page - 1) * limit;

    return this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findOne(id: string): Promise<Notification | null> {
    return this.notificationModel.findById(id).exec();
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification | null> {
    return this.notificationModel
      .findByIdAndUpdate(id, updateNotificationDto, { new: true })
      .exec();
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return this.notificationModel
      .findByIdAndUpdate(id, { isRead: true }, { new: true })
      .exec();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel
      .updateMany(
        { userId: new Types.ObjectId(userId), isRead: false },
        { isRead: true },
      )
      .exec();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel
      .countDocuments({ userId: new Types.ObjectId(userId), isRead: false })
      .exec();
  }

  async findByType(
    userId: string,
    type: string,
    semester?: string,
  ): Promise<Notification[]> {
    const query: any = {
      userId: new Types.ObjectId(userId),
      type,
    };

    if (semester) {
      query.semester = semester;
    }

    return this.notificationModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async deleteOlderThan(days: number): Promise<void> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    await this.notificationModel
      .deleteMany({ createdAt: { $lt: date } })
      .exec();
  }
}
