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
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Notification } from './schemas/notification.schema';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Types } from 'mongoose';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener notificaciones del usuario actual' })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre (ej: 2025-1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificaciones',
    type: [Notification],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findAll(
    @GetUser('_id') userId: string,
    @Query('semester') semester?: string,
  ): Promise<Notification[]> {
    return this.notificationsService.findAll(userId, semester);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Obtener cantidad de notificaciones no leídas' })
  @ApiResponse({
    status: 200,
    description: 'Cantidad de notificaciones no leídas',
    type: Number,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getUnreadCount(
    @GetUser('_id') userId: string,
  ): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Get('by-type/:type')
  @ApiOperation({ summary: 'Obtener notificaciones por tipo' })
  @ApiParam({ name: 'type', description: 'Tipo de notificación' })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre (ej: 2025-1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificaciones por tipo',
    type: [Notification],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findByType(
    @GetUser('_id') userId: string,
    @Param('type') type: string,
    @Query('semester') semester?: string,
  ): Promise<Notification[]> {
    return this.notificationsService.findByType(userId, type, semester);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una notificación por ID' })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la notificación',
    type: Notification,
  })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findOne(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({
    status: 200,
    description: 'Notificación marcada como leída',
    type: Notification,
  })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({
    status: 200,
    description: 'Todas las notificaciones marcadas como leídas',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async markAllAsRead(
    @GetUser('_id') userId: string,
  ): Promise<{ success: boolean }> {
    await this.notificationsService.markAllAsRead(userId);
    return { success: true };
  }

  @Post('config')
  @ApiOperation({
    summary: 'Configurar notificaciones automáticas (Admin, Staff)',
  })
  @ApiResponse({
    status: 201,
    description: 'Configuración guardada exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async configureNotifications(
    @Body() config: any,
  ): Promise<{ success: boolean }> {
    // Aquí se implementaría la lógica para configurar notificaciones automáticas
    // Por ahora solo devolvemos éxito
    return { success: true };
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Enviar notificaciones a múltiples usuarios (Admin, Staff)',
  })
  @ApiResponse({
    status: 201,
    description: 'Notificaciones enviadas exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async sendBulkNotifications(
    @Body()
    bulkData: {
      userIds: string[];
      title: string;
      message: string;
      type: string;
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

    const notifications =
      await this.notificationsService.createBulkNotifications(
        userIds,
        title,
        message,
        type,
        semester,
        relatedToObj,
      );

    return { count: notifications.length };
  }
}
