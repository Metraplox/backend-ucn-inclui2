import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Adjustment,
  AdjustmentDocument,
  AdjustmentStatus,
} from '../schemas/adjustment.schema';
import { AdjustmentNotificationsService } from '../../notifications/services/adjustment-notifications.service';

@Injectable()
export class AdjustmentWorkflowService {
  private readonly logger = new Logger(AdjustmentWorkflowService.name);

  constructor(
    @InjectModel(Adjustment.name)
    private adjustmentModel: Model<AdjustmentDocument>,
    private readonly adjustmentNotificationsService: AdjustmentNotificationsService,
  ) {}

  /**
   * Actualizar el estado de un ajuste con validaciones de transición
   */
  async updateStatus(
    adjustmentId: string,
    adjustmentIndex: number,
    newStatus: AdjustmentStatus,
    updatedByUserId: string,
    comments?: string,
  ): Promise<Adjustment> {
    if (!Types.ObjectId.isValid(adjustmentId)) {
      throw new BadRequestException('ID de ajuste inválido');
    }

    if (!Types.ObjectId.isValid(updatedByUserId)) {
      throw new BadRequestException('ID de usuario inválido');
    }

    // Verificar que el ajuste existe
    const adjustment = await this.adjustmentModel.findById(adjustmentId).exec();
    if (!adjustment) {
      throw new NotFoundException(
        `Ajuste con ID "${adjustmentId}" no encontrado`,
      );
    }

    // Verificar que el índice del ajuste actual es válido
    if (
      adjustmentIndex < 0 ||
      adjustmentIndex >= adjustment.currentAdjustments.length
    ) {
      throw new BadRequestException(
        `Índice de ajuste ${adjustmentIndex} fuera de rango`,
      );
    }

    const currentAdjustment = adjustment.currentAdjustments[adjustmentIndex];
    const currentStatus = currentAdjustment.estado;

    // Validar transición de estado
    if (!this.isValidStatusTransition(currentStatus, newStatus)) {
      throw new BadRequestException(
        `Transición de estado inválida: de ${currentStatus} a ${newStatus}`,
      );
    }

    // Crear el registro de historial
    const historyEntry = {
      previousStatus: currentStatus,
      newStatus: newStatus,
      updatedBy: new Types.ObjectId(updatedByUserId),
      updatedAt: new Date(),
      comments: comments || '',
    };

    // Actualizar el estado del ajuste y agregar al historial
    const updatePath = `currentAdjustments.${adjustmentIndex}.estado`;
    const updatedAdjustment = await this.adjustmentModel
      .findByIdAndUpdate(
        adjustmentId,
        {
          $set: { [updatePath]: newStatus },
          $push: { history: historyEntry },
        },
        { new: true },
      )
      .exec();

    if (!updatedAdjustment) {
      throw new NotFoundException(
        `Error al actualizar el estado del ajuste con ID "${adjustmentId}"`,
      );
    }

    // Enviar notificación si es necesario
    await this.sendStatusChangeNotification(
      updatedAdjustment,
      adjustmentIndex,
      currentStatus,
      newStatus,
      updatedByUserId,
    );

    return updatedAdjustment;
  }

  /**
   * Marcar un ajuste como leído
   */
  async markAsRead(
    adjustmentId: string,
    currentAdjustmentIndex: number,
    userId: string,
    comments?: string,
  ): Promise<Adjustment> {
    if (
      !Types.ObjectId.isValid(adjustmentId) ||
      !Types.ObjectId.isValid(userId)
    ) {
      throw new BadRequestException('ID de ajuste o usuario inválido');
    }

    // Verificar que el ajuste existe
    const adjustment = await this.adjustmentModel.findById(adjustmentId).exec();
    if (!adjustment) {
      throw new NotFoundException(
        `Ajuste con ID "${adjustmentId}" no encontrado`,
      );
    }

    // Verificar que el índice del ajuste actual es válido
    if (
      currentAdjustmentIndex < 0 ||
      currentAdjustmentIndex >= adjustment.currentAdjustments.length
    ) {
      throw new BadRequestException(
        `Índice de ajuste ${currentAdjustmentIndex} fuera de rango`,
      );
    }

    // Crear el objeto de lectura
    const readRecord = {
      userId: new Types.ObjectId(userId),
      readDate: new Date(),
      comments,
    };

    // Actualizar el ajuste para marcar como leído
    const updatePath = `currentAdjustments.${currentAdjustmentIndex}.readBy`;

    // Verificar si el usuario ya ha marcado como leído este ajuste
    const existingReadIndex = adjustment.currentAdjustments[
      currentAdjustmentIndex
    ].readBy?.findIndex((record) => record.userId.toString() === userId);

    let updateOperation;
    if (existingReadIndex !== undefined && existingReadIndex >= 0) {
      // Actualizar el registro existente
      updateOperation = {
        $set: { [`${updatePath}.${existingReadIndex}`]: readRecord },
      };
    } else {
      // Agregar un nuevo registro
      updateOperation = {
        $push: { [updatePath]: readRecord },
      };
    }

    const updatedAdjustment = await this.adjustmentModel
      .findByIdAndUpdate(adjustmentId, updateOperation, { new: true })
      .exec();

    if (!updatedAdjustment) {
      throw new NotFoundException(
        `Error al marcar como leído el ajuste con ID "${adjustmentId}"`,
      );
    }

    return updatedAdjustment;
  }

  /**
   * Solicitar ayuda para un ajuste
   */
  async requestHelp(
    adjustmentId: string,
    currentAdjustmentIndex: number,
    userId: string,
    description: string,
  ): Promise<Adjustment> {
    if (
      !Types.ObjectId.isValid(adjustmentId) ||
      !Types.ObjectId.isValid(userId)
    ) {
      throw new BadRequestException('ID de ajuste o usuario inválido');
    }

    // Verificar que el ajuste existe
    const adjustment = await this.adjustmentModel.findById(adjustmentId).exec();
    if (!adjustment) {
      throw new NotFoundException(
        `Ajuste con ID "${adjustmentId}" no encontrado`,
      );
    }

    // Verificar que el índice del ajuste actual es válido
    if (
      currentAdjustmentIndex < 0 ||
      currentAdjustmentIndex >= adjustment.currentAdjustments.length
    ) {
      throw new BadRequestException(
        `Índice de ajuste ${currentAdjustmentIndex} fuera de rango`,
      );
    }

    // Crear el objeto de solicitud de ayuda
    const helpRequest = {
      requestedBy: new Types.ObjectId(userId),
      requestDate: new Date(),
      description: description,
      status: 'pending' as const,
    };

    // Actualizar el ajuste para agregar la solicitud de ayuda
    const updatePath = `currentAdjustments.${currentAdjustmentIndex}.helpRequests`;

    const updatedAdjustment = await this.adjustmentModel
      .findByIdAndUpdate(
        adjustmentId,
        {
          $push: { [updatePath]: helpRequest },
        },
        { new: true },
      )
      .exec();

    if (!updatedAdjustment) {
      throw new NotFoundException(
        `Error al solicitar ayuda para el ajuste con ID "${adjustmentId}"`,
      );
    }

    // Enviar notificación de solicitud de ayuda
    await this.sendHelpRequestNotification(
      updatedAdjustment,
      currentAdjustmentIndex,
      userId,
      description,
    );

    return updatedAdjustment;
  }

  /**
   * Validar transiciones de estado permitidas
   */
  private isValidStatusTransition(
    currentStatus: AdjustmentStatus,
    newStatus: AdjustmentStatus,
  ): boolean {
    const validTransitions: Record<AdjustmentStatus, AdjustmentStatus[]> = {
      [AdjustmentStatus.PENDING]: [
        AdjustmentStatus.ACTIVE,
        AdjustmentStatus.REJECTED,
      ],
      [AdjustmentStatus.ACTIVE]: [
        AdjustmentStatus.COMPLETED,
        AdjustmentStatus.CANCELLED,
        AdjustmentStatus.PENDING,
      ],
      [AdjustmentStatus.COMPLETED]: [AdjustmentStatus.ACTIVE],
      [AdjustmentStatus.CANCELLED]: [AdjustmentStatus.PENDING],
      [AdjustmentStatus.REJECTED]: [AdjustmentStatus.PENDING],
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  /**
   * Enviar notificación de cambio de estado
   */
  private async sendStatusChangeNotification(
    adjustment: Adjustment,
    adjustmentIndex: number,
    oldStatus: AdjustmentStatus,
    newStatus: AdjustmentStatus,
    updatedByUserId: string,
  ): Promise<void> {
    try {
      // Implementar lógica de notificación según el tipo de cambio de estado
      this.logger.log(
        `Estado cambiado para ajuste ${adjustment._id}: ${oldStatus} → ${newStatus}`,
      );
    } catch (error) {
      this.logger.error('Error enviando notificación de cambio de estado:', error);
    }
  }

  /**
   * Enviar notificación de solicitud de ayuda
   */
  private async sendHelpRequestNotification(
    adjustment: Adjustment,
    adjustmentIndex: number,
    userId: string,
    description: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `Solicitud de ayuda para ajuste ${adjustment._id} por usuario ${userId}`,
      );
    } catch (error) {
      this.logger.error('Error enviando notificación de solicitud de ayuda:', error);
    }
  }
}
