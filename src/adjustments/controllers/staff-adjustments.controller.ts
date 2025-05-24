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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { AdjustmentsService } from '../adjustments.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { Types } from 'mongoose';

@ApiTags('staff-adjustments')
@Controller('staff/adjustments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StaffAdjustmentsController {
  constructor(
    private readonly adjustmentsService: AdjustmentsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get('help-requests')
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Obtener todas las solicitudes de ayuda pendientes',
  })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes de ayuda' })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por estado',
    enum: ['pendiente', 'en_proceso', 'resuelto'],
  })
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
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Obtener detalle de una solicitud de ayuda específica',
  })
  @ApiResponse({ status: 200, description: 'Detalle de la solicitud de ayuda' })
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
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar el estado de una solicitud de ayuda' })
  @ApiResponse({
    status: 200,
    description: 'Solicitud actualizada exitosamente',
  })
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
      'info',
      adjustment.semester || '2025-1',
    );

    return updatedAdjustment;
  }

  @Get('read-statistics')
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener estadísticas de lectura de ajustes' })
  @ApiResponse({ status: 200, description: 'Estadísticas de lectura' })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre',
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
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener ajustes no leídos agrupados por docente' })
  @ApiResponse({
    status: 200,
    description: 'Lista de ajustes no leídos por docente',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre',
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
