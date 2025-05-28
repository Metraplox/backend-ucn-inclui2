import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../notifications.service';
import { AdjustmentNotificationType } from '../dto/adjustment-notification.dto';
import { Types } from 'mongoose';
import { AdjustmentStatus } from '../../adjustments/schemas/adjustment.schema';

@Injectable()
export class AdjustmentNotificationsService {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Crea una notificación cuando se asigna un nuevo ajuste razonable a un docente
   */
  async notifyNewAdjustment(
    teacherId: string,
    adjustmentId: string,
    studentName: string,
    courseName: string,
    adjustmentType: string,
    semester: string,
  ): Promise<void> {
    await this.notificationsService.createSystemNotification(
      teacherId,
      'Nuevo ajuste razonable asignado',
      `Se ha asignado un nuevo ajuste razonable de tipo "${adjustmentType}" para ${studentName} en el curso ${courseName}.`,
      AdjustmentNotificationType.NEW_ADJUSTMENT,
      semester,
      {
        type: 'adjustment',
        id: new Types.ObjectId(adjustmentId),
      },
    );
  }

  /**
   * Crea una notificación cuando un ajuste razonable es aprobado
   */
  async notifyAdjustmentApproved(
    teacherId: string,
    adjustmentId: string,
    studentName: string,
    courseName: string,
    adjustmentType: string,
    semester: string,
  ): Promise<void> {
    await this.notificationsService.createSystemNotification(
      teacherId,
      'Ajuste razonable aprobado',
      `El ajuste razonable de tipo "${adjustmentType}" para ${studentName} en el curso ${courseName} ha sido aprobado.`,
      AdjustmentNotificationType.ADJUSTMENT_APPROVED,
      semester,
      {
        type: 'adjustment',
        id: new Types.ObjectId(adjustmentId),
      },
    );
  }

  /**
   * Crea una notificación cuando un ajuste razonable es rechazado
   */
  async notifyAdjustmentRejected(
    teacherId: string,
    adjustmentId: string,
    studentName: string,
    courseName: string,
    adjustmentType: string,
    reason: string,
    semester: string,
  ): Promise<void> {
    await this.notificationsService.createSystemNotification(
      teacherId,
      'Ajuste razonable rechazado',
      `El ajuste razonable de tipo "${adjustmentType}" para ${studentName} en el curso ${courseName} ha sido rechazado. Motivo: ${reason}`,
      AdjustmentNotificationType.ADJUSTMENT_REJECTED,
      semester,
      {
        type: 'adjustment',
        id: new Types.ObjectId(adjustmentId),
      },
    );
  }

  /**
   * Crea una notificación cuando se solicita ayuda para un ajuste razonable
   */
  async notifyHelpRequested(
    staffIds: string[],
    teacherId: string,
    teacherName: string,
    adjustmentId: string,
    studentName: string,
    courseName: string,
    message: string,
    semester: string,
  ): Promise<void> {
    // Notificar a todo el personal de staff
    await this.notificationsService.createBulkNotifications(
      staffIds,
      'Solicitud de ayuda para ajuste razonable',
      `El docente ${teacherName} ha solicitado ayuda para implementar un ajuste razonable para ${studentName} en el curso ${courseName}: "${message}"`,
      AdjustmentNotificationType.ADJUSTMENT_HELP_REQUESTED,
      semester,
      {
        type: 'adjustment',
        id: new Types.ObjectId(adjustmentId),
      },
    );
  }

  /**
   * Crea una notificación cuando se resuelve una solicitud de ayuda
   */
  async notifyHelpResolved(
    teacherId: string,
    adjustmentId: string,
    studentName: string,
    courseName: string,
    resolution: string,
    semester: string,
  ): Promise<void> {
    await this.notificationsService.createSystemNotification(
      teacherId,
      'Respuesta a solicitud de ayuda',
      `Su solicitud de ayuda para el ajuste razonable de ${studentName} en el curso ${courseName} ha sido atendida: "${resolution}"`,
      AdjustmentNotificationType.ADJUSTMENT_HELP_RESOLVED,
      semester,
      {
        type: 'adjustment',
        id: new Types.ObjectId(adjustmentId),
      },
    );
  }

  /**
   * Crea una notificación cuando un ajuste es marcado como implementado
   */
  async notifyAdjustmentImplemented(
    staffIds: string[],
    teacherId: string,
    teacherName: string,
    adjustmentId: string,
    studentName: string,
    courseName: string,
    semester: string,
  ): Promise<void> {
    // Notificar al personal de staff
    await this.notificationsService.createBulkNotifications(
      staffIds,
      'Ajuste razonable implementado',
      `El docente ${teacherName} ha marcado como implementado un ajuste razonable para ${studentName} en el curso ${courseName}.`,
      AdjustmentNotificationType.ADJUSTMENT_IMPLEMENTED,
      semester,
      {
        type: 'adjustment',
        id: new Types.ObjectId(adjustmentId),
      },
    );
  }

  /**
   * Crea notificaciones basadas en cambios de estado del ajuste
   */
  async notifyStatusChange(
    recipientId: string,
    adjustmentId: string,
    studentName: string,
    courseName: string,
    adjustmentType: string,
    newStatus: AdjustmentStatus,
    comments: string,
    semester: string,
  ): Promise<void> {
    let title = '';
    let message = '';
    let type = '';

    switch (newStatus) {
      case AdjustmentStatus.APPROVED:
        title = 'Ajuste razonable aprobado';
        message = `El ajuste razonable de tipo "${adjustmentType}" para ${studentName} en el curso ${courseName} ha sido aprobado.`;
        type = AdjustmentNotificationType.ADJUSTMENT_APPROVED;
        break;
      case AdjustmentStatus.REJECTED:
        title = 'Ajuste razonable rechazado';
        message = `El ajuste razonable de tipo "${adjustmentType}" para ${studentName} en el curso ${courseName} ha sido rechazado. Motivo: ${comments || 'No especificado'}`;
        type = AdjustmentNotificationType.ADJUSTMENT_REJECTED;
        break;
      case AdjustmentStatus.IMPLEMENTED:
        title = 'Ajuste razonable implementado';
        message = `El ajuste razonable de tipo "${adjustmentType}" para ${studentName} en el curso ${courseName} ha sido marcado como implementado.`;
        type = AdjustmentNotificationType.ADJUSTMENT_IMPLEMENTED;
        break;
      default:
        return; // No notificar para otros estados
    }

    await this.notificationsService.createSystemNotification(
      recipientId,
      title,
      message,
      type,
      semester,
      {
        type: 'adjustment',
        id: new Types.ObjectId(adjustmentId),
      },
    );
  }
}
