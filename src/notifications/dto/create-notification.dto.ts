import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  Matches,
  IsObject,
  ValidateIf,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsDateString
} from 'class-validator';
import { NotificationType, NotificationPriority } from '../schemas/notification.schema';

export class RelatedToDto {
  @ApiProperty({
    description: 'Tipo del objeto relacionado',
    enum: ['adjustment', 'student', 'course'],
    example: 'adjustment',
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiPropertyOptional({
    description: 'ID del objeto relacionado',
    example: '605c72ef9167f86c2cabc123',
  })
  @IsMongoId()
  @IsOptional()
  id?: string;
}

export class CreateNotificationDto {
  @ApiProperty({
    description: 'ID del usuario destinatario',
    example: '605c72ef9167f86c2cabc123',
  })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Título de la notificación',
    example: 'Actualización de ajuste razonable',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[^<>]*$/, { message: 'El título no puede contener caracteres HTML' })
  title: string;

  @ApiProperty({
    description: 'Mensaje detallado de la notificación',
    example: 'Se ha actualizado un ajuste para el estudiante Juan Pérez en el curso MAT101-1',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[^<>]*$/, { message: 'El mensaje no puede contener caracteres HTML' })
  message: string;

  @ApiProperty({
    description: 'Tipo de notificación',
    enum: NotificationType,
    example: NotificationType.ADJUSTMENT_UPDATED,
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiProperty({
    description: 'Semestre académico relacionado (formato YYYY-P)',
    example: '2025-1',
    pattern: '^\\d{4}-[1-2]$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-[1-2]$/, {
    message: 'El formato del semestre debe ser YYYY-P (ej: 2025-1)',
  })
  semester: string;

  @ApiProperty({
    description: 'Prioridad de la notificación',
    enum: NotificationPriority,
    example: NotificationPriority.MEDIUM,
    default: NotificationPriority.MEDIUM,
  })
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @ApiPropertyOptional({
    description: 'ID del estudiante relacionado',
    example: '605c72ef9167f86c2cabc456',
  })
  @IsMongoId()
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'ID del ajuste relacionado',
    example: '605c72ef9167f86c2cabc789',
  })
  @IsMongoId()
  @IsOptional()
  adjustmentId?: string;

  @ApiPropertyOptional({
    description: 'ID del curso relacionado',
    example: '605c72ef9167f86c2cabc012',
  })
  @IsMongoId()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({
    description: 'ID del recurso relacionado',
    example: '605c72ef9167f86c2cabc345',
  })
  @IsMongoId()
  @IsOptional()
  resourceId?: string;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales en formato JSON',
    example: { 
      actionUrl: '/adjustments/123', 
      relatedEntity: 'adjustment',
      customData: { /* datos personalizados */ }
    },
  })
  @IsObject()
  @IsOptional()
  @ValidateIf(o => o.metadata !== undefined)
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Fecha de expiración de la notificación',
    example: '2025-12-31T23:59:59.999Z',
  })
  @IsDateString()
  @IsOptional()
  @ValidateIf(o => o.expiresAt !== undefined)
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'Indica si la notificación ha sido leída',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}

export class CreateMultipleNotificationsDto {
  @ApiProperty({
    description: 'Lista de IDs de usuarios destinatarios',
    example: ['605c72ef9167f86c2cabc123', '605c72ef9167f86c2cabc124'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsMongoId({ each: true })
  @IsNotEmpty()
  userIds: string[];

  @ApiProperty({
    description: 'Título de la notificación',
    example: 'Nuevo recurso disponible',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[^<>]*$/, { message: 'El título no puede contener caracteres HTML' })
  title: string;

  @ApiProperty({
    description: 'Mensaje detallado de la notificación',
    example: 'Se ha publicado un nuevo recurso de apoyo para tu curso',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[^<>]*$/, { message: 'El mensaje no puede contener caracteres HTML' })
  message: string;

  @ApiProperty({
    description: 'Tipo de notificación',
    enum: NotificationType,
    example: NotificationType.NEW_RESOURCE_AVAILABLE,
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiProperty({
    description: 'Semestre académico relacionado (formato YYYY-P)',
    example: '2025-1',
    pattern: '^\\d{4}-[1-2]$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-[1-2]$/, {
    message: 'El formato del semestre debe ser YYYY-P (ej: 2025-1)',
  })
  semester: string;

  @ApiProperty({
    description: 'Prioridad de la notificación',
    enum: NotificationPriority,
    example: NotificationPriority.MEDIUM,
    default: NotificationPriority.MEDIUM,
  })
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @ApiPropertyOptional({
    description: 'ID del estudiante relacionado',
    example: '605c72ef9167f86c2cabc456',
  })
  @IsMongoId()
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'ID del ajuste relacionado',
    example: '605c72ef9167f86c2cabc789',
  })
  @IsMongoId()
  @IsOptional()
  adjustmentId?: string;

  @ApiPropertyOptional({
    description: 'ID del curso relacionado',
    example: '605c72ef9167f86c2cabc012',
  })
  @IsMongoId()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({
    description: 'ID del recurso relacionado',
    example: '605c72ef9167f86c2cabc345',
  })
  @IsMongoId()
  @IsOptional()
  resourceId?: string;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales en formato JSON',
    example: { 
      actionUrl: '/resources/123', 
      relatedEntity: 'resource',
      customData: { /* datos personalizados */ }
    },
  })
  @IsObject()
  @IsOptional()
  @ValidateIf(o => o.metadata !== undefined)
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Fecha de expiración de la notificación',
    example: '2025-12-31T23:59:59.999Z',
  })
  @IsDateString()
  @IsOptional()
  @ValidateIf(o => o.expiresAt !== undefined)
  expiresAt?: string;
}
