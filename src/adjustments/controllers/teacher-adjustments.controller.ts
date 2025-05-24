import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdjustmentsService } from '../adjustments.service';
import { CoursesService } from '../../courses/courses.service';
import { UsersService } from '../../users/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { MarkAdjustmentReadDto } from '../dto/mark-adjustment-read.dto';
import { HelpRequestDto } from '../dto/help-request.dto';
import { Adjustment } from '../schemas/adjustment.schema';
import { NotificationsService } from '../../notifications/notifications.service';
import { Types } from 'mongoose';

@ApiTags('teacher-adjustments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers/adjustments')
export class TeacherAdjustmentsController {
  constructor(
    private readonly adjustmentsService: AdjustmentsService,
    private readonly notificationsService: NotificationsService,
    private readonly coursesService: CoursesService,
    private readonly usersService: UsersService,
  ) {}

  @Get('my-courses/:courseNrc')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Obtener ajustes de estudiantes en un curso específico',
  })
  @ApiParam({ name: 'courseNrc', description: 'Código NRC del curso' })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre (ej: 2025-1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ajustes',
    type: [Adjustment],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async getAdjustmentsByCourse(
    @Param('courseNrc') courseNrc: string,
    @Query('semester') semester: string = '2025-1',
  ): Promise<Adjustment[]> {
    return this.adjustmentsService.findByCourseNrc(courseNrc, semester);
  }

  @Patch(':adjustmentId/current/:index/mark-as-read')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Marcar un ajuste como leído' })
  @ApiParam({ name: 'adjustmentId', description: 'ID del ajuste' })
  @ApiParam({
    name: 'index',
    description: 'Índice del ajuste actual a marcar como leído',
  })
  @ApiResponse({
    status: 200,
    description: 'Ajuste marcado como leído',
    type: Adjustment,
  })
  @ApiResponse({ status: 404, description: 'Ajuste no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async markAsRead(
    @Param('adjustmentId') adjustmentId: string,
    @Param('index') index: string,
    @GetUser('_id') userId: string,
    @Body() markReadDto: MarkAdjustmentReadDto,
  ): Promise<Adjustment> {
    const adjustmentIndex = parseInt(index, 10);

    const updatedAdjustment = await this.adjustmentsService.markAsRead(
      adjustmentId,
      adjustmentIndex,
      userId,
      markReadDto.comments,
    );

    // Crear notificación para el estudiante
    await this.notificationsService.createSystemNotification(
      updatedAdjustment.studentId.toString(),
      'Ajuste leído por docente',
      `Tu ajuste ha sido leído por el docente en el curso ${updatedAdjustment.currentAdjustments[adjustmentIndex].courseNrc}`,
      'info',
      updatedAdjustment.semester || '2025-1',
    );

    return updatedAdjustment;
  }

  @Post(':adjustmentId/current/:index/request-help')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Solicitar ayuda para implementar un ajuste' })
  @ApiParam({ name: 'adjustmentId', description: 'ID del ajuste' })
  @ApiParam({
    name: 'index',
    description: 'Índice del ajuste actual para el cual se solicita ayuda',
  })
  @ApiResponse({
    status: 201,
    description: 'Solicitud de ayuda creada',
    type: Adjustment,
  })
  @ApiResponse({ status: 404, description: 'Ajuste no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async requestHelp(
    @Param('adjustmentId') adjustmentId: string,
    @Param('index') index: string,
    @GetUser('_id') userId: string,
    @GetUser('name') userName: string,
    @Body() helpRequestDto: HelpRequestDto,
  ): Promise<Adjustment> {
    const adjustmentIndex = parseInt(index, 10);

    const updatedAdjustment = await this.adjustmentsService.requestHelp(
      adjustmentId,
      adjustmentIndex,
      userId,
      helpRequestDto.description,
    );

    // Crear notificación para el estudiante
    await this.notificationsService.createSystemNotification(
      updatedAdjustment.studentId.toString(),
      'Solicitud de ayuda sobre tu ajuste',
      `Un docente ha solicitado ayuda sobre tu ajuste en el curso ${updatedAdjustment.currentAdjustments[adjustmentIndex].courseNrc}`,
      'warning',
      updatedAdjustment.semester || '2025-1',
    );

    // Crear notificación para el personal de DIDDEC
    const diddecUsers = await this.usersService.findByRole(UserRole.STAFF);

    await this.notificationsService.createBulkNotifications(
      diddecUsers.map((user) => user._id.toString()),
      'Solicitud de ayuda de docente',
      `El docente ${userName} ha solicitado ayuda para implementar un ajuste en el curso ${updatedAdjustment.currentAdjustments[adjustmentIndex].courseNrc}`,
      'help_request',
      updatedAdjustment.semester || '2025-1',
      {
        type: 'adjustment',
        id: new Types.ObjectId(adjustmentId),
      },
    );

    return updatedAdjustment;
  }

  @Get('read-status/:courseNrc')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Obtener estado de lectura de ajustes por curso (Admin, Staff)',
  })
  @ApiParam({ name: 'courseNrc', description: 'Código NRC del curso' })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre (ej: 2025-1)',
  })
  @ApiResponse({ status: 200, description: 'Estado de lectura de ajustes' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async getReadStatus(
    @Param('courseNrc') courseNrc: string,
    @Query('semester') semester: string = '2025-1',
  ): Promise<any[]> {
    // Por ahora usar el NRC directamente
    return this.adjustmentsService.getAdjustmentReadStatusByNrc(
      courseNrc,
      semester,
    );
  }

  @Get('pending-help-requests')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Obtener solicitudes de ayuda pendientes (Admin, Staff)',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre (ej: 2025-1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de solicitudes de ayuda pendientes',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async getPendingHelpRequests(
    @Query('semester') semester: string = '2025-1',
  ): Promise<any[]> {
    const query: any = {
      'currentAdjustments.helpRequests': { $exists: true, $ne: [] },
      'currentAdjustments.helpRequests.status': 'pendiente',
    };

    if (semester) {
      query.semester = semester;
    }

    const adjustments = await this.adjustmentsService.findAll();

    // Filtrar ajustes según la query
    const filteredAdjustments = adjustments.filter((adjustment) => {
      return adjustment.currentAdjustments.some(
        (adj) =>
          adj.helpRequests &&
          adj.helpRequests.some((req) => req.status === 'pendiente'),
      );
    });

    // Procesar para devolver solo las solicitudes pendientes
    const pendingRequests: any[] = [];

    for (const adjustment of filteredAdjustments) {
      for (let i = 0; i < adjustment.currentAdjustments.length; i++) {
        const currentAdj = adjustment.currentAdjustments[i];
        if (currentAdj.helpRequests && currentAdj.helpRequests.length > 0) {
          const pendingHelp = currentAdj.helpRequests.filter(
            (req) => req.status === 'pendiente',
          );

          if (pendingHelp.length > 0) {
            pendingRequests.push({
              adjustmentId: adjustment._id,
              studentId: adjustment.studentId,
              studentRut: adjustment.studentRut,
              courseNrc: currentAdj.courseNrc,
              adjustmentType: currentAdj.type,
              adjustmentIndex: i,
              helpRequests: pendingHelp,
            });
          }
        }
      }
    }

    return pendingRequests;
  }
}
