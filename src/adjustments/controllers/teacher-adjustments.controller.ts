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
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { AdjustmentsService } from '../adjustments.service';
import { UserRole } from '../../users/schemas/user.schema';
import { CoursesService } from '../../courses/courses.service';
import { UsersService } from '../../users/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { MarkAdjustmentReadDto } from '../dto/mark-adjustment-read.dto';
import { HelpRequestDto } from '../dto/help-request.dto';
import { Adjustment, AdjustmentStatus } from '../schemas/adjustment.schema';
import { NotificationType } from '../../notifications/schemas/notification.schema';
import { NotificationsService } from '../../notifications/notifications.service';
import { AdjustmentNotificationsService } from '../../notifications/services/adjustment-notifications.service';
import { Types } from 'mongoose';
import { StudentsService } from '../../students/students.service';

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
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
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
        
        let unreadAdjustmentsCount = 0;
        
        // Set para no duplicar estudiantes
        const uniqueStudentIds = new Set();
        
        for (const adjustment of adjustments) {
          if (!uniqueStudentIds.has(adjustment.studentId.toString())) {
            const student = await this.studentsService.findById(adjustment.studentId.toString());
            
            if (student) {
              const hasUnreadAdjustments = adjustment.currentAdjustments.some(
                adj => adj.courseNrc === course.nrc && 
                (!adj.readBy || adj.readBy.length === 0 || 
                 !adj.readBy.some(read => read.userId.toString() === teacherId))
              );
              
              if (hasUnreadAdjustments) {
                unreadAdjustmentsCount++;
              }
              
              studentsInfo.push({
                _id: student._id.toString(),
                name: `${student.nombres || ''} ${student.apellidos || ''}`.trim(),
                rut: student.rut || 'Sin RUT',
                hasUnreadAdjustments
              });
              
              uniqueStudentIds.add(adjustment.studentId.toString());
            }
          }
        }
        
        coursesWithNeeStudents.push({
          _id: course._id.toString(),
          nrc: course.nrc,
          nombre: course.nombre,
          code: course.code,
          semestre: course.semestre,
          semester: course.semestre,
          studentsWithNeeCount: studentsInfo.length,
          studentsWithNee: studentsInfo,
          unreadAdjustmentsCount
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
  @ApiResponse({ status: 200, description: 'Ajustes de estudiantes en el curso' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async getAdjustmentsByCourse(
    @Param('courseNrc') courseNrc: string,
    @Query('semester') semester: string = '2025-1',
  ): Promise<Adjustment[]> {
    // Obtener todos los ajustes asociados al curso
    return this.adjustmentsService.findByCourseNrc(courseNrc, semester);
  }

  @Patch(':adjustmentId/acknowledge')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Confirmar recepción de ajuste' })
  @ApiParam({ name: 'adjustmentId', description: 'ID del ajuste' })
  @ApiResponse({
    status: 200,
    description: 'Ajuste confirmado exitosamente',
    type: Adjustment,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  @ApiResponse({ status: 404, description: 'Ajuste no encontrado' })
  async acknowledgeAdjustment(
    @Param('adjustmentId') adjustmentId: string,
    @GetUser('_id') userId: string,
    @GetUser('name') userName: string,
  ): Promise<Adjustment> {
    try {
      // Validar que el ID sea un ObjectId válido
      if (!Types.ObjectId.isValid(adjustmentId)) {
        throw new BadRequestException('ID de ajuste inválido');
      }
      
      // Buscar el ajuste por ID
      const adjustment = await this.adjustmentsService.findOne(adjustmentId);
      
      if (!adjustment) {
        throw new NotFoundException(`No se pudo encontrar el ajuste con ID ${adjustmentId}`);
      }
      
      // Marcar como recibido (usando findOneAndUpdate directamente, ya que no existe acknowledgeAdjustment)
      const updatedAdjustment = await this.adjustmentsService.findOneAndUpdate(
        { _id: adjustmentId },
        { 
          $set: { 
            'currentAdjustments.$[].acknowledgedBy': new Types.ObjectId(userId),
            'currentAdjustments.$[].acknowledgedAt': new Date() 
          } 
        },
        { new: true }
      );
      
      if (!updatedAdjustment) {
        throw new NotFoundException(`No se pudo encontrar el ajuste con ID ${adjustmentId}`);
      }
      
      // Crear notificación para el personal de DIDDEC
      const staffUsers = await this.usersService.findByRole(UserRole.STAFF);
      const staffIds = staffUsers.map(user => user._id.toString());
      
      // Obtener datos del estudiante para notificación
      const student = await this.studentsService.findById(updatedAdjustment.studentId.toString());
      const studentName = student ? 
        `${student.nombres || ''} ${student.apellidos || ''}`.trim() : 
        'Estudiante';
      
      // Obtener primer curso donde se aplica
      const courseNrc = updatedAdjustment.currentAdjustments.length > 0 ? 
        updatedAdjustment.currentAdjustments[0].courseNrc : 
        'N/A';
      
      if (staffIds.length > 0) {
        await this.notificationsService.createBulkNotifications(
          staffIds,
          'Ajuste confirmado por docente',
          `El docente ${userName} ha confirmado la recepción del ajuste para ${studentName} en el curso ${courseNrc}`,
          NotificationType.ADJUSTMENT_UPDATED,
          updatedAdjustment.semester || '2025-1',
          {
            type: 'adjustment',
            id: new Types.ObjectId(adjustmentId),
          }
        );
      }
      
      return updatedAdjustment;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al confirmar el ajuste');
    }
  }

  @Post(':adjustmentId/current/:index/mark-as-implemented')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Marcar un ajuste como implementado',
    description: 'Marca un ajuste específico como implementado por el docente.'
  })
  @ApiParam({
    name: 'adjustmentId',
    description: 'ID del ajuste',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiParam({
    name: 'index',
    description: 'Índice del ajuste actual a marcar como implementado',
    example: '0'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        comments: {
          type: 'string',
          description: 'Comentarios sobre la implementación',
          example: 'Ajuste implementado exitosamente'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Ajuste marcado como implementado exitosamente',
    type: Adjustment,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos o índice incorrecto' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Ajuste no encontrado' 
  })
  async markAsImplemented(
    @Param('adjustmentId') adjustmentId: string,
    @Param('index') index: string,
    @GetUser('_id') userId: string,
    @GetUser('name') userName: string,
    @Body() data: { comments?: string } = {}
  ): Promise<Adjustment> {
    try {
      const adjustmentIndex = parseInt(index, 10);
      
      const updatedAdjustment = await this.adjustmentsService.updateStatus(
        adjustmentId,
        adjustmentIndex,
        AdjustmentStatus.IMPLEMENTED,
        userId,
        data.comments || 'Ajuste implementado por el docente'
      );

      if (!updatedAdjustment) {
        throw new NotFoundException(`No se pudo encontrar el ajuste con ID ${adjustmentId}`);
      }

      // Verificar que el índice del ajuste sea válido
      if (!updatedAdjustment.currentAdjustments || 
          adjustmentIndex >= updatedAdjustment.currentAdjustments.length) {
        throw new BadRequestException('Índice de ajuste fuera de rango');
      }

      const targetAdjustment = updatedAdjustment.currentAdjustments[adjustmentIndex];

      // Obtener información del estudiante para la notificación
      const student = await this.studentsService.findById(updatedAdjustment.studentId.toString());
      const studentName = student ? `${student.nombres || ''} ${student.apellidos || ''}`.trim() : 'Estudiante';
      const courseName = targetAdjustment.courseNrc || 'N/A';
      const semester = updatedAdjustment.semester || '2025-1';

      // Notificar al personal de staff
      const staffUsers = await this.usersService.findByRole(UserRole.STAFF);
      const staffIds = staffUsers.map(user => user._id.toString());
      
      if (staffIds.length > 0) {
        await this.adjustmentNotificationsService.notifyAdjustmentImplemented(
          staffIds,
          userId,
          userName,
          updatedAdjustment._id.toString(),
          studentName,
          courseName,
          semester
        );
      }
      
      // Notificar al estudiante
      await this.notificationsService.createSystemNotification(
        updatedAdjustment.studentId.toString(),
        'Ajuste implementado',
        `El ajuste de tipo "${targetAdjustment.type}" ha sido implementado por el docente ${userName} en el curso ${courseName}`,
        NotificationType.REMINDER,
        semester
      );

      return updatedAdjustment;
      
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al marcar el ajuste como implementado');
    }
  }

  @Patch(':adjustmentId/current/:index/mark-as-read')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
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

    // Buscar el ajuste por ID
  const adjustment = await this.adjustmentsService.findOne(adjustmentId);
  
  if (!adjustment) {
    throw new NotFoundException(`No se pudo encontrar el ajuste con ID ${adjustmentId}`);
  }
  
  // Verificar que el índice sea válido
  if (!adjustment.currentAdjustments || adjustmentIndex >= adjustment.currentAdjustments.length) {
    throw new BadRequestException('Índice de ajuste fuera de rango');
  }
  
  // Verificar si el ajuste ya fue leído por este usuario
  const currentAdjustment = adjustment.currentAdjustments[adjustmentIndex];
  const readByArray = currentAdjustment.readBy || [];
  
  // Si no existe el usuario en readBy, agregarlo
  if (!readByArray.some(read => read.userId.toString() === userId)) {
    readByArray.push({
      userId: new Types.ObjectId(userId),
      readDate: new Date(),
      comments: markReadDto.comments || 'Ajuste leído por el docente'
    });
  }
  
  // Actualizar el documento
  const updatedAdjustment = await this.adjustmentsService.findOneAndUpdate(
    { _id: adjustmentId },
    { $set: { [`currentAdjustments.${adjustmentIndex}.readBy`]: readByArray } },
    { new: true }
  );

    if (!updatedAdjustment) {
      throw new NotFoundException(
        `No se pudo encontrar el ajuste con ID ${adjustmentId}`
      );
    }

    // Crear notificación para el estudiante
    await this.notificationsService.createSystemNotification(
      updatedAdjustment.studentId.toString(),
      'Ajuste leído por docente',
      `Tu ajuste ha sido leído por el docente en el curso ${updatedAdjustment.currentAdjustments[adjustmentIndex].courseNrc}`,
      NotificationType.SYSTEM_ALERT,
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
      NotificationType.SYSTEM_ALERT,
      updatedAdjustment.semester || '2025-1',
    );

    // Crear notificación para el personal de DIDDEC
    const diddecUsers = await this.usersService.findByRole(UserRole.STAFF);

    await this.notificationsService.createBulkNotifications(
      diddecUsers.map((user) => user._id.toString()),
      'Solicitud de ayuda de docente',
      `El docente ${userName} ha solicitado ayuda para implementar un ajuste en el curso ${updatedAdjustment.currentAdjustments[adjustmentIndex].courseNrc}`,
      NotificationType.HELP_REQUEST,
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
  @ApiResponse({ status: 200, description: 'Solicitudes de ayuda pendientes' })
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
    try {
      // Validar formato de semestre
      if (semester && !/^\d{4}-[12]$/.test(semester)) {
        throw new BadRequestException(
          'Formato de semestre inválido. Debe ser YYYY-S (ej: 2025-1)',
        );
      }

      // Construir el query para buscar ajustes con solicitudes de ayuda pendientes
      const query: any = { semester };
      query['currentAdjustments.helpRequests.status'] = 'pending';
      
      // Obtener ajustes con solicitudes de ayuda pendientes usando findAll que sí existe
      const adjustments = await this.adjustmentsService.findAll(query);
      
      const result: Array<{
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
      }> = [];

      // Procesar cada ajuste para formatear la respuesta
      for (const adjustment of adjustments) {
        // Obtener información del estudiante
        const student = await this.studentsService.findById(adjustment.studentId.toString());
        
        if (!student) continue;
        
        const studentName = `${student.nombres || ''} ${student.apellidos || ''}`.trim();
        
        // Para cada ajuste actual con solicitud de ayuda pendiente
        for (let i = 0; i < adjustment.currentAdjustments.length; i++) {
          const currentAdjustment = adjustment.currentAdjustments[i];
          
          // Verificar si hay solicitudes de ayuda y si alguna está pendiente
          const pendingRequests = (currentAdjustment.helpRequests || []).filter(
            req => req.status === 'pending'
          );
          
          if (pendingRequests.length > 0) {
            
            // Obtener información del usuario que solicitó ayuda
            const requestUser = await this.usersService.findById(
              pendingRequests[0].userId.toString()
            );
            
            result.push({
              _id: adjustment._id.toString(),
              studentId: student._id.toString(),
              studentName,
              courseNrc: currentAdjustment.courseNrc,
              request: {
                description: pendingRequests[0].description,
                status: pendingRequests[0].status,
                requestedAt: pendingRequests[0].requestDate,
                requestedBy: requestUser ? (requestUser as any).name || 'Sin nombre' : 'Usuario desconocido',
              },
            });
          }
        }
      }
      
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener solicitudes de ayuda pendientes');
    }
  }
}
