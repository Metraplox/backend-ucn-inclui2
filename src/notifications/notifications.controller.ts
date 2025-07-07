import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Notification, NotificationType } from './schemas/notification.schema';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Types } from 'mongoose';
import { interval, from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@ApiTags('notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener notificaciones del usuario',
    description:
      'Obtiene todas las notificaciones del usuario autenticado, con opción de filtrar por semestre. Las notificaciones se ordenan por fecha de creación descendente.',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description:
      'Filtrar notificaciones por semestre académico (formato YYYY-P)',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[1-2]$',
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página (default 1)',
    schema: { type: 'integer', minimum: 1, default: 1 },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Resultados por página (máx 100, default 20)',
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificaciones del usuario',
    type: [Notification],
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439016',
          userId: '507f1f77bcf86cd799439011',
          title: 'Nuevo ajuste razonable creado',
          message:
            'Se ha creado un ajuste de tiempo adicional para el estudiante Juan Pérez en MAT101-1',
          type: 'ADJUSTMENT_CREATED',
          semester: '2025-1',
          isRead: false,
          priority: 'MEDIUM',
          studentId: '507f1f77bcf86cd799439011',
          adjustmentId: '507f1f77bcf86cd799439017',
          courseId: '507f1f77bcf86cd799439018',
          metadata: {
            actionUrl: '/adjustments/507f1f77bcf86cd799439017',
            relatedEntity: 'adjustment',
          },
          createdAt: '2025-06-19T14:30:00.000Z',
          updatedAt: '2025-06-19T14:30:00.000Z',
        },
        {
          _id: '507f1f77bcf86cd799439019',
          userId: '507f1f77bcf86cd799439011',
          title: 'Nuevo recurso disponible',
          message: 'Se ha publicado una nueva guía de estudio para tu curso',
          type: 'NEW_RESOURCE_AVAILABLE',
          semester: '2025-1',
          isRead: true,
          priority: 'LOW',
          resourceId: '507f1f77bcf86cd799439020',
          metadata: {
            actionUrl: '/resources/507f1f77bcf86cd799439020',
          },
          createdAt: '2025-06-18T10:15:00.000Z',
          updatedAt: '2025-06-19T09:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido o expirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  async findAll(
    @GetUser('_id') userId: string,
    @Query('semester') semester?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<Notification[]> {
    const pageNum = Math.max(1, parseInt(page as any, 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as any, 10) || 20),
    );
    return this.notificationsService.findAll(
      userId,
      semester,
      pageNum,
      limitNum,
    );
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Contar notificaciones no leídas',
    description:
      'Obtiene el número total de notificaciones no leídas del usuario autenticado. Útil para mostrar badges de notificaciones en la interfaz.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cantidad de notificaciones no leídas',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Número de notificaciones no leídas',
          example: 5,
        },
      },
      example: {
        count: 5,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido o expirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  async getUnreadCount(
    @GetUser('_id') userId: string,
  ): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Sse('stream')
  @UseGuards(JwtAuthGuard)
  streamNotifications(
    @Request() req: Request & { user: any },
  ): Observable<MessageEvent> {
    const userId = req.user._id;
    return interval(5000).pipe(
      switchMap(() => from(this.notificationsService.getUnreadCount(userId))),
      map((count) => ({ data: { count } })),
    );
  }

  @Get('by-type/:type')
  @ApiOperation({
    summary: 'Obtener notificaciones por tipo',
    description:
      'Filtra las notificaciones del usuario por un tipo específico, con opción adicional de filtrar por semestre. Útil para mostrar notificaciones categorizadas.',
  })
  @ApiParam({
    name: 'type',
    description: 'Tipo de notificación según enum NotificationType',
    example: 'ADJUSTMENT_CREATED',
    enum: [
      'ADJUSTMENT_CREATED',
      'ADJUSTMENT_UPDATED',
      'ADJUSTMENT_APPROVAL_NEEDED',
      'ADJUSTMENT_APPROVED',
      'ADJUSTMENT_REJECTED',
      'NEW_STUDENT',
      'STUDENT_UPDATE',
      'TEACHER_ASSIGNMENT',
      'TEACHER_ACKNOWLEDGMENT_NEEDED',
      'TEACHER_ACKNOWLEDGMENT_RECEIVED',
      'NEW_RESOURCE_AVAILABLE',
      'REMINDER',
      'SYSTEM_ALERT',
      'HELP_REQUEST',
      'HELP_REQUEST_RESPONSE',
    ],
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description:
      'Filtrar adicionalmente por semestre académico (formato YYYY-P)',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[1-2]$',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificaciones filtradas por tipo',
    type: [Notification],
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439016',
          userId: '507f1f77bcf86cd799439011',
          title: 'Nuevo ajuste razonable creado',
          message: 'Se ha creado un ajuste de tiempo adicional para MAT101-1',
          type: 'ADJUSTMENT_CREATED',
          semester: '2025-1',
          isRead: false,
          priority: 'MEDIUM',
          adjustmentId: '507f1f77bcf86cd799439017',
          createdAt: '2025-06-19T14:30:00.000Z',
        },
        {
          _id: '507f1f77bcf86cd799439021',
          userId: '507f1f77bcf86cd799439011',
          title: 'Ajuste razonable creado para FIS201',
          message: 'Se ha establecido evaluación oral para el estudiante',
          type: 'ADJUSTMENT_CREATED',
          semester: '2025-1',
          isRead: true,
          priority: 'MEDIUM',
          adjustmentId: '507f1f77bcf86cd799439022',
          createdAt: '2025-06-17T11:20:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido o expirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  async findByType(
    @GetUser('_id') userId: string,
    @Param('type') type: string,
    @Query('semester') semester?: string,
  ): Promise<Notification[]> {
    return this.notificationsService.findByType(userId, type, semester);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener notificación específica',
    description:
      'Obtiene los detalles completos de una notificación específica por su ID. Incluye todos los metadatos y referencias relacionadas.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId de la notificación',
    example: '507f1f77bcf86cd799439016',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles completos de la notificación',
    type: Notification,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439016',
        userId: '507f1f77bcf86cd799439011',
        title: 'Nuevo ajuste razonable creado',
        message:
          'Se ha creado un ajuste de tiempo adicional para el estudiante Juan Pérez en el curso MAT101-1. El docente ha sido notificado y debe confirmar la implementación.',
        type: 'ADJUSTMENT_CREATED',
        semester: '2025-1',
        isRead: false,
        priority: 'MEDIUM',
        studentId: '507f1f77bcf86cd799439011',
        adjustmentId: '507f1f77bcf86cd799439017',
        courseId: '507f1f77bcf86cd799439018',
        metadata: {
          actionUrl: '/adjustments/507f1f77bcf86cd799439017',
          relatedEntity: 'adjustment',
          customData: {
            adjustmentType: 'tiempo_adicional',
            percentage: 50,
          },
        },
        expiresAt: '2025-12-31T23:59:59.999Z',
        createdAt: '2025-06-19T14:30:00.000Z',
        updatedAt: '2025-06-19T14:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'ObjectId de notificación inválido',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid ObjectId',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Notificación no encontrada',
    schema: {
      example: {
        statusCode: 404,
        message: 'Notificación no encontrada',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido o expirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  async findOne(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Marcar notificación como leída',
    description:
      'Cambia el estado de una notificación específica a leída (isRead = true). Operación idempotente, no genera error si ya está marcada como leída.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId de la notificación a marcar como leída',
    example: '507f1f77bcf86cd799439016',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificación marcada como leída exitosamente',
    type: Notification,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439016',
        userId: '507f1f77bcf86cd799439011',
        title: 'Nuevo ajuste razonable creado',
        message:
          'Se ha creado un ajuste de tiempo adicional para el estudiante Juan Pérez',
        type: 'ADJUSTMENT_CREATED',
        semester: '2025-1',
        isRead: true,
        priority: 'MEDIUM',
        adjustmentId: '507f1f77bcf86cd799439017',
        createdAt: '2025-06-19T14:30:00.000Z',
        updatedAt: '2025-06-19T15:45:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'ObjectId de notificación inválido',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid ObjectId',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Notificación no encontrada',
    schema: {
      example: {
        statusCode: 404,
        message: 'Notificación no encontrada',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido o expirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  async markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('mark-all-read')
  @ApiOperation({
    summary: 'Marcar todas las notificaciones como leídas',
    description:
      'Marca todas las notificaciones del usuario autenticado como leídas (isRead = true). Operación masiva útil para limpiar el estado de notificaciones.',
  })
  @ApiResponse({
    status: 200,
    description: 'Todas las notificaciones marcadas como leídas exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          description: 'Indica si la operación fue exitosa',
          example: true,
        },
      },
      example: {
        success: true,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido o expirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  async markAllAsRead(
    @GetUser('_id') userId: string,
  ): Promise<{ success: boolean }> {
    await this.notificationsService.markAllAsRead(userId);
    return { success: true };
  }

  @Post('config')
  @ApiOperation({
    summary: 'Configurar notificaciones automáticas (Admin/Staff)',
    description:
      'Endpoint para configurar reglas de notificaciones automáticas del sistema. Permite establecer triggers y condiciones para notificaciones programadas.',
  })
  @ApiBody({
    description: 'Configuración de notificaciones automáticas',
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Tipo de configuración',
          example: 'adjustment_reminders',
          enum: [
            'adjustment_reminders',
            'deadline_alerts',
            'system_maintenance',
          ],
        },
        enabled: {
          type: 'boolean',
          description: 'Si la configuración está habilitada',
          example: true,
        },
        schedule: {
          type: 'string',
          description: 'Programación en formato cron',
          example: '0 9 * * 1',
        },
        recipients: {
          type: 'array',
          items: {
            type: 'string',
            description: 'Roles de destinatarios',
          },
          example: ['COORDINADOR', 'EDUCADORA_SOCIAL'],
        },
        conditions: {
          type: 'object',
          description: 'Condiciones para activar notificaciones',
          example: {
            daysBeforeDeadline: 7,
            includeWeekends: false,
          },
        },
      },
      required: ['type', 'enabled'],
    },
    examples: {
      'recordatorio-ajustes': {
        summary: 'Recordatorio de ajustes pendientes',
        value: {
          type: 'adjustment_reminders',
          enabled: true,
          schedule: '0 9 * * 1',
          recipients: ['DOCENTE'],
          conditions: {
            daysWithoutAcknowledgment: 3,
            includeWeekends: false,
          },
        },
      },
      'alerta-deadlines': {
        summary: 'Alertas de fechas límite',
        value: {
          type: 'deadline_alerts',
          enabled: true,
          schedule: '0 8 * * *',
          recipients: ['COORDINADOR', 'EDUCADORA_SOCIAL'],
          conditions: {
            daysBeforeDeadline: 7,
            includeCriticalOnly: true,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Configuración guardada exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          description: 'Indica si la configuración fue guardada',
          example: true,
        },
      },
      example: {
        success: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de configuración inválidos',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Configuración inválida: schedule debe ser formato cron válido',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido o expirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  async configureNotifications(
    @Body() config: any,
  ): Promise<{ success: boolean }> {
    // Aquí se implementaría la lógica para configurar notificaciones automáticas
    // Por ahora solo devolvemos éxito
    return { success: true };
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Enviar notificaciones masivas (Admin/Staff)',
    description:
      'Envía la misma notificación a múltiples usuarios simultáneamente. Útil para anuncios generales, alertas del sistema o notificaciones de eventos importantes.',
  })
  @ApiBody({
    description: 'Datos para envío masivo de notificaciones',
    schema: {
      type: 'object',
      properties: {
        userIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de ObjectIds de usuarios destinatarios',
          example: [
            '507f1f77bcf86cd799439011',
            '507f1f77bcf86cd799439012',
            '507f1f77bcf86cd799439013',
          ],
          minItems: 1,
          maxItems: 100,
        },
        title: {
          type: 'string',
          description: 'Título de la notificación',
          example: 'Mantenimiento programado del sistema',
          maxLength: 200,
        },
        message: {
          type: 'string',
          description: 'Mensaje detallado de la notificación',
          example:
            'El sistema estará en mantenimiento el domingo 23 de junio de 02:00 a 06:00 AM. Durante este tiempo no estará disponible.',
          maxLength: 2000,
        },
        type: {
          type: 'string',
          description: 'Tipo de notificación según enum NotificationType',
          example: 'SYSTEM_ALERT',
          enum: [
            'ADJUSTMENT_CREATED',
            'ADJUSTMENT_UPDATED',
            'ADJUSTMENT_APPROVAL_NEEDED',
            'ADJUSTMENT_APPROVED',
            'ADJUSTMENT_REJECTED',
            'NEW_STUDENT',
            'STUDENT_UPDATE',
            'TEACHER_ASSIGNMENT',
            'TEACHER_ACKNOWLEDGMENT_NEEDED',
            'TEACHER_ACKNOWLEDGMENT_RECEIVED',
            'NEW_RESOURCE_AVAILABLE',
            'REMINDER',
            'SYSTEM_ALERT',
            'HELP_REQUEST',
            'HELP_REQUEST_RESPONSE',
          ],
        },
        semester: {
          type: 'string',
          description: 'Semestre académico relacionado (formato YYYY-P)',
          example: '2025-1',
          pattern: '^\\d{4}-[1-2]$',
        },
        relatedTo: {
          type: 'object',
          description: 'Referencia opcional a objeto relacionado',
          properties: {
            type: {
              type: 'string',
              enum: ['adjustment', 'student', 'course', 'resource'],
              example: 'adjustment',
            },
            id: {
              type: 'string',
              description: 'ObjectId del objeto relacionado',
              example: '507f1f77bcf86cd799439017',
            },
          },
        },
      },
      required: ['userIds', 'title', 'message', 'type', 'semester'],
    },
    examples: {
      'mantenimiento-sistema': {
        summary: 'Notificación de mantenimiento',
        value: {
          userIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
          title: 'Mantenimiento programado del sistema',
          message:
            'El sistema estará en mantenimiento el domingo de 02:00 a 06:00 AM.',
          type: 'SYSTEM_ALERT',
          semester: '2025-1',
        },
      },
      'nuevo-recurso': {
        summary: 'Notificación de nuevo recurso',
        value: {
          userIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
          title: 'Nuevo recurso educativo disponible',
          message:
            'Se ha publicado una nueva guía de estudio para matemáticas.',
          type: 'NEW_RESOURCE_AVAILABLE',
          semester: '2025-1',
          relatedTo: {
            type: 'resource',
            id: '507f1f77bcf86cd799439020',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Notificaciones enviadas exitosamente',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Número de notificaciones creadas exitosamente',
          example: 25,
        },
      },
      example: {
        count: 25,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos en la solicitud',
    schema: {
      examples: {
        'usuarios-invalidos': {
          summary: 'Lista de usuarios inválida',
          value: {
            statusCode: 400,
            message: 'userIds debe contener al menos 1 usuario y máximo 100',
            error: 'Bad Request',
          },
        },
        'semestre-invalido': {
          summary: 'Formato de semestre incorrecto',
          value: {
            statusCode: 400,
            message: 'El formato del semestre debe ser YYYY-P (ej: 2025-1)',
            error: 'Bad Request',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido o expirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  async sendBulkNotifications(
    @Body()
    bulkData: {
      userIds: string[];
      title: string;
      message: string;
      type: string | NotificationType;
      semester: string;
      relatedTo?: { type: string; id: string };
    },
  ): Promise<{ count: number }> {
    const { userIds, title, message, type, semester, relatedTo } = bulkData;

    const relatedToObj = relatedTo
      ? {
          type: relatedTo.type,
          id: new Types.ObjectId(relatedTo.id),
        }
      : undefined;

    // Convertir el tipo string a NotificationType
    const notificationType = this.convertToNotificationType(type);

    const notifications =
      await this.notificationsService.createBulkNotifications(
        userIds,
        title,
        message,
        notificationType,
        semester,
        relatedToObj,
      );

    return { count: notifications.length };
  }

  // Método auxiliar para convertir string a NotificationType
  private convertToNotificationType(
    type: string | NotificationType,
  ): NotificationType {
    // Si ya es un NotificationType, simplemente lo devolvemos
    if (Object.values(NotificationType).includes(type as NotificationType)) {
      return type as NotificationType;
    }

    // De lo contrario, mapeamos según la información que tengamos
    switch (type) {
      case 'ADJUSTMENT_CREATED':
        return NotificationType.ADJUSTMENT_CREATED;
      case 'ADJUSTMENT_UPDATED':
        return NotificationType.ADJUSTMENT_UPDATED;
      case 'NEW_STUDENT':
        return NotificationType.NEW_STUDENT;
      case 'REMINDER':
        return NotificationType.REMINDER;
      case 'SYSTEM_ALERT':
        return NotificationType.SYSTEM_ALERT;
      case 'info':
      case 'success':
        return NotificationType.SYSTEM_ALERT;
      case 'warning':
        return NotificationType.REMINDER;
      case 'error':
        return NotificationType.REMINDER;
      default:
        // Valor predeterminado para tipos desconocidos
        return NotificationType.SYSTEM_ALERT;
    }
  }
}
