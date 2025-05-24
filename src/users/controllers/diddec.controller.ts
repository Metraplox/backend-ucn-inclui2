import {
  Controller,
  Get,
  Post,
  Body,
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
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { DIDDECGuard } from '../../auth/guards/diddec.guard';
import { UsersService } from '../users.service';
import { StudentsService } from '../../students/students.service';
import { AdjustmentsService } from '../../adjustments/adjustments.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { DepartmentsService } from '../../departments/departments.service';
import { CareersService } from '../../careers/careers.service';
import { UserRole } from '../schemas/user.schema';
import { Department } from '../../departments/schemas/department.schema';
import { Notification } from '../../notifications/schemas/notification.schema';

@ApiTags('diddec')
@ApiBearerAuth()
@Controller('diddec')
@UseGuards(JwtAuthGuard, RolesGuard, DIDDECGuard)
export class DIDDECController {
  constructor(
    private readonly usersService: UsersService,
    private readonly studentsService: StudentsService,
    private readonly adjustmentsService: AdjustmentsService,
    private readonly notificationsService: NotificationsService,
    private readonly departmentsService: DepartmentsService,
    private readonly careersService: CareersService,
  ) {}

  @Get('global-statistics')
  @ApiOperation({
    summary: 'Obtener estadísticas globales del sistema',
    description:
      'Retorna estadísticas completas del sistema incluyendo estudiantes, ajustes, departamentos y carreras',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    type: String,
    description: 'Semestre a filtrar (ej: 2025-1)',
    example: '2025-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas globales obtenidas exitosamente',
    schema: {
      example: {
        semester: '2025-1',
        studentsStatistics: {
          total: 100,
          withNEE: 50,
          percentageWithNEE: 50,
        },
        adjustmentsStatistics: {
          totalStudentsWithAdjustments: 20,
          totalCurrentAdjustments: 100,
          readAdjustments: 80,
          readPercentage: 80,
          pendingHelpRequests: 10,
        },
        usersStatistics: {
          totalTeachers: 10,
          totalStaff: 5,
        },
        organizationStatistics: {
          totalDepartments: 5,
          totalCareers: 15,
          activeCareers: 10,
        },
      },
    },
  })
  async getGlobalStatistics(
    @Query('semester') semester: string = '2025-1',
  ): Promise<any> {
    // Estadísticas de estudiantes
    const students = await this.studentsService.findAll();
    const studentsWithNEE = students.filter(
      (s) => s.hasDisability && s.semester === semester,
    );

    // Estadísticas de ajustes
    const adjustments = await this.adjustmentsService.findAll();
    const semesterAdjustments = adjustments.filter(
      (adj) => adj.semester === semester,
    );
    let totalCurrentAdjustments = 0;
    let readAdjustments = 0;
    let pendingHelpRequests = 0;

    semesterAdjustments.forEach((adj) => {
      totalCurrentAdjustments += adj.currentAdjustments.length;
      adj.currentAdjustments.forEach((currAdj) => {
        if (currAdj.readBy && currAdj.readBy.length > 0) {
          readAdjustments++;
        }
        if (
          currAdj.helpRequests &&
          currAdj.helpRequests.some((hr) => hr.status === 'pendiente')
        ) {
          pendingHelpRequests++;
        }
      });
    });

    // Estadísticas de usuarios
    const teachers = await this.usersService.findByRole(UserRole.TEACHER);
    const staff = await this.usersService.findByRole(UserRole.STAFF);

    // Estadísticas de departamentos y carreras
    const departments = await this.departmentsService.findAll();
    const careers = await this.careersService.findAll(semester);

    return {
      semester,
      studentsStatistics: {
        total: students.filter((s) => s.semester === semester).length,
        withNEE: studentsWithNEE.length,
        percentageWithNEE:
          students.filter((s) => s.semester === semester).length > 0
            ? (studentsWithNEE.length /
                students.filter((s) => s.semester === semester).length) *
              100
            : 0,
      },
      adjustmentsStatistics: {
        totalStudentsWithAdjustments: semesterAdjustments.length,
        totalCurrentAdjustments,
        readAdjustments,
        readPercentage:
          totalCurrentAdjustments > 0
            ? (readAdjustments / totalCurrentAdjustments) * 100
            : 0,
        pendingHelpRequests,
      },
      usersStatistics: {
        totalTeachers: teachers.length,
        totalStaff: staff.length,
      },
      organizationStatistics: {
        totalDepartments: departments.length,
        totalCareers: careers.length,
        activeCareers: careers.filter((c) => c.isActive).length,
      },
    };
  }

  @Get('disability-statistics')
  @ApiOperation({
    summary: 'Obtener estadísticas por tipo de discapacidad',
    description:
      'Retorna estadísticas detalladas agrupadas por tipo de discapacidad',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    type: String,
    description: 'Semestre a filtrar',
    example: '2025-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas por discapacidad obtenidas exitosamente',
    schema: {
      example: {
        semester: '2025-1',
        totalStudentsWithNEE: 50,
        disabilityDistribution: [
          {
            disabilityType: 'visual',
            studentCount: 20,
            percentage: 40,
            averageAdjustments: 3,
          },
          {
            disabilityType: 'auditivo',
            studentCount: 15,
            percentage: 30,
            averageAdjustments: 2,
          },
        ],
      },
    },
  })
  async getDisabilityStatistics(
    @Query('semester') semester: string = '2025-1',
  ): Promise<any> {
    const students = await this.studentsService.findAll();
    const studentsWithNEE = students.filter(
      (s) => s.hasDisability && s.semester === semester,
    );

    const disabilityTypes: { [key: string]: number } = {};
    const adjustmentsByDisability: { [key: string]: number } = {};

    for (const student of studentsWithNEE) {
      const disabilityType = student.disabilityType || 'No especificada';
      disabilityTypes[disabilityType] =
        (disabilityTypes[disabilityType] || 0) + 1;

      // Contar ajustes por tipo de discapacidad
      const adjustments = await this.adjustmentsService.findByStudentId(
        student._id.toString(),
      );
      const semesterAdjustments = adjustments.filter(
        (adj) => adj.semester === semester,
      );
      if (semesterAdjustments.length > 0) {
        let totalAdjustments = 0;
        semesterAdjustments.forEach((adj) => {
          totalAdjustments += adj.currentAdjustments.length;
        });
        adjustmentsByDisability[disabilityType] =
          (adjustmentsByDisability[disabilityType] || 0) + totalAdjustments;
      }
    }

    return {
      semester,
      totalStudentsWithNEE: studentsWithNEE.length,
      disabilityDistribution: Object.entries(disabilityTypes).map(
        ([type, count]) => ({
          disabilityType: type,
          studentCount: count,
          percentage: (count / studentsWithNEE.length) * 100,
          averageAdjustments: adjustmentsByDisability[type]
            ? adjustmentsByDisability[type] / count
            : 0,
        }),
      ),
    };
  }

  @Get('department-comparison')
  @ApiOperation({
    summary: 'Comparar estadísticas entre departamentos',
    description:
      'Retorna comparación de estadísticas de NEE entre todos los departamentos',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    type: String,
    description: 'Semestre a filtrar',
    example: '2025-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Comparación entre departamentos obtenida exitosamente',
    schema: {
      example: {
        semester: '2025-1',
        departments: [
          {
            departmentId: '1',
            departmentName: 'Ingeniería',
            teacherCount: 10,
            careerCount: 5,
            studentsWithNEE: 20,
            totalAdjustments: 50,
            readAdjustments: 40,
            readPercentage: 80,
          },
          {
            departmentId: '2',
            departmentName: 'Matemáticas',
            teacherCount: 5,
            careerCount: 3,
            studentsWithNEE: 15,
            totalAdjustments: 30,
            readAdjustments: 20,
            readPercentage: 66.67,
          },
        ],
      },
    },
  })
  async getDepartmentComparison(
    @Query('semester') semester: string = '2025-1',
  ): Promise<any> {
    const departments = await this.departmentsService.findAll();
    const departmentStats: any[] = [];

    for (const dept of departments) {
      const teachers = await this.departmentsService.getTeachersByDepartment(
        dept._id?.toString() || '',
      );
      const careers = await this.careersService.findByDepartment(
        dept._id?.toString() || '',
      );

      let totalStudentsWithNEE = 0;
      let totalAdjustments = 0;
      let readAdjustments = 0;

      // Analizar cada carrera del departamento
      for (const career of careers) {
        const students = await this.studentsService.findAll();
        const careerStudentsWithNEE = students.filter(
          (s) =>
            s.hasDisability &&
            s.semester === semester &&
            career.studentIds.includes(s._id as any),
        );
        totalStudentsWithNEE += careerStudentsWithNEE.length;

        // Contar ajustes
        for (const student of careerStudentsWithNEE) {
          const adjustments = await this.adjustmentsService.findByStudentId(
            student._id.toString(),
          );
          const semesterAdjustments = adjustments.filter(
            (adj) => adj.semester === semester,
          );
          semesterAdjustments.forEach((adj) => {
            totalAdjustments += adj.currentAdjustments.length;
            adj.currentAdjustments.forEach((currAdj) => {
              if (currAdj.readBy && currAdj.readBy.length > 0) {
                readAdjustments++;
              }
            });
          });
        }
      }

      departmentStats.push({
        departmentId: dept._id,
        departmentName: dept.name,
        teacherCount: teachers.length,
        careerCount: careers.length,
        studentsWithNEE: totalStudentsWithNEE,
        totalAdjustments,
        readAdjustments,
        readPercentage:
          totalAdjustments > 0 ? (readAdjustments / totalAdjustments) * 100 : 0,
      });
    }

    // Ordenar por cantidad de estudiantes con NEE
    departmentStats.sort((a, b) => b.studentsWithNEE - a.studentsWithNEE);

    return {
      semester,
      departments: departmentStats,
    };
  }

  @Get('teachers-performance')
  @ApiOperation({
    summary: 'Obtener rendimiento de docentes',
    description:
      'Retorna métricas de rendimiento de docentes en el manejo de ajustes',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    type: String,
    description: 'Semestre a filtrar',
    example: '2025-1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Límite de resultados',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Rendimiento de docentes obtenido exitosamente',
    schema: {
      example: {
        semester: '2025-1',
        topPerformers: [
          {
            teacherId: '1',
            teacherName: 'Juan Pérez',
            teacherEmail: 'juan.perez@example.com',
            totalAdjustments: 20,
            readAdjustments: 18,
            readPercentage: 90,
            averageResponseTime: 3,
          },
          {
            teacherId: '2',
            teacherName: 'María Rodríguez',
            teacherEmail: 'maria.rodriguez@example.com',
            totalAdjustments: 15,
            readAdjustments: 12,
            readPercentage: 80,
            averageResponseTime: 4,
          },
        ],
        lowPerformers: [
          {
            teacherId: '3',
            teacherName: 'Pedro García',
            teacherEmail: 'pedro.garcia@example.com',
            totalAdjustments: 10,
            readAdjustments: 5,
            readPercentage: 50,
            averageResponseTime: 5,
          },
          {
            teacherId: '4',
            teacherName: 'Ana López',
            teacherEmail: 'ana.lopez@example.com',
            totalAdjustments: 8,
            readAdjustments: 4,
            readPercentage: 50,
            averageResponseTime: 6,
          },
        ],
      },
    },
  })
  async getTeachersPerformance(
    @Query('semester') semester: string = '2025-1',
    @Query('limit') limit: number = 10,
  ): Promise<any> {
    const teachers = await this.usersService.findByRole(UserRole.TEACHER);
    const teacherStats: any[] = [];

    for (const teacher of teachers) {
      let totalAdjustments = 0;
      let readAdjustments = 0;
      let responseTime = 0;
      let responseCount = 0;

      // Obtener todos los ajustes relevantes para el docente
      const adjustments = await this.adjustmentsService.findAll();
      const semesterAdjustments = adjustments.filter(
        (adj) => adj.semester === semester,
      );

      for (const adj of semesterAdjustments) {
        for (const currAdj of adj.currentAdjustments) {
          // Verificar si el ajuste es para un curso del docente
          // (Aquí necesitarías verificar contra los cursos del docente)
          totalAdjustments++;

          if (currAdj.readBy) {
            const teacherRead = currAdj.readBy.find(
              (r) => r.userId.toString() === teacher._id.toString(),
            );
            if (teacherRead) {
              readAdjustments++;
              // Calcular tiempo de respuesta
              const adjustmentDate = new Date(adj.createdAt);
              const readDate = new Date(teacherRead.readDate);
              const timeDiff = readDate.getTime() - adjustmentDate.getTime();
              responseTime += timeDiff;
              responseCount++;
            }
          }
        }
      }

      if (totalAdjustments > 0) {
        teacherStats.push({
          teacherId: teacher._id,
          teacherName: teacher.nombreCompleto,
          teacherEmail: teacher.email,
          totalAdjustments,
          readAdjustments,
          readPercentage: (readAdjustments / totalAdjustments) * 100,
          averageResponseTime:
            responseCount > 0
              ? Math.floor(responseTime / responseCount / (1000 * 60 * 60 * 24)) // En días
              : null,
        });
      }
    }

    // Ordenar por porcentaje de lectura (mejor rendimiento primero)
    teacherStats.sort((a, b) => b.readPercentage - a.readPercentage);

    return {
      semester,
      topPerformers: teacherStats.slice(0, limit),
      lowPerformers: teacherStats.slice(-limit).reverse(),
    };
  }

  @Post('send-global-notification')
  @ApiOperation({
    summary: 'Enviar notificación global',
    description:
      'Envía una notificación a todos los usuarios del sistema o a un grupo específico',
  })
  @ApiBody({
    description: 'Datos de la notificación a enviar',
    schema: {
      example: {
        targetRole: 'teacher',
        title: 'Actualización importante',
        message: 'Se han agregado nuevos ajustes al sistema',
        type: 'info',
        semester: '2025-1',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Notificación enviada exitosamente',
    schema: {
      example: {
        success: true,
        notificationsSent: 45,
        message: 'Notificación enviada a 45 usuarios',
      },
    },
  })
  async sendGlobalNotification(
    @Body()
    notificationDto: {
      targetRole: UserRole;
      title: string;
      message: string;
      type: 'info' | 'warning' | 'success' | 'error';
      semester: string;
    },
  ): Promise<any> {
    const users = await this.usersService.findByRole(
      notificationDto.targetRole,
    );
    const notifications: Notification[] = [];

    for (const user of users) {
      const notification =
        await this.notificationsService.createSystemNotification(
          user._id.toString(),
          notificationDto.title,
          notificationDto.message,
          notificationDto.type,
          notificationDto.semester,
        );
      notifications.push(notification);
    }

    return {
      success: true,
      message: `Notificación enviada a ${notifications.length} usuarios con rol ${notificationDto.targetRole}`,
      notificationsSent: notifications.length,
    };
  }

  @Get('critical-alerts')
  @ApiOperation({
    summary: 'Obtener alertas críticas del sistema',
    description:
      'Retorna alertas sobre situaciones que requieren atención inmediata',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    type: String,
    description: 'Semestre a filtrar',
    example: '2025-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Alertas críticas obtenidas exitosamente',
    schema: {
      example: {
        semester: '2025-1',
        totalAlerts: 10,
        alertsByType: {
          unreadAdjustments: 5,
          pendingHelpRequests: 3,
          departmentsWithoutHead: 1,
          careersWithoutHead: 1,
        },
        alerts: [
          {
            type: 'unread_adjustment',
            severity: 'high',
            studentRut: '12345678-9',
            adjustmentId: '1',
            adjustmentIndex: 0,
            daysSinceCreated: 7,
            courseNrc: '12345',
          },
          {
            type: 'pending_help_request',
            severity: 'medium',
            studentRut: '98765432-1',
            adjustmentId: '2',
            adjustmentIndex: 1,
            daysSinceRequest: 3,
            requestedBy: 'teacher1',
          },
        ],
      },
    },
  })
  async getCriticalAlerts(
    @Query('semester') semester: string = '2025-1',
  ): Promise<any> {
    const alerts: any[] = [];

    // Alerta 1: Ajustes sin leer por más de 7 días
    const adjustments = await this.adjustmentsService.findAll();
    const semesterAdjustments = adjustments.filter(
      (adj) => adj.semester === semester,
    );
    const now = Date.now();

    for (const adj of semesterAdjustments) {
      for (let i = 0; i < adj.currentAdjustments.length; i++) {
        const currAdj = adj.currentAdjustments[i];
        if (!currAdj.readBy || currAdj.readBy.length === 0) {
          const daysSinceCreated = Math.floor(
            (now - new Date(adj.createdAt).getTime()) / (1000 * 60 * 60 * 24),
          );

          if (daysSinceCreated >= 7) {
            alerts.push({
              type: 'unread_adjustment',
              severity: 'high',
              studentRut: adj.studentRut,
              adjustmentId: adj._id,
              adjustmentIndex: i,
              daysSinceCreated,
              courseNrc: currAdj.courseNrc,
            });
          }
        }
      }
    }

    // Alerta 2: Solicitudes de ayuda pendientes por más de 3 días
    for (const adj of semesterAdjustments) {
      for (let i = 0; i < adj.currentAdjustments.length; i++) {
        const currAdj = adj.currentAdjustments[i];
        if (currAdj.helpRequests) {
          for (const helpRequest of currAdj.helpRequests) {
            if (helpRequest.status === 'pendiente') {
              const daysSinceRequest = Math.floor(
                (now - new Date(helpRequest.requestDate).getTime()) /
                  (1000 * 60 * 60 * 24),
              );

              if (daysSinceRequest >= 3) {
                alerts.push({
                  type: 'pending_help_request',
                  severity: 'medium',
                  studentRut: adj.studentRut,
                  adjustmentId: adj._id,
                  adjustmentIndex: i,
                  daysSinceRequest,
                  requestedBy: helpRequest.userId.toString(),
                });
              }
            }
          }
        }
      }
    }

    // Alerta 3: Departamentos sin jefe asignado
    const departments = await this.departmentsService.findAll();
    for (const dept of departments) {
      if (!dept.headId) {
        alerts.push({
          type: 'department_without_head',
          severity: 'medium',
          departmentId: dept._id,
          departmentName: dept.name,
        });
      }
    }

    // Alerta 4: Carreras sin jefe asignado
    const careers = await this.careersService.findAll(semester);
    for (const career of careers) {
      if (!career.headId && career.isActive) {
        alerts.push({
          type: 'career_without_head',
          severity: 'medium',
          careerId: career._id,
          careerName: career.name,
          careerCode: career.code,
        });
      }
    }

    return {
      semester,
      totalAlerts: alerts.length,
      alertsByType: {
        unreadAdjustments: alerts.filter((a) => a.type === 'unread_adjustment')
          .length,
        pendingHelpRequests: alerts.filter(
          (a) => a.type === 'pending_help_request',
        ).length,
        departmentsWithoutHead: alerts.filter(
          (a) => a.type === 'department_without_head',
        ).length,
        careersWithoutHead: alerts.filter(
          (a) => a.type === 'career_without_head',
        ).length,
      },
      alerts: alerts.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
    };
  }
}
