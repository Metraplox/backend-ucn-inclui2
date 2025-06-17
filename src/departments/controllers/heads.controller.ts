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
@ApiBearerAuth()
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
    summary: 'Obtener docentes a cargo del jefe de departamento/carrera',
  })
  @ApiResponse({ status: 200, description: 'Lista de docentes' })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre',
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
    summary: 'Obtener estado de lectura de ajustes de un docente específico',
  })
  @ApiResponse({ status: 200, description: 'Estado de ajustes del docente' })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre',
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
