import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { HeadsGuard } from '../../auth/guards/heads.guard';
import { HeadType } from '../../auth/decorators/head-type.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { DepartmentsService } from '../departments.service';
import { UsersService } from '../../users/users.service';
import { CoursesService } from '../../courses/courses.service';
import { AdjustmentsService } from '../../adjustments/adjustments.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/schemas/notification.schema';

@ApiTags('heads')
@Controller('heads')
@UseGuards(JwtAuthGuard, RolesGuard, HeadsGuard)
@ApiBearerAuth('JWT-auth')
export class HeadsController {
  constructor(
    private readonly departmentsService: DepartmentsService,
    private readonly usersService: UsersService,
    private readonly coursesService: CoursesService,
    private readonly adjustmentsService: AdjustmentsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get('my-teachers')
  @HeadType('department', 'career')
  @ApiOperation({
    summary: 'Obtener docentes supervisados',
    description: 'Obtiene la lista de docentes bajo la supervisión del jefe de departamento o carrera autenticado, incluyendo estadísticas de cursos, estudiantes con NEE y estado de lectura de ajustes por semestre.',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Semestre académico para filtrar datos (formato YYYY-P)',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[1-2]$',
      default: '2025-1'
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de docentes con estadísticas detalladas de supervisión',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          teacherId: {
            type: 'string',
            description: 'ObjectId del docente',
            example: '507f1f77bcf86cd799439032'
          },
          teacherName: {
            type: 'string',
            description: 'Nombre completo del docente',
            example: 'Dr. María Elena González Pérez'
          },
          teacherEmail: {
            type: 'string',
            description: 'Email del docente',
            example: 'maria.gonzalez@ucn.cl'
          },
          department: {
            type: 'string',
            description: 'Nombre del departamento',
            example: 'Departamento de Matemáticas'
          },
          coursesCount: {
            type: 'number',
            description: 'Número de cursos que dicta en el semestre',
            example: 3
          },
          studentsWithNEE: {
            type: 'number',
            description: 'Número de estudiantes con NEE en sus cursos',
            example: 8
          },
          totalAdjustments: {
            type: 'number',
            description: 'Total de ajustes razonables en sus cursos',
            example: 12
          },
          readAdjustments: {
            type: 'number',
            description: 'Ajustes ya leídos por el docente',
            example: 9
          },
          readPercentage: {
            type: 'number',
            description: 'Porcentaje de ajustes leídos',
            example: 75.0
          }
        }
      },
      example: [
        {
          teacherId: '507f1f77bcf86cd799439032',
          teacherName: 'Dr. María Elena González Pérez',
          teacherEmail: 'maria.gonzalez@ucn.cl',
          department: 'Departamento de Matemáticas',
          coursesCount: 3,
          studentsWithNEE: 8,
          totalAdjustments: 12,
          readAdjustments: 9,
          readPercentage: 75.0
        },
        {
          teacherId: '507f1f77bcf86cd799439033',
          teacherName: 'Prof. Carlos Alberto Ruiz Castro',
          teacherEmail: 'carlos.ruiz@ucn.cl',
          department: 'Departamento de Matemáticas',
          coursesCount: 4,
          studentsWithNEE: 5,
          totalAdjustments: 8,
          readAdjustments: 8,
          readPercentage: 100.0
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token JWT inválido o expirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized'
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Rol no autorizado - Requiere ser jefe de departamento o carrera',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied - Not a department or career head',
        error: 'Forbidden'
      }
    }
  })
  async getMyTeachers(
    @Request() req,
    @Query('semester') semester: string = '2025-1',
  ): Promise<any[]> {
    const user = await this.usersService.findById(req.user.userId);
    const responsibilities = user.additionalResponsibilities || {};

    const teachers: any[] = [];

    // Si es jefe de departamento
    if (responsibilities.isDepartmentHead && responsibilities.departmentIds) {
      for (const deptId of responsibilities.departmentIds) {
        const deptTeachers =
          await this.departmentsService.getTeachersByDepartment(
            deptId.toString(),
          );

        for (const teacher of deptTeachers) {
          // Obtener cursos del docente
          const courses = await this.coursesService.findByTeacher(
            teacher._id.toString(),
            semester,
          );

          // Contar estudiantes con NEE en sus cursos
          let studentsWithNEE = 0;
          let totalAdjustments = 0;
          let readAdjustments = 0;

          for (const course of courses) {
            const adjustments = await this.adjustmentsService.findByCourseNrc(
              course.nrc,
              semester,
            );
            studentsWithNEE += adjustments.length;

            for (const adj of adjustments) {
              for (const currAdj of adj.currentAdjustments) {
                if (currAdj.courseNrc === course.nrc) {
                  totalAdjustments++;
                  if (
                    currAdj.readBy &&
                    currAdj.readBy.some(
                      (r) => r.userId.toString() === teacher._id.toString(),
                    )
                  ) {
                    readAdjustments++;
                  }
                }
              }
            }
          }

          const department = await this.departmentsService.findOne(
            deptId.toString(),
          );

          teachers.push({
            teacherId: teacher._id,
            teacherName: teacher.nombreCompleto,
            teacherEmail: teacher.email,
            department: department.name,
            coursesCount: courses.length,
            studentsWithNEE,
            totalAdjustments,
            readAdjustments,
            readPercentage:
              totalAdjustments > 0
                ? (readAdjustments / totalAdjustments) * 100
                : 0,
          });
        }
      }
    }

    return teachers;
  }

  @Get('teachers/:teacherId/adjustment-status')
  @HeadType('department', 'career')
  @ApiOperation({
    summary: 'Estado detallado de ajustes por docente',
    description: 'Obtiene información detallada sobre el estado de lectura de ajustes razonables de un docente específico, incluyendo desglose por curso y solicitudes de ayuda pendientes.',
  })
  @ApiParam({
    name: 'teacherId',
    description: 'ObjectId del docente a consultar',
    example: '507f1f77bcf86cd799439032'
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Semestre académico para filtrar datos (formato YYYY-P)',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[1-2]$',
      default: '2025-1'
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado detallado de ajustes del docente',
    schema: {
      type: 'object',
      properties: {
        teacher: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439032' },
            name: { type: 'string', example: 'Dr. María Elena González Pérez' },
            email: { type: 'string', example: 'maria.gonzalez@ucn.cl' }
          }
        },
        department: {
          type: 'string',
          description: 'Nombre del departamento',
          example: 'Departamento de Matemáticas'
        },
        semester: {
          type: 'string',
          description: 'Semestre consultado',
          example: '2025-1'
        },
        coursesCount: {
          type: 'number',
          description: 'Número total de cursos',
          example: 3
        },
        totalAdjustments: {
          type: 'number',
          description: 'Total de ajustes en todos los cursos',
          example: 12
        },
        readAdjustments: {
          type: 'number',
          description: 'Ajustes leídos por el docente',
          example: 9
        },
        readPercentage: {
          type: 'number',
          description: 'Porcentaje de lectura',
          example: 75.0
        },
        pendingHelpRequests: {
          type: 'number',
          description: 'Solicitudes de ayuda pendientes',
          example: 2
        },
        courses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              courseNrc: { type: 'string', example: 'MAT101-1' },
              courseName: { type: 'string', example: 'Matemáticas I' },
              studentsWithNEE: { type: 'number', example: 3 },
              adjustments: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    adjustmentId: { type: 'string', example: '507f1f77bcf86cd799439034' },
                    adjustmentIndex: { type: 'number', example: 0 },
                    studentRut: { type: 'string', example: '12345678-9' },
                    adjustmentType: { type: 'string', example: 'tiempo_adicional' },
                    isRead: { type: 'boolean', example: true },
                    readDate: { type: 'string', format: 'date-time', example: '2025-06-19T10:30:00.000Z' },
                    hasPendingHelp: { type: 'boolean', example: false }
                  }
                }
              }
            }
          }
        }
      },
      example: {
        teacher: {
          id: '507f1f77bcf86cd799439032',
          name: 'Dr. María Elena González Pérez',
          email: 'maria.gonzalez@ucn.cl'
        },
        department: 'Departamento de Matemáticas',
        semester: '2025-1',
        coursesCount: 3,
        totalAdjustments: 12,
        readAdjustments: 9,
        readPercentage: 75.0,
        pendingHelpRequests: 2,
        courses: [
          {
            courseNrc: 'MAT101-1',
            courseName: 'Matemáticas I',
            studentsWithNEE: 3,
            adjustments: [
              {
                adjustmentId: '507f1f77bcf86cd799439034',
                adjustmentIndex: 0,
                studentRut: '12345678-9',
                adjustmentType: 'tiempo_adicional',
                isRead: true,
                readDate: '2025-06-19T10:30:00.000Z',
                hasPendingHelp: false
              }
            ]
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'ObjectId de docente inválido',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid teacher ObjectId',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Docente no encontrado en los departamentos supervisados',
    schema: {
      example: {
        statusCode: 404,
        message: 'Docente no encontrado en sus departamentos',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({ 
    status: 403, 
    description: 'Rol no autorizado - Requiere ser jefe de departamento o carrera',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied - Not a department or career head',
        error: 'Forbidden'
      }
    }
  })
  async getTeacherAdjustmentStatus(
    @Param('teacherId') teacherId: string,
    @Query('semester') semester: string = '2025-1',
    @Request() req,
  ): Promise<any> {
    const user = await this.usersService.findById(req.user.userId);
    const responsibilities = user.additionalResponsibilities || {};

    // Verificar que el docente pertenece a un departamento del jefe
    let isTeacherInDepartment = false;
    let departmentName = '';

    if (responsibilities.isDepartmentHead && responsibilities.departmentIds) {
      for (const deptId of responsibilities.departmentIds) {
        const dept = await this.departmentsService.findOne(deptId.toString());
        if (dept.teacherIds.some((id) => id.toString() === teacherId)) {
          isTeacherInDepartment = true;
          departmentName = dept.name;
          break;
        }
      }
    }

    if (!isTeacherInDepartment && !user.roles.includes(UserRole.COORDINADOR)) {
      throw new NotFoundException('Docente no encontrado en sus departamentos');
    }

    // Obtener información del docente
    const teacher = await this.usersService.findById(teacherId);

    // Obtener cursos del docente
    const courses = await this.coursesService.findByTeacher(
      teacherId,
      semester,
    );

    const courseDetails: any[] = [];
    let totalAdjustments = 0;
    let readAdjustments = 0;
    let pendingHelpRequests = 0;

    for (const course of courses) {
      const adjustments = await this.adjustmentsService.findByCourseNrc(
        course.nrc,
        semester,
      );

      const courseAdjustments: any[] = [];
      for (const adj of adjustments) {
        for (let i = 0; i < adj.currentAdjustments.length; i++) {
          const currAdj = adj.currentAdjustments[i];
          if (currAdj.courseNrc === course.nrc) {
            totalAdjustments++;
            const isRead =
              currAdj.readBy &&
              currAdj.readBy.some((r) => r.userId.toString() === teacherId);
            if (isRead) {
              readAdjustments++;
            }

            const hasPendingHelp =
              currAdj.helpRequests &&
              currAdj.helpRequests.some((hr) => hr.status === 'pendiente');
            if (hasPendingHelp) {
              pendingHelpRequests++;
            }

            courseAdjustments.push({
              adjustmentId: adj._id,
              adjustmentIndex: i,
              studentRut: adj.studentRut,
              adjustmentType: (currAdj as any).adjustmentType || 'general',
              isRead,
              readDate:
                isRead && currAdj.readBy
                  ? currAdj.readBy.find(
                      (r) => r.userId.toString() === teacherId,
                    )?.readDate
                  : null,
              hasPendingHelp,
            });
          }
        }
      }

      courseDetails.push({
        courseNrc: course.nrc,
        courseName: course.nombre,
        studentsWithNEE: adjustments.length,
        adjustments: courseAdjustments,
      });
    }

    return {
      teacher: {
        id: teacher._id,
        name: teacher.nombreCompleto,
        email: teacher.email,
      },
      department: departmentName,
      semester,
      coursesCount: courses.length,
      totalAdjustments,
      readAdjustments,
      readPercentage:
        totalAdjustments > 0 ? (readAdjustments / totalAdjustments) * 100 : 0,
      pendingHelpRequests,
      courses: courseDetails,
    };
  }

  @Get('department/statistics')
  @HeadType('department')
  @ApiOperation({ summary: 'Obtener estadísticas del departamento' })
  @ApiResponse({ status: 200, description: 'Estadísticas del departamento' })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre',
  })
  async getDepartmentStatistics(
    @Request() req,
    @Query('semester') semester: string = '2025-1',
  ): Promise<any> {
    const user = await this.usersService.findById(req.user.userId);
    const responsibilities = user.additionalResponsibilities || {};

    const statistics: any[] = [];

    if (responsibilities.isDepartmentHead && responsibilities.departmentIds) {
      for (const deptId of responsibilities.departmentIds) {
        const dept = await this.departmentsService.findOne(deptId.toString());
        const teachers = await this.departmentsService.getTeachersByDepartment(
          deptId.toString(),
        );

        let totalCourses = 0;
        let totalStudentsWithNEE = 0;
        let totalAdjustments = 0;
        let readAdjustments = 0;
        let pendingHelpRequests = 0;

        const teacherStats: any[] = [];

        for (const teacher of teachers) {
          const courses = await this.coursesService.findByTeacher(
            teacher._id.toString(),
            semester,
          );
          totalCourses += courses.length;

          let teacherTotalAdj = 0;
          let teacherReadAdj = 0;
          let teacherStudentsNEE = 0;

          for (const course of courses) {
            const adjustments = await this.adjustmentsService.findByCourseNrc(
              course.nrc,
              semester,
            );
            teacherStudentsNEE += adjustments.length;
            totalStudentsWithNEE += adjustments.length;

            for (const adj of adjustments) {
              for (const currAdj of adj.currentAdjustments) {
                if (currAdj.courseNrc === course.nrc) {
                  totalAdjustments++;
                  teacherTotalAdj++;

                  if (
                    currAdj.readBy &&
                    currAdj.readBy.some(
                      (r) => r.userId.toString() === teacher._id.toString(),
                    )
                  ) {
                    readAdjustments++;
                    teacherReadAdj++;
                  }

                  if (
                    currAdj.helpRequests &&
                    currAdj.helpRequests.some((hr) => hr.status === 'pendiente')
                  ) {
                    pendingHelpRequests++;
                  }
                }
              }
            }
          }

          teacherStats.push({
            teacherId: teacher._id,
            teacherName: teacher.nombreCompleto,
            coursesCount: courses.length,
            studentsWithNEE: teacherStudentsNEE,
            totalAdjustments: teacherTotalAdj,
            readAdjustments: teacherReadAdj,
            readPercentage:
              teacherTotalAdj > 0
                ? (teacherReadAdj / teacherTotalAdj) * 100
                : 0,
          });
        }

        statistics.push({
          departmentId: dept._id,
          departmentName: dept.name,
          semester,
          teachersCount: teachers.length,
          totalCourses,
          totalStudentsWithNEE,
          totalAdjustments,
          readAdjustments,
          readPercentage:
            totalAdjustments > 0
              ? (readAdjustments / totalAdjustments) * 100
              : 0,
          pendingHelpRequests,
          teacherStatistics: teacherStats,
        });
      }
    }

    return statistics;
  }

  @Get('alerts/unreviewed-adjustments')
  @HeadType('department', 'career')
  @ApiOperation({ summary: 'Obtener alertas de ajustes no revisados' })
  @ApiResponse({ status: 200, description: 'Lista de ajustes no revisados' })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre',
  })
  @ApiQuery({
    name: 'daysThreshold',
    required: false,
    description: 'Días sin revisar para generar alerta',
    type: 'number',
  })
  async getUnreviewedAdjustments(
    @Request() req,
    @Query('semester') semester: string = '2025-1',
    @Query('daysThreshold') daysThreshold: number = 3,
  ): Promise<any[]> {
    const user = await this.usersService.findById(req.user.userId);
    const responsibilities = user.additionalResponsibilities || {};
    const alerts: any[] = [];

    if (responsibilities.isDepartmentHead && responsibilities.departmentIds) {
      for (const deptId of responsibilities.departmentIds) {
        const dept = await this.departmentsService.findOne(deptId.toString());
        const teachers = await this.departmentsService.getTeachersByDepartment(
          deptId.toString(),
        );

        for (const teacher of teachers) {
          const courses = await this.coursesService.findByTeacher(
            teacher._id.toString(),
            semester,
          );

          for (const course of courses) {
            const adjustments = await this.adjustmentsService.findByCourseNrc(
              course.nrc,
              semester,
            );

            for (const adj of adjustments) {
              for (let i = 0; i < adj.currentAdjustments.length; i++) {
                const currAdj = adj.currentAdjustments[i];
                if (currAdj.courseNrc === course.nrc) {
                  const isRead =
                    currAdj.readBy &&
                    currAdj.readBy.some(
                      (r) => r.userId.toString() === teacher._id.toString(),
                    );

                  if (!isRead) {
                    const daysSinceCreated = Math.floor(
                      (Date.now() - new Date(adj.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24),
                    );

                    if (daysSinceCreated >= daysThreshold) {
                      alerts.push({
                        adjustmentId: adj._id,
                        adjustmentIndex: i,
                        studentRut: adj.studentRut,
                        adjustmentType:
                          (currAdj as any).adjustmentType || 'general',
                        courseNrc: course.nrc,
                        courseName: course.nombre,
                        teacherId: teacher._id,
                        teacherName: teacher.nombreCompleto,
                        teacherEmail: teacher.email,
                        departmentName: dept.name,
                        daysSinceCreated,
                        createdAt: adj.createdAt,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Ordenar por días desde creación (más antiguos primero)
    alerts.sort((a, b) => b.daysSinceCreated - a.daysSinceCreated);

    return alerts;
  }

  @Post('alerts/remind-teacher/:teacherId')
  @HeadType('department', 'career')
  @ApiOperation({
    summary: 'Enviar recordatorio a un docente sobre ajustes no leídos',
  })
  @ApiResponse({
    status: 200,
    description: 'Recordatorio enviado exitosamente',
  })
  async remindTeacher(
    @Param('teacherId') teacherId: string,
    @Query('semester') semester: string = '2025-1',
    @Request() req,
  ): Promise<any> {
    const user = await this.usersService.findById(req.user.userId);
    const responsibilities = user.additionalResponsibilities || {};

    // Verificar que el docente pertenece a un departamento del jefe
    let isTeacherInDepartment = false;
    let departmentName = '';

    if (responsibilities.isDepartmentHead && responsibilities.departmentIds) {
      for (const deptId of responsibilities.departmentIds) {
        const dept = await this.departmentsService.findOne(deptId.toString());
        if (dept.teacherIds.some((id) => id.toString() === teacherId)) {
          isTeacherInDepartment = true;
          departmentName = dept.name;
          break;
        }
      }
    }

    if (!isTeacherInDepartment && !user.roles.includes(UserRole.COORDINADOR)) {
      throw new NotFoundException('Docente no encontrado en sus departamentos');
    }

    // Obtener información del docente
    const teacher = await this.usersService.findById(teacherId);

    // Contar ajustes no leídos
    const courses = await this.coursesService.findByTeacher(
      teacherId,
      semester,
    );
    let unreadCount = 0;
    const unreadCourses: any[] = [];

    for (const course of courses) {
      const adjustments = await this.adjustmentsService.findByCourseNrc(
        course.nrc,
        semester,
      );
      let courseUnreadCount = 0;

      for (const adj of adjustments) {
        for (const currAdj of adj.currentAdjustments) {
          if (currAdj.courseNrc === course.nrc) {
            const isRead =
              currAdj.readBy &&
              currAdj.readBy.some((r) => r.userId.toString() === teacherId);
            if (!isRead) {
              unreadCount++;
              courseUnreadCount++;
            }
          }
        }
      }

      if (courseUnreadCount > 0) {
        unreadCourses.push({
          courseNrc: course.nrc,
          courseName: course.nombre,
          unreadCount: courseUnreadCount,
        });
      }
    }

    if (unreadCount > 0) {
      // Crear notificación para el docente
      const message =
        `Tienes ${unreadCount} ajustes razonables pendientes de revisar en tus cursos:\n` +
        unreadCourses
          .map(
            (c) =>
              `- ${c.courseName} (${c.courseNrc}): ${c.unreadCount} ajustes`,
          )
          .join('\n') +
        '\n\nPor favor, revísalos lo antes posible.';

      await this.notificationsService.createSystemNotification(
        teacherId,
        'Recordatorio: Ajustes pendientes de revisión',
        message,
        NotificationType.ADJUSTMENT_APPROVAL_NEEDED,
        semester,
      );

      return {
        success: true,
        message: `Recordatorio enviado a ${teacher.nombreCompleto}`,
        unreadAdjustments: unreadCount,
        courses: unreadCourses,
      };
    } else {
      return {
        success: false,
        message: `El docente ${teacher.nombreCompleto} no tiene ajustes pendientes de revisar`,
        unreadAdjustments: 0,
        courses: [],
      };
    }
  }
}
