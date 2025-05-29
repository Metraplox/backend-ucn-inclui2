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
// Removed duplicate import of UserRole
import { UserRole } from '../../users/schemas/user.schema';
import { StudentsService } from '../../students/students.service';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { MarkAdjustmentReadDto } from '../dto/mark-adjustment-read.dto';
import { HelpRequestDto } from '../dto/help-request.dto';
import { Adjustment, AdjustmentStatus } from '../schemas/adjustment.schema';
import { NotificationsService } from '../../notifications/notifications.service';
import { AdjustmentNotificationsService } from '../../notifications/services/adjustment-notifications.service';
import { Types } from 'mongoose';

@ApiTags('teacher-adjustments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers/adjustments')
export class TeacherAdjustmentsController {
  constructor(
    private readonly adjustmentsService: AdjustmentsService,
    private readonly notificationsService: NotificationsService,
    private readonly adjustmentNotificationsService: AdjustmentNotificationsService,
    private readonly coursesService: CoursesService,
    private readonly usersService: UsersService,
    private readonly studentsService: StudentsService,
  ) {}

  @Get('my-courses')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({
    summary: 'Obtener todos los cursos del docente con estudiantes NEE',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre (ej: 2025-1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos con estudiantes NEE',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  @Get('my-courses')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({
    summary: 'Obtener todos los cursos del docente con estudiantes NEE',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre (ej: 2025-1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos con estudiantes NEE',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async getMyCourses(
    @GetUser('_id') teacherId: string,
    @Query('semester') semester = '2025-1',
  ): Promise<{
    courses: Array<{
      _id: string;
      nrc: string;
      nombre: string;
      code: string;
      semestre: string;
      semester: string;
      studentsWithNeeCount: number;
      studentsWithNee: Array<{
        _id: string;
        name: string;
        rut: string;
        hasUnreadAdjustments: boolean;
      }>;
      unreadAdjustmentsCount: number;
    }>;
    total: number;
    semester: string;
  }> {
    // Obtener los cursos donde el docente está asignado
    const teacherCourses = await this.coursesService.findCoursesByTeacher(teacherId, semester);
    
    // Para cada curso, verificar si tiene estudiantes con NEE
    const coursesWithNeeStudents: Array<{
      _id: string;
      nrc: string;
      nombre: string;
      code: string;
      semestre: string;
      semester: string;
      studentsWithNeeCount: number;
      studentsWithNee: Array<{
        _id: string;
        name: string;
        rut: string;
        hasUnreadAdjustments: boolean;
      }>;
      unreadAdjustmentsCount: number;
    }> = [];
    
    for (const course of teacherCourses) {
      // Buscar ajustes para este curso
      const adjustments = await this.adjustmentsService.findByCourseNrc(course.nrc, semester);
      
      if (adjustments.length > 0) {
        // Obtener información de estudiantes
        const studentsInfo: Array<{
          _id: string;
          name: string;
          rut: string;
          hasUnreadAdjustments: boolean;
        }> = [];
        for (const adjustment of adjustments) {
          const student = await this.studentsService.findById(adjustment.studentId.toString());
          if (student) {
            // Verificar si el docente ya ha leído los ajustes para este curso
            const isRead = adjustment.currentAdjustments.some(adj => 
              adj.courseNrc === course.nrc && 
              adj.readBy && 
              adj.readBy.some(read => read.userId.toString() === teacherId)
            );
            
            studentsInfo.push({
              _id: student._id,
              name: `${student.nombres || ''} ${student.apellidos || ''}`.trim(),
              rut: student.rut,
              hasUnreadAdjustments: !isRead
            });
          }
        }
        
        coursesWithNeeStudents.push({
          _id: course._id,
          nrc: course.nrc,
          nombre: course.nombre,
          code: course.code,
          semestre: course.semestre,
          semester,
          studentsWithNeeCount: studentsInfo.length,
          studentsWithNee: studentsInfo,
          unreadAdjustmentsCount: studentsInfo.filter(s => s.hasUnreadAdjustments).length
        });
      }
    }
    
    return {
      courses: coursesWithNeeStudents,
      total: coursesWithNeeStudents.length,
      semester
    };
  }

  @Get('my-courses/:courseNrc')
  @Roles(Role.TEACHER, Role.ADMIN)
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

  @Patch(':adjustmentId/acknowledge')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Confirmar recepción de ajuste' })
  @ApiParam({ name: 'adjustmentId', description: 'ID del ajuste' })
  @ApiResponse({
    status: 200,
    description: 'Ajuste confirmado como recibido',
    type: Adjustment,
  })
  @ApiResponse({ status: 404, description: 'Ajuste no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async acknowledgeAdjustment(
    @Param('adjustmentId') adjustmentId: string,
    @GetUser('_id') userId: string,
    @GetUser('name') userName: string,
  ): Promise<Adjustment> {
    // Buscar el ajuste
    const adjustment = await this.adjustmentsService.findOne(adjustmentId);
    if (!adjustment) {
      throw new NotFoundException(`Ajuste con ID ${adjustmentId} no encontrado`);
    }
    
    // Para cada ajuste actual, agregar el usuario a la lista de lectores si no está ya
    for (let i = 0; i < adjustment.currentAdjustments.length; i++) {
      // Si no existe el array readBy, inicializarlo
      if (!adjustment.currentAdjustments[i].readBy) {
        adjustment.currentAdjustments[i].readBy = [];
      }
      
      // Verificar si el usuario ya está en la lista de readBy
        const currentAdjustment = adjustment.currentAdjustments[i];
      const readByArray = currentAdjustment.readBy || [];
      const alreadyRead = readByArray.some(
        (reader) => reader.userId && reader.userId.toString() === userId
      );
      
      // Si no está, agregarlo
      if (!alreadyRead) {
        readByArray.push({
          userId: new Types.ObjectId(userId),
          readDate: new Date(),
          comments: 'Ajuste recibido por el docente',
        });
        
        currentAdjustment.readBy = readByArray;
      }
    }
    
    // Guardar cambios (utilizamos actualización parcial para evitar problemas de tipo)
    const updatedAdjustment = await this.adjustmentsService.findOneAndUpdate(
      { _id: adjustmentId },
      { $set: { currentAdjustments: adjustment.currentAdjustments } },
      { new: true }
    );
    
    if (!updatedAdjustment) {
      throw new NotFoundException(`No se pudo actualizar el ajuste con ID ${adjustmentId}`);
    }
    
    // Notificar al estudiante
    await this.notificationsService.createSystemNotification(
      updatedAdjustment.studentId.toString(),
      'Ajuste recibido por docente',
      `Tus ajustes han sido confirmados como recibidos por el docente ${userName}`,
      'info',
      updatedAdjustment.semester || '2025-1'
    );
    
    return updatedAdjustment;
  }

  @Patch(':adjustmentId/mark-as-implemented')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Marcar ajuste como implementado' })
  @ApiParam({ name: 'adjustmentId', description: 'ID del ajuste' })
  @ApiResponse({
    status: 200,
    description: 'Ajuste marcado como implementado',
    type: Adjustment,
  })
  @ApiResponse({ status: 404, description: 'Ajuste no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async markAsImplemented(
    @Param('adjustmentId') adjustmentId: string,
    @GetUser('_id') userId: string,
    @GetUser('name') userName: string,
    @Body() implementationDto: { comments?: string }
  ): Promise<Adjustment> {
    // Buscar el ajuste
    const adjustment = await this.adjustmentsService.findOne(adjustmentId);
    if (!adjustment) {
      throw new NotFoundException(`Ajuste con ID ${adjustmentId} no encontrado`);
    }
    
    // Actualizamos los ajustes actuales para marcarlos como implementados
    for (let i = 0; i < adjustment.currentAdjustments.length; i++) {
      // Cambiar el estado del ajuste a implementado
      adjustment.currentAdjustments[i].estado = AdjustmentStatus.IMPLEMENTED;
      
      // Asegurarse de que el array readBy exista
      const currentAdjustment = adjustment.currentAdjustments[i];
      if (!currentAdjustment.readBy) {
        currentAdjustment.readBy = [];
      }
      
      // Agregar una entrada indicando la implementación
      currentAdjustment.readBy.push({
        userId: new Types.ObjectId(userId),
        readDate: new Date(),
        comments: implementationDto.comments || 'Ajuste implementado'
      });
    }
    
    // Guardar cambios (utilizamos actualización parcial para evitar problemas de tipo)
    const updatedAdjustment = await this.adjustmentsService.findOneAndUpdate(
      { _id: adjustmentId },
      { $set: { currentAdjustments: adjustment.currentAdjustments } },
      { new: true }
    );
    
    if (!updatedAdjustment) {
      throw new NotFoundException(`No se pudo actualizar el ajuste con ID ${adjustmentId}`);
    }
    
    // Notificar al estudiante
    await this.notificationsService.createSystemNotification(
      updatedAdjustment.studentId.toString(),
      'Ajuste implementado por docente',
      `Tus ajustes han sido implementados por el docente ${userName}`,
      'success',
      updatedAdjustment.semester || '2025-1'
    );
    
    // Notificar al personal DIDDEC
    const diddecUsers = await this.usersService.findByRole(UserRole.STAFF);
    if (diddecUsers && diddecUsers.length > 0) {
      await this.notificationsService.createBulkNotifications(
        diddecUsers.map((user) => user._id.toString()),
        'Ajuste implementado',
        `El docente ${userName} ha implementado un ajuste para un estudiante`,
        'info',
        updatedAdjustment.semester || '2025-1',
        {
          type: 'adjustment',
          id: updatedAdjustment._id,
        }
      );
    }
    
    return updatedAdjustment;
  }

  @Patch(':adjustmentId/current/:index/mark-as-read')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Marcar un ajuste específico como leído (legacy)' })
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
  async markAsReadLegacy(
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
      markReadDto?.comments || 'Ajuste leído por el docente'
    );
    
    if (!updatedAdjustment) {
      throw new NotFoundException(`No se pudo marcar como leído el ajuste con ID ${adjustmentId}`);
    }

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
  @Roles(Role.TEACHER, Role.ADMIN)
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
  @Roles(Role.ADMIN, Role.STAFF)
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
  @Roles(Role.ADMIN, Role.STAFF)
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
  @Post(':adjustmentId/current/:index/mark-as-implemented')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Marcar un ajuste como implementado' })
  @ApiParam({ name: 'adjustmentId', description: 'ID del ajuste' })
  @ApiParam({
    name: 'index',
    description: 'Índice del ajuste actual a marcar como implementado',
  })
  @ApiResponse({
    status: 200,
    description: 'Ajuste marcado como implementado',
    type: Adjustment,
  })
  @ApiResponse({ status: 404, description: 'Ajuste no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async markAsImplemented(
    @Param('adjustmentId') adjustmentId: string,
    @Param('index') index: string,
    @GetUser('_id') userId: string,
    @GetUser('name') userName: string,
    @Body() data: { comments?: string },
  ): Promise<Adjustment> {
    const adjustmentIndex = parseInt(index, 10);
    if (isNaN(adjustmentIndex)) {
      throw new NotFoundException('Índice de ajuste inválido');
    }

    // Actualizar el estado del ajuste a implementado
    const updatedAdjustment = await this.adjustmentsService.updateStatus(
      adjustmentId,
      adjustmentIndex,
      AdjustmentStatus.IMPLEMENTED,
      userId,
      data.comments || 'Ajuste marcado como implementado por el docente',
    );

    // Obtener los usuarios de staff para notificarles
    const staffUsers = await this.usersService.findByRole(UserRole.STAFF);
    const staffIds = staffUsers.map(user => user._id.toString());
    
    // Notificar al personal de staff sobre la implementación del ajuste
    try {
      const targetAdjustment = updatedAdjustment.currentAdjustments[adjustmentIndex];
        // Obtener información del estudiante
      const student = await this.studentsService.findById(updatedAdjustment.studentId.toString());
      const studentName = student ? `${student.nombres || ''} ${student.apellidos || ''}`.trim() : 'Estudiante';
      const courseName = targetAdjustment.courseNrc || 'N/A';
      
      await this.adjustmentNotificationsService.notifyAdjustmentImplemented(
        staffIds,
        userId,
        userName,
        updatedAdjustment._id.toString(),
        studentName,
        courseName,
        updatedAdjustment.semester || '2025-1' // Valor por defecto si semester es undefined
      );
      
      // También notificar al estudiante
      await this.notificationsService.createSystemNotification(
        updatedAdjustment.studentId.toString(),
        'Ajuste implementado',
        `El ajuste de tipo "${targetAdjustment.type}" ha sido implementado por el docente ${userName} en el curso ${courseName}`,
        'success',
        updatedAdjustment.semester || '2025-1' // Valor por defecto si semester es undefined
      );
    } catch (error) {
      // No interrumpir el flujo principal si falla la notificación
      console.error('Error al enviar notificación:', error);
    }

    return updatedAdjustment;
  }

  @Get('pending-help-requests')
  @Roles(Role.ADMIN, Role.STAFF)
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
    @Query('semester') semester = '2025-1',
  ): Promise<Array<{
    _id: string;
    studentId: string;
    studentName: string;
    courseNrc: string;
    request: {
      description: string;
      status: string;
      requestedAt: Date;
      requestedBy: string;
    };
  }>> {
    // Implementación pendiente - por ahora retornar array vacío para evitar errores
    return [];
    }
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
