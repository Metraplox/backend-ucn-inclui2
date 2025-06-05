import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

/**
 * Tipos de notificaciones específicas para ajustes razonables
 */
export enum AdjustmentNotificationType {
  // Notificaciones de estado
  NEW_ADJUSTMENT = 'new_adjustment',
  ADJUSTMENT_APPROVED = 'adjustment_approved',
  ADJUSTMENT_REJECTED = 'adjustment_rejected',
  ADJUSTMENT_IMPLEMENTED = 'adjustment_implemented',
  ADJUSTMENT_CANCELLED = 'adjustment_cancelled',
  ADJUSTMENT_EXPIRED = 'adjustment_expired',
  
  // Notificaciones de ayuda
  ADJUSTMENT_HELP_REQUESTED = 'adjustment_help_requested',
  ADJUSTMENT_HELP_RESOLVED = 'adjustment_help_resolved',
  
  // Notificación genérica de actualización
  ADJUSTMENT_UPDATED = 'adjustment_updated',
}

/**
 * DTO para crear notificaciones relacionadas con ajustes razonables
 */
export class AdjustmentNotificationDto {
  @ApiProperty({
    description: 'ID del usuario que recibirá la notificación',
    example: '5f8d0d55b54764421b71dddf',
  })
  @IsMongoId()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @ApiProperty({
    description: 'ID del ajuste relacionado con la notificación',
    example: '5f8d0d55b54764421b71ddde',
  })
  @IsMongoId()
  @IsNotEmpty()
  adjustmentId: Types.ObjectId;

  @ApiProperty({
    description: 'Índice del ajuste en el array',
    example: 0,
  })
  adjustmentIndex: number;

  @ApiProperty({
    description: 'Tipo de notificación de ajuste',
    enum: AdjustmentNotificationType,
    example: AdjustmentNotificationType.NEW_ADJUSTMENT,
  })
  @IsEnum(AdjustmentNotificationType)
  @IsNotEmpty()
  notificationType: AdjustmentNotificationType;
  
  @ApiProperty({
    description: 'Estado actual del ajuste',
    example: 'pending',
    required: false,
  })
  status?: string;
  
  @ApiProperty({
    description: 'Razón del cambio de estado',
    example: 'Documentación incompleta',
    required: false,
  })
  reason?: string;

  @ApiProperty({
    description: 'Semestre académico',
    example: '2025-1',
  })
  @IsString()
  @IsNotEmpty()
  semester: string;
}
