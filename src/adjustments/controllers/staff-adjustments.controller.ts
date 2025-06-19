import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { AdjustmentStatus } from '../schemas/adjustment.schema';
import { NotificationType } from '../../notifications/schemas/notification.schema';

// Removed local Role enum - using UserRole from schema
import { AdjustmentsService } from '../adjustments.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { Types } from 'mongoose';

@ApiTags('staff-adjustments')
@Controller('staff-adjustments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class StaffAdjustmentsController {
  constructor(
    private readonly adjustmentsService: AdjustmentsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get('help-requests')
  @Roles(UserRole.DIDDEC_STAFF, UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Obtener solicitudes de ayuda de docentes',
    description: 'Lista todas las solicitudes de ayuda enviadas por docentes para ajustes específicos. Permite filtrado por semestre y estado de la solicitud.'
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Semestre académico en formato YYYY-P',
    example: '2025-1'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Estado de la solicitud de ayuda',
    enum: ['pendiente', 'en_proceso', 'resuelto'],
    example: 'pendiente'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de solicitudes de ayuda con información detallada',
    example: [
      {
        adjustmentId: '507f1f77bcf86cd799439011',
        adjustmentIndex: 0,
        studentId: '507f1f77bcf86cd799439012',
        studentRut: '20.123.456-7',
        courseNrc: '30001',
        courseName: 'Dr. Juan Pérez',
        adjustmentType: 'Tiempo adicional',
        helpRequest: {
          userId: '507f1f77bcf86cd799439013',
          message: 'Necesito orientación sobre cómo implementar tiempo adicional en evaluaciones orales',
          status: 'pendiente',
          date: '2025-01-15T10:30:00.000Z'
        },
        semester: '2025-1'
      }
    ]
  })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos de staff DIDDEC o coordinador' })
  async getHelpRequests(
    @Query('semester') semester: string = '2025-1',
    @Query('status') status: string = 'pendiente',
  ): Promise<any[]> {
    const query: any = {
      'currentAdjustments.helpRequests': { $exists: true, $ne: [] },
    };

    if (status) {
      query['currentAdjustments.helpRequests.status'] = status;
    }

    if (semester) {
      query.semester = semester;
    }

    const adjustments = await this.adjustmentsService.findAll(query);

    // Formatear las solicitudes de ayuda para una vista más clara
    const helpRequests: any[] = [];
    for (const adjustment of adjustments) {
      for (let i = 0; i < adjustment.currentAdjustments.length; i++) {
        const currAdj = adjustment.currentAdjustments[i];
        if (currAdj.helpRequests && currAdj.helpRequests.length > 0) {
          for (const helpRequest of currAdj.helpRequests) {
            if (!status || helpRequest.status === status) {
              helpRequests.push({
                adjustmentId: adjustment._id,
                adjustmentIndex: i,
                studentId: adjustment.studentId,
                studentRut: adjustment.studentRut,
                courseNrc: currAdj.courseNrc,
                courseName: currAdj.profesor || 'Sin asignar',
                adjustmentType: currAdj.type,
                helpRequest: helpRequest,
                semester: adjustment.semester,
              });
            }
          }
        }
      }
    }

    return helpRequests;
  }

  @Get('help-requests/:adjustmentId/:adjustmentIndex')
  @Roles(UserRole.DIDDEC_STAFF, UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Detalle de solicitud de ayuda específica',
    description: 'Obtiene información completa de una solicitud de ayuda específica incluyendo contexto del ajuste y del estudiante.'
  })
  @ApiParam({ 
    name: 'adjustmentId', 
    description: 'ObjectId del ajuste razonable',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiParam({ 
    name: 'adjustmentIndex', 
    description: 'Índice del ajuste específico en el array de ajustes actuales',
    example: '0'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Detalle completo de la solicitud de ayuda',
    example: {
      adjustmentId: '507f1f77bcf86cd799439011',
      adjustmentIndex: 0,
      studentId: '507f1f77bcf86cd799439012',
      studentRut: '20.123.456-7',
      courseNrc: '30001',
      courseName: 'Dr. Juan Pérez',
      adjustmentType: 'Tiempo adicional',
      adjustmentDetails: 'Estudiante requiere 50% tiempo adicional en evaluaciones debido a dislexia',
      helpRequests: [
        {
          userId: '507f1f77bcf86cd799439013',
          message: 'Necesito orientación sobre cómo implementar tiempo adicional en evaluaciones orales',
          status: 'pendiente',
          date: '2025-01-15T10:30:00.000Z'
        }
      ],
      semester: '2025-1'
    }
  })
  @ApiResponse({ status: 404, description: 'Ajuste o índice no encontrado' })
  async getHelpRequestDetail(
    @Param('adjustmentId') adjustmentId: string,
    @Param('adjustmentIndex') adjustmentIndex: string,
  ): Promise<any> {
    const adjustment = await this.adjustmentsService.findOne(adjustmentId);

    if (!adjustment) {
      throw new Error('Ajuste no encontrado');
    }

    const index = parseInt(adjustmentIndex);

    if (!adjustment.currentAdjustments[index]) {
      throw new Error('Índice de ajuste inválido');
    }

    const currAdj = adjustment.currentAdjustments[index];

    return {
      adjustmentId: adjustment._id,
      adjustmentIndex: index,
      studentId: adjustment.studentId,
      studentRut: adjustment.studentRut,
      courseNrc: currAdj.courseNrc,
      courseName: currAdj.profesor || 'Sin asignar',
      adjustmentType: currAdj.type,
      adjustmentDetails: currAdj.comentarios || '',
      helpRequests: currAdj.helpRequests || [],
      semester: adjustment.semester,
    };
  }

  @Patch('help-requests/:adjustmentId/:adjustmentIndex/status')
  @Roles(UserRole.DIDDEC_STAFF, UserRole.COORDINADOR)
  @ApiOperation({ 
    summary: 'Actualizar estado de solicitud de ayuda',
    description: 'Actualiza el estado de una solicitud de ayuda específica y envía notificación al docente solicitante.'
  })
  @ApiParam({ 
    name: 'adjustmentId', 
    description: 'ObjectId del ajuste razonable',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiParam({ 
    name: 'adjustmentIndex', 
    description: 'Índice del ajuste específico',
    example: '0'
  })
  @ApiBody({
    description: 'Nuevos datos de estado de la solicitud',
    examples: {
      'en_proceso': {
        value: {
          status: 'en_proceso',
          response: 'Hemos recibido tu consulta y te contactaremos en 24 horas con orientación específica'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de solicitud actualizado exitosamente',
    example: {
      _id: '507f1f77bcf86cd799439011',
      currentAdjustments: [
        {
          type: 'Tiempo adicional',
          helpRequests: [
            {
              status: 'en_proceso',
              responseDate: '2025-01-15T14:30:00.000Z',
              responseBy: '507f1f77bcf86cd799439020',
              response: 'Hemos recibido tu consulta y te contactaremos en 24 horas'
            }
          ]
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'Ajuste o índice no encontrado' })
  async updateHelpRequestStatus(
    @Param('adjustmentId') adjustmentId: string,
    @Param('adjustmentIndex') adjustmentIndex: string,
    @Body() updateDto: { status: string; response?: string },
    @Request() req,
  ): Promise<any> {
    const adjustment = await this.adjustmentsService.findOne(adjustmentId);

    if (!adjustment) {
      throw new Error('Ajuste no encontrado');
    }

    const index = parseInt(adjustmentIndex);

    if (!adjustment.currentAdjustments[index]) {
      throw new Error('Índice de ajuste inválido');
    }

    const currAdj = adjustment.currentAdjustments[index];

    if (!currAdj.helpRequests || currAdj.helpRequests.length === 0) {
      throw new Error('No hay solicitudes de ayuda para este ajuste');
    }

    // Actualizar el estado de la última solicitud
    const lastRequestIndex = currAdj.helpRequests.length - 1;
    const helpRequest = currAdj.helpRequests[lastRequestIndex];

    // Actualizar campos básicos
    helpRequest.status = updateDto.status;

    // Extender el tipo para incluir campos adicionales
    const extendedRequest = helpRequest as any;
    extendedRequest.responseDate = new Date();
    extendedRequest.responseBy = new Types.ObjectId(req.user.userId);

    if (updateDto.response) {
      extendedRequest.response = updateDto.response;
    }

    // Actualizar usando el modelo directamente
    const updatedAdjustment = await this.adjustmentsService.findByIdAndUpdate(
      adjustmentId,
      { currentAdjustments: adjustment.currentAdjustments },
    );

    // Notificar al docente sobre la actualización
    const teacherId = helpRequest.userId;
    await this.notificationsService.createSystemNotification(
      teacherId.toString(),
      'Respuesta a solicitud de ayuda',
      `Tu solicitud de ayuda para el ajuste en ${currAdj.courseNrc} ha sido ${updateDto.status}`,
      NotificationType.SYSTEM_ALERT,
      adjustment.semester || '2025-1'
    );
    
    return updatedAdjustment;
  }

  @Post(':id/:index/approve')
  @Roles(UserRole.DIDDEC_STAFF, UserRole.COORDINADOR)
  @ApiOperation({ 
    summary: 'Aprobar ajuste razonable',
    description: 'Aprueba un ajuste específico dentro del array de ajustes actuales de un estudiante. Envía notificación automática.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ObjectId del documento de ajustes del estudiante',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiParam({ 
    name: 'index', 
    description: 'Índice del ajuste específico en el array currentAdjustments',
    example: '0'
  })
  @ApiBody({
    description: 'Comentarios opcionales para la aprobación',
    examples: {
      'approval': {
        value: {
          comments: 'Ajuste aprobado. Se notificará al docente para implementación inmediata.'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ajuste aprobado exitosamente',
    example: {
      _id: '507f1f77bcf86cd799439011',
      currentAdjustments: [
        {
          type: 'Tiempo adicional',
          estado: 'approved',
          approvedBy: '507f1f77bcf86cd799439020',
          approvedAt: '2025-01-15T14:30:00.000Z',
          comments: 'Ajuste aprobado. Se notificará al docente para implementación inmediata.'
        }
      ]
    }
  })
  @ApiResponse({ status: 400, description: 'Índice inválido o transición de estado no permitida' })
  @ApiResponse({ status: 404, description: 'Documento de ajustes no encontrado' })
  async approveAdjustment(
    @Param('id') id: string,
    @Param('index') index: string,
    @Body() data: { comments?: string },
    @Request() req,
  ): Promise<any> {
    const adjustmentIndex = parseInt(index, 10);
    if (isNaN(adjustmentIndex)) {
      throw new BadRequestException('Índice de ajuste inválido');
    }

    const userId = req.user.userId;
    return this.adjustmentsService.updateStatus(
      id,
      adjustmentIndex,
      AdjustmentStatus.APPROVED,
      userId,
      data.comments || 'Ajuste aprobado por el administrador',
    );
  }

  @Post(':id/:index/reject')
  @Roles(UserRole.DIDDEC_STAFF, UserRole.COORDINADOR)
  @ApiOperation({ 
    summary: 'Rechazar ajuste razonable',
    description: 'Rechaza un ajuste específico y envía notificación al estudiante con los motivos del rechazo.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ObjectId del documento de ajustes del estudiante',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiParam({ 
    name: 'index', 
    description: 'Índice del ajuste específico en el array currentAdjustments',
    example: '0'
  })
  @ApiBody({
    description: 'Comentarios obligatorios explicando el motivo del rechazo',
    examples: {
      'rejection': {
        value: {
          comments: 'Ajuste rechazado: La documentación médica presentada no es suficiente para justificar este tipo de ajuste.'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ajuste rechazado exitosamente',
    example: {
      _id: '507f1f77bcf86cd799439011',
      currentAdjustments: [
        {
          type: 'Tiempo adicional',
          estado: 'rejected',
          rejectedBy: '507f1f77bcf86cd799439020',
          rejectedAt: '2025-01-15T14:30:00.000Z',
          comments: 'Ajuste rechazado: La documentación médica presentada no es suficiente'
        }
      ]
    }
  })
  @ApiResponse({ status: 400, description: 'Índice inválido o transición de estado no permitida' })
  @ApiResponse({ status: 404, description: 'Documento de ajustes no encontrado' })
  async rejectAdjustment(
    @Param('id') id: string,
    @Param('index') index: string,
    @Body() data: { comments?: string },
    @Request() req,
  ): Promise<any> {
    const adjustmentIndex = parseInt(index, 10);
    if (isNaN(adjustmentIndex)) {
      throw new BadRequestException('Índice de ajuste inválido');
    }

    const userId = req.user.userId;
    const adjustment = await this.adjustmentsService.updateStatus(
      id,
      adjustmentIndex,
      AdjustmentStatus.REJECTED,
      userId,
      data.comments || 'Ajuste rechazado por el administrador',
    );

    // Notificar al estudiante sobre el rechazo
    if (adjustment) {
      await this.notificationsService.createSystemNotification(
        adjustment.studentId.toString(),
        'Ajuste rechazado',
        `Tu ajuste ha sido rechazado. ${data.comments || ''}`,
        NotificationType.ADJUSTMENT_REJECTED,
        adjustment.semester || '2025-1',
        {
          type: 'adjustment',
          id: new Types.ObjectId(id),
        },
      );
    }

    return adjustment;
  }

  @Get('pending')
  @Roles(UserRole.DIDDEC_STAFF, UserRole.COORDINADOR)
  @ApiOperation({ 
    summary: 'Obtener ajustes pendientes de aprobación',
    description: 'Lista todos los ajustes que están en estado activo y requieren revisión por parte del staff DIDDEC.'
  })
  @ApiQuery({ 
    name: 'semester', 
    required: false, 
    description: 'Semestre académico en formato YYYY-P',
    example: '2025-1'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de ajustes pendientes de aprobación',
    example: [
      {
        _id: '507f1f77bcf86cd799439011',
        studentRut: '20.123.456-7',
        studentId: '507f1f77bcf86cd799439012',
        currentAdjustments: [
          {
            type: 'Tiempo adicional',
            estado: 'active',
            courseNrc: '30001',
            profesor: 'Dr. Juan Pérez',
            comentarios: 'Estudiante requiere 50% tiempo adicional en evaluaciones',
            fechaCreacion: '2025-01-15T10:00:00.000Z'
          }
        ],
        semester: '2025-1'
      }
    ]
  })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos de staff DIDDEC o coordinador' })
  async getPendingAdjustments(
    @Query('semester') semester: string = '2025-1',
  ): Promise<any[]> {
    const adjustments = await this.adjustmentsService.findAll({
      'currentAdjustments.estado': AdjustmentStatus.ACTIVE,
      semester,
    });

    // Formatear para incluir solo información relevante
    return adjustments.map(adjustment => ({
      _id: adjustment._id,
      studentRut: adjustment.studentRut,
      studentId: adjustment.studentId,
      currentAdjustments: adjustment.currentAdjustments.filter(
        adj => adj.estado === AdjustmentStatus.ACTIVE
      ),
      semester: adjustment.semester,
    }));
  }

  @Get('read-statistics')
  @Roles(UserRole.DIDDEC_STAFF, UserRole.COORDINADOR)
  @ApiOperation({ 
    summary: 'Estadísticas de lectura de ajustes por docentes',
    description: 'Proporciona métricas sobre qué porcentaje de ajustes han sido leídos por los docentes correspondientes.'
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Semestre académico en formato YYYY-P',
    example: '2025-1'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas detalladas de lectura de ajustes',
    example: {
      semester: '2025-1',
      totalAdjustments: 145,
      readAdjustments: 89,
      readPercentage: 61.4,
      byTeacher: {
        '507f1f77bcf86cd799439013': {
          total: 12,
          read: 8
        },
        '507f1f77bcf86cd799439014': {
          total: 15,
          read: 15
        }
      }
    }
  })
  async getReadStatistics(
    @Query('semester') semester: string = '2025-1',
  ): Promise<any> {
    const adjustments = await this.adjustmentsService.findAll({ semester });

    let totalAdjustments = 0;
    let readAdjustments = 0;
    const readByTeacher: { [key: string]: { total: number; read: number } } =
      {};

    for (const adjustment of adjustments) {
      for (const currAdj of adjustment.currentAdjustments) {
        totalAdjustments++;

        if (currAdj.readBy && currAdj.readBy.length > 0) {
          readAdjustments++;

          for (const read of currAdj.readBy) {
            const teacherId = read.userId.toString();
            if (!readByTeacher[teacherId]) {
              readByTeacher[teacherId] = { total: 0, read: 0 };
            }
            readByTeacher[teacherId].read++;
          }
        }
      }
    }

    // Calcular totales por profesor
    for (const adjustment of adjustments) {
      for (const currAdj of adjustment.currentAdjustments) {
        // Aquí deberíamos obtener los profesores del curso
        // Por ahora, contamos todos los ajustes para estadísticas generales
      }
    }

    return {
      semester,
      totalAdjustments,
      readAdjustments,
      readPercentage:
        totalAdjustments > 0 ? (readAdjustments / totalAdjustments) * 100 : 0,
      byTeacher: readByTeacher,
    };
  }

  @Get('unread-by-teacher')
  @Roles(UserRole.DIDDEC_STAFF, UserRole.COORDINADOR)
  @ApiOperation({ 
    summary: 'Ajustes no leídos agrupados por docente',
    description: 'Lista ajustes que no han sido marcados como leídos, agrupados por curso/docente para facilitar seguimiento.'
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Semestre académico en formato YYYY-P',
    example: '2025-1'
  })
  @ApiResponse({
    status: 200,
    description: 'Ajustes no leídos organizados por NRC de curso',
    example: {
      '30001': [
        {
          adjustmentId: '507f1f77bcf86cd799439011',
          adjustmentIndex: 0,
          studentRut: '20.123.456-7',
          adjustmentType: 'Tiempo adicional',
          courseName: 'Dr. Juan Pérez',
          createdAt: '2025-01-15T10:00:00.000Z'
        }
      ],
      '30002': [
        {
          adjustmentId: '507f1f77bcf86cd799439015',
          adjustmentIndex: 1,
          studentRut: '19.987.654-3',
          adjustmentType: 'Evaluación oral',
          courseName: 'Dra. María González',
          createdAt: '2025-01-14T15:30:00.000Z'
        }
      ]
    }
  })
  async getUnreadByTeacher(
    @Query('semester') semester: string = '2025-1',
  ): Promise<any> {
    const adjustments = await this.adjustmentsService.findAll({ semester });
    const unreadByTeacher: { [key: string]: any[] } = {};

    for (const adjustment of adjustments) {
      for (let i = 0; i < adjustment.currentAdjustments.length; i++) {
        const currAdj = adjustment.currentAdjustments[i];

        // Si no ha sido leído
        if (!currAdj.readBy || currAdj.readBy.length === 0) {
          // Aquí deberíamos obtener los profesores del curso desde el módulo de cursos
          // Por ahora, agrupamos por NRC del curso
          const key = currAdj.courseNrc;

          if (!unreadByTeacher[key]) {
            unreadByTeacher[key] = [];
          }

          unreadByTeacher[key].push({
            adjustmentId: adjustment._id,
            adjustmentIndex: i,
            studentRut: adjustment.studentRut,
            adjustmentType: currAdj.type,
            courseName: currAdj.profesor || 'Sin asignar',
            createdAt: adjustment.createdAt,
          });
        }
      }
    }

    return unreadByTeacher;
  }
}
