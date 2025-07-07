import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { NotificationsService } from '../notifications.service';
import { NotificationType } from '../schemas/notification.schema';

@Injectable()
export class AdjustmentNotificationsService {
  constructor(private readonly notificationsService: NotificationsService) {}

  private async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    semester: string,
    adjustmentId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.notificationsService.createSystemNotification(
        userId,
        title,
        message,
        type,
        semester,
        { type: 'adjustment', id: new Types.ObjectId(adjustmentId) },
      );

      return {
        success: true,
        message: 'Notificación enviada correctamente',
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al enviar notificación: ${error.message}`,
      };
    }
  }

  async notifyNewAdjustment(
    teacherId: string,
    adjustmentId: string,
    studentName: string,
    courseName: string,
    adjustmentType: string,
    semester: string,
  ): Promise<{ success: boolean; message: string }> {
    const title = 'Nuevo ajuste razonable asignado';
    const message = `Tienes un nuevo ajuste razonable para ${studentName} en el curso ${courseName}`;

    return this.createNotification(
      teacherId,
      title,
      message,
      NotificationType.ADJUSTMENT_CREATED,
      semester,
      adjustmentId,
    );
  }

  async notifyAdjustmentRejected(
    teacherId: string,
    adjustmentId: string,
    studentName: string,
    courseName: string,
    adjustmentType: string,
    semester: string,
    reason: string,
  ): Promise<{ success: boolean; message: string }> {
    const title = 'Ajuste razonable rechazado';
    const message = `El ajuste razonable de tipo "${adjustmentType}" para ${studentName} en el curso ${courseName} ha sido rechazado. Razón: ${reason}`;

    return this.createNotification(
      teacherId,
      title,
      message,
      NotificationType.ADJUSTMENT_REJECTED,
      semester,
      adjustmentId,
    );
  }

  async notifyAdjustmentApproved(
    teacherId: string,
    adjustmentId: string,
    studentName: string,
    courseName: string,
    adjustmentType: string,
    semester: string,
  ): Promise<{ success: boolean; message: string }> {
    const title = 'Ajuste razonable aprobado';
    const message = `El ajuste razonable de tipo "${adjustmentType}" para ${studentName} en el curso ${courseName} ha sido aprobado.`;

    return this.createNotification(
      teacherId,
      title,
      message,
      NotificationType.ADJUSTMENT_APPROVED,
      semester,
      adjustmentId,
    );
  }

  async notifyAdjustmentImplemented(
    staffIds: string[],
    teacherId: string,
    teacherName: string,
    adjustmentId: string,
    studentName: string,
    courseName: string,
    semester: string,
  ): Promise<{ success: boolean; message: string }> {
    const title = 'Ajuste razonable implementado';
    const message = `El docente ${teacherName} ha marcado como implementado un ajuste razonable para ${studentName} en el curso ${courseName}.`;

    try {
      await Promise.all(
        staffIds.map((staffId) =>
          this.notificationsService.createSystemNotification(
            staffId,
            title,
            message,
            NotificationType.ADJUSTMENT_UPDATED,
            semester,
            { type: 'adjustment', id: new Types.ObjectId(adjustmentId) },
          ),
        ),
      );

      return {
        success: true,
        message:
          'Notificación de implementación de ajuste enviada correctamente',
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al enviar notificación: ${error.message}`,
      };
    }
  }
}
