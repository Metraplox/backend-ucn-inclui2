import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Tipos de notificación del sistema
 */
export enum NotificationType {
  // Ajustes razonables
  ADJUSTMENT_CREATED = 'ADJUSTMENT_CREATED',
  ADJUSTMENT_UPDATED = 'ADJUSTMENT_UPDATED',
  ADJUSTMENT_APPROVAL_NEEDED = 'ADJUSTMENT_APPROVAL_NEEDED',
  ADJUSTMENT_APPROVED = 'ADJUSTMENT_APPROVED',
  ADJUSTMENT_REJECTED = 'ADJUSTMENT_REJECTED',
  
  // Estudiantes
  NEW_STUDENT = 'NEW_STUDENT',
  STUDENT_UPDATE = 'STUDENT_UPDATE',
  
  // Docentes
  TEACHER_ASSIGNMENT = 'TEACHER_ASSIGNMENT',
  TEACHER_ACKNOWLEDGMENT_NEEDED = 'TEACHER_ACKNOWLEDGMENT_NEEDED',
  TEACHER_ACKNOWLEDGMENT_RECEIVED = 'TEACHER_ACKNOWLEDGMENT_RECEIVED',
  
  // Recursos
  NEW_RESOURCE_AVAILABLE = 'NEW_RESOURCE_AVAILABLE',
  
  // Sistema
  REMINDER = 'REMINDER',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  
  // Solicitudes de ayuda
  HELP_REQUEST = 'HELP_REQUEST',
  HELP_REQUEST_RESPONSE = 'HELP_REQUEST_RESPONSE',
}

/**
 * Prioridad de la notificación
 */
export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export type NotificationDocument = Notification & Document;

@Schema({ 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
})
export class Notification {
  @ApiProperty({
    description: 'ID único de la notificación',
    example: '605c72ef9167f86c2cabc789',
  })
  declare _id: string;

  @ApiProperty({
    description: 'ID del usuario destinatario',
    example: '605c72ef9167f86c2cabc123',
  })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @ApiProperty({
    description: 'Título de la notificación',
    example: 'Actualización de ajuste razonable',
  })
  @Prop({ required: true, type: String })
  title: string;

  @ApiProperty({
    description: 'Mensaje detallado de la notificación',
    example: 'Se ha actualizado un ajuste para el estudiante Juan Pérez en el curso MAT101-1',
  })
  @Prop({ required: true, type: String })
  message: string;

  @ApiProperty({
    description: 'Tipo de notificación',
    enum: NotificationType,
    example: NotificationType.ADJUSTMENT_UPDATED,
  })
  @Prop({ 
    required: true, 
    type: String, 
    enum: Object.values(NotificationType),
    index: true 
  })
  type: NotificationType;

  @ApiProperty({
    description: 'Semestre académico relacionado (formato YYYY-P)',
    example: '2025-1',
  })
  @Prop({ 
    required: true, 
    type: String, 
    index: true,
    match: /^\d{4}-[1-2]$/ 
  })
  semester: string;
  
  @ApiProperty({
    description: 'Indica si la notificación ha sido leída',
    example: false,
    default: false
  })
  @Prop({ 
    type: Boolean, 
    default: false,
    index: true 
  })
  isRead: boolean;
  
  @ApiProperty({
    description: 'Prioridad de la notificación',
    enum: NotificationPriority,
    example: NotificationPriority.MEDIUM,
    default: NotificationPriority.MEDIUM
  })
  @Prop({ 
    type: String, 
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.MEDIUM,
    index: true 
  })
  priority: NotificationPriority;
  
  @ApiPropertyOptional({
    description: 'ID del estudiante relacionado (opcional)',
    example: '605c72ef9167f86c2cabc456',
  })
  @Prop({ type: Types.ObjectId, ref: 'Student', index: true })
  studentId?: Types.ObjectId;
  
  @ApiPropertyOptional({
    description: 'ID del ajuste relacionado (opcional)',
    example: '605c72ef9167f86c2cabc789',
  })
  @Prop({ type: Types.ObjectId, ref: 'Adjustment', index: true })
  adjustmentId?: Types.ObjectId;
  
  @ApiPropertyOptional({
    description: 'ID del curso relacionado (opcional)',
    example: '605c72ef9167f86c2cabc012',
  })
  @Prop({ type: Types.ObjectId, ref: 'Course', index: true })
  courseId?: Types.ObjectId;
  
  @ApiPropertyOptional({
    description: 'ID del recurso relacionado (opcional)',
    example: '605c72ef9167f86c2cabc345',
  })
  @Prop({ type: Types.ObjectId, ref: 'Resource', index: true })
  resourceId?: Types.ObjectId;
  
  @ApiPropertyOptional({
    description: 'Metadatos adicionales en formato JSON',
    example: { actionUrl: '/adjustments/123', relatedEntity: 'adjustment' },
  })
  @Prop({ type: Object })
  metadata?: Record<string, any>;
  
  @ApiProperty({
    description: 'Fecha de expiración de la notificación',
    example: '2025-12-31T23:59:59.999Z',
  })
  @Prop({ type: Date, index: true })
  expiresAt?: Date;
  
  // Campos virtuales para relaciones
  @ApiProperty({
    description: 'Usuario destinatario (virtual)',
  })
  @Prop({
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
  })
  user?: any;
  
  @ApiProperty({
    description: 'Estudiante relacionado (virtual)',
  })
  @Prop({
    ref: 'Student',
    localField: 'studentId',
    foreignField: '_id',
    justOne: true,
  })
  student?: any;
  
  @ApiProperty({
    description: 'Ajuste relacionado (virtual)',
  })
  @Prop({
    ref: 'Adjustment',
    localField: 'adjustmentId',
    foreignField: '_id',
    justOne: true,
  })
  adjustment?: any;
  
  @ApiProperty({
    description: 'Curso relacionado (virtual)',
  })
  @Prop({
    ref: 'Course',
    localField: 'courseId',
    foreignField: '_id',
    justOne: true,
  })
  course?: any;
  
  @ApiProperty({
    description: 'Recurso relacionado (virtual)',
  })
  @Prop({
    ref: 'Resource',
    localField: 'resourceId',
    foreignField: '_id',
    justOne: true,
  })
  resource?: any;

  @ApiProperty({
    description: 'Referencia al objeto relacionado',
    type: Object,
  })
  @Prop({
    type: {
      type: { type: String, enum: ['adjustment', 'student', 'course'] },
      id: { type: Types.ObjectId },
    },
  })
  relatedTo: {
    type: string;
    id: Types.ObjectId;
  };

  @ApiProperty({
    description: 'Indica si la notificación ha sido leída',
    example: false,
  })
  @Prop({ type: Boolean, default: false, index: true })
  isRead: boolean;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2023-01-01T12:00:00.000Z',
    readOnly: true,
  })
  declare createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    example: '2023-01-02T15:30:00.000Z',
    readOnly: true,
  })
  declare updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
