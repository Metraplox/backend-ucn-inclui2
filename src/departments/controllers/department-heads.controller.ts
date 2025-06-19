import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  NotFoundException,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DepartmentHeadGuard } from '../../auth/guards/department-head.guard';
import { DepartmentStatsService } from '../services/department-stats.service';
import { DepartmentStatsResponseDto } from '../dto/department-stats-response.dto';
import { DepartmentStudentsNeeResponseDto } from '../dto/department-student-nee-response.dto';
import { DepartmentTeachersResponseDto } from '../dto/department-teachers-response.dto';
import { Department } from '../schemas/department.schema';

@ApiTags('department-heads')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, DepartmentHeadGuard)
@Controller('departments/heads')
export class DepartmentHeadsController {
  constructor(private readonly departmentStatsService: DepartmentStatsService) {}

  @Get('my-department')
  @ApiOperation({ 
    summary: 'Obtener departamento asignado',
    description: 'Obtiene la información completa del departamento asignado al jefe de departamento autenticado, incluyendo carreras, docentes y datos generales.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Información completa del departamento asignado',
    type: Department,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439035',
        name: 'Departamento de Matemáticas',
        description: 'Departamento encargado de la enseñanza de matemáticas y ciencias exactas',
        faculty: 'Facultad de Ciencias Exactas',
        currentSemester: '2025-1',
        head: '507f1f77bcf86cd799439036',
        teacherIds: ['507f1f77bcf86cd799439032', '507f1f77bcf86cd799439033'],
        careerIds: ['507f1f77bcf86cd799439037', '507f1f77bcf86cd799439038'],
        isActive: true,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2025-06-19T20:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Departamento no encontrado para el jefe autenticado',
    schema: {
      example: {
        statusCode: 404,
        message: 'No se encontró el departamento para el jefe especificado',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({ 
    status: 403, 
    description: 'Rol no autorizado - Solo jefes de departamento',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied - Not a department head',
        error: 'Forbidden'
      }
    }
  })
  async getMyDepartment(@Request() req: { user: { userId: string } }): Promise<Department> {
    const userId = req.user.userId;
    const department = await this.departmentStatsService.getDepartmentByHead(userId);
    
    if (!department) {
      throw new NotFoundException('No se encontró el departamento para el jefe especificado');
    }
    
    return department;
  }

  @Get('statistics')
  @ApiOperation({ 
    summary: 'Estadísticas del departamento',
    description: 'Obtiene estadísticas completas del departamento asignado al jefe, incluyendo métricas de estudiantes con NEE, ajustes razonables, docentes y rendimiento general por semestre.'
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Semestre académico para generar estadísticas (formato YYYY-P). Si no se especifica, usa el semestre actual del departamento.',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[1-2]$'
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas completas del departamento',
    type: DepartmentStatsResponseDto,
    schema: {
      example: {
        department: {
          id: '507f1f77bcf86cd799439035',
          name: 'Departamento de Matemáticas',
          faculty: 'Facultad de Ciencias Exactas'
        },
        semester: '2025-1',
        totalStudents: 450,
        studentsWithNEE: 28,
        neePercentage: 6.22,
        totalTeachers: 15,
        teachersWithNEEStudents: 12,
        totalCourses: 42,
        coursesWithNEEStudents: 35,
        adjustmentStats: {
          total: 85,
          approved: 78,
          pending: 5,
          rejected: 2,
          byType: {
            'tiempo_adicional': 35,
            'evaluacion_oral': 20,
            'material_adaptado': 18,
            'ubicacion_preferencial': 12
          }
        },
        careerStats: [
          {
            careerId: '507f1f77bcf86cd799439037',
            careerName: 'Ingeniería Civil Matemática',
            studentsCount: 180,
            studentsWithNEE: 12
          },
          {
            careerId: '507f1f77bcf86cd799439038',
            careerName: 'Licenciatura en Matemáticas',
            studentsCount: 270,
            studentsWithNEE: 16
          }
        ],
        lastUpdated: '2025-06-19T20:30:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Formato de semestre inválido o ID de departamento no válido',
    schema: {
      examples: {
        'semestre-invalido': {
          summary: 'Formato de semestre incorrecto',
          value: {
            statusCode: 400,
            message: 'El formato del semestre debe ser YYYY-P donde P es 1 o 2',
            error: 'Bad Request'
          }
        },
        'id-invalido': {
          summary: 'ID de departamento no válido',
          value: {
            statusCode: 400,
            message: 'ID de departamento no válido',
            error: 'Bad Request'
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Departamento no encontrado para el jefe autenticado',
    schema: {
      example: {
        statusCode: 404,
        message: 'No se encontró el departamento para el jefe especificado',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({ 
    status: 403, 
    description: 'Rol no autorizado - Solo jefes de departamento',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied - Not a department head',
        error: 'Forbidden'
      }
    }
  })
  async getDepartmentStatistics(
    @Request() req: { user: { userId: string } },
    @Query('semester') semester?: string,
  ): Promise<DepartmentStatsResponseDto> {
    const userId = req.user.userId;
    const department = await this.departmentStatsService.getDepartmentByHead(userId);
    
    if (!department) {
      throw new NotFoundException('No se encontró el departamento para el jefe especificado');
    }
    
    const departmentId = department._id?.toString?.();
    if (!departmentId) {
      throw new BadRequestException('ID de departamento no válido');
    }
    
    const currentYear = new Date().getFullYear();
    const defaultSemester = `${currentYear}-1`; // Primer semestre del año actual
    const targetSemester = semester || department.currentSemester || defaultSemester;
    
    return this.departmentStatsService.getDepartmentStats(departmentId, targetSemester);
  }

  @Get('students/nee')
  @ApiOperation({ 
    summary: 'Estudiantes con NEE del departamento',
    description: 'Obtiene la lista detallada de estudiantes con Necesidades Educativas Especiales matriculados en las carreras del departamento, incluyendo información de sus ajustes activos y estado de implementación.'
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Semestre académico para filtrar estudiantes (formato YYYY-P). Si no se especifica, usa el semestre actual del departamento.',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[1-2]$'
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Lista detallada de estudiantes con NEE del departamento',
    type: DepartmentStudentsNeeResponseDto,
    schema: {
      example: {
        department: {
          id: '507f1f77bcf86cd799439035',
          name: 'Departamento de Matemáticas'
        },
        semester: '2025-1',
        totalStudentsWithNEE: 28,
        students: [
          {
            studentId: '507f1f77bcf86cd799439039',
            rut: '12345678-9',
            fullName: 'Ana María Rodríguez Silva',
            email: 'ana.rodriguez@alumnos.ucn.cl',
            career: {
              id: '507f1f77bcf86cd799439037',
              name: 'Ingeniería Civil Matemática',
              semester: 6
            },
            needsTypes: ['Discapacidad visual', 'Trastorno de atención'],
            activeAdjustments: [
              {
                adjustmentId: '507f1f77bcf86cd799439040',
                type: 'tiempo_adicional',
                description: '50% tiempo adicional en evaluaciones',
                status: 'aprobado',
                courses: ['MAT101-1', 'FIS201-1']
              },
              {
                adjustmentId: '507f1f77bcf86cd799439041',
                type: 'material_adaptado',
                description: 'Material en formato digital con lector de pantalla',
                status: 'implementado',
                courses: ['MAT101-1']
              }
            ],
            lastDocumentUpdate: '2025-06-15T14:30:00.000Z'
          }
        ],
        summary: {
          byCareer: [
            {
              careerId: '507f1f77bcf86cd799439037',
              careerName: 'Ingeniería Civil Matemática',
              count: 12
            },
            {
              careerId: '507f1f77bcf86cd799439038',
              careerName: 'Licenciatura en Matemáticas',
              count: 16
            }
          ],
          byNeedType: [
            {
              type: 'Discapacidad visual',
              count: 8
            },
            {
              type: 'Trastorno de atención',
              count: 12
            },
            {
              type: 'Discapacidad auditiva',
              count: 5
            },
            {
              type: 'Discapacidad motora',
              count: 3
            }
          ]
        },
        lastUpdated: '2025-06-19T20:45:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'ID de departamento no válido',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID de departamento no válido',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Departamento no encontrado para el jefe autenticado',
    schema: {
      example: {
        statusCode: 404,
        message: 'No se encontró el departamento para el jefe especificado',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({ 
    status: 403, 
    description: 'Rol no autorizado - Solo jefes de departamento',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied - Not a department head',
        error: 'Forbidden'
      }
    }
  })
  async getDepartmentStudentsWithNEE(
    @Request() req: { user: { userId: string } },
    @Query('semester') semester?: string,
  ): Promise<DepartmentStudentsNeeResponseDto> {
    const userId = req.user.userId;
    const department = await this.departmentStatsService.getDepartmentByHead(userId);
    
    if (!department) {
      throw new NotFoundException('No se encontró el departamento para el jefe especificado');
    }
    
    const departmentId = department._id?.toString?.();
    if (!departmentId) {
      throw new BadRequestException('ID de departamento no válido');
    }
    
    const currentYear = new Date().getFullYear();
    const defaultSemester = `${currentYear}-1`; // Primer semestre del año actual
    const targetSemester = semester || department.currentSemester || defaultSemester;
    
    return this.departmentStatsService.getDepartmentStudentsWithNEE(departmentId, targetSemester);
  }

  @Get('teachers')
  @ApiOperation({ 
    summary: 'Docentes del departamento con estadísticas',
    description: 'Obtiene la lista de docentes del departamento con estadísticas detalladas de su trabajo con estudiantes con NEE, incluyendo cursos asignados, ajustes bajo su responsabilidad y porcentajes de implementación.'
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Semestre académico para generar estadísticas (formato YYYY-P). Si no se especifica, usa el semestre actual del departamento.',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[1-2]$'
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de docentes con estadísticas detalladas de NEE',
    type: DepartmentTeachersResponseDto,
    schema: {
      example: {
        department: {
          id: '507f1f77bcf86cd799439035',
          name: 'Departamento de Matemáticas'
        },
        semester: '2025-1',
        totalTeachers: 15,
        teachersWithNEEStudents: 12,
        teachers: [
          {
            teacherId: '507f1f77bcf86cd799439032',
            fullName: 'Dr. María Elena González Pérez',
            email: 'maria.gonzalez@ucn.cl',
            courses: [
              {
                courseNrc: 'MAT101-1',
                courseName: 'Matemáticas I',
                studentsTotal: 45,
                studentsWithNEE: 3
              },
              {
                courseNrc: 'MAT201-1',
                courseName: 'Cálculo Diferencial',
                studentsTotal: 38,
                studentsWithNEE: 2
              }
            ],
            neeStatistics: {
              totalStudentsWithNEE: 5,
              totalAdjustments: 12,
              adjustmentsRead: 10,
              adjustmentsPending: 2,
              readPercentage: 83.33,
              helpRequestsPending: 1
            },
            lastAdjustmentReview: '2025-06-18T16:45:00.000Z'
          },
          {
            teacherId: '507f1f77bcf86cd799439033',
            fullName: 'Prof. Carlos Alberto Ruiz Castro',
            email: 'carlos.ruiz@ucn.cl',
            courses: [
              {
                courseNrc: 'FIS201-1',
                courseName: 'Física General I',
                studentsTotal: 42,
                studentsWithNEE: 4
              }
            ],
            neeStatistics: {
              totalStudentsWithNEE: 4,
              totalAdjustments: 8,
              adjustmentsRead: 8,
              adjustmentsPending: 0,
              readPercentage: 100.0,
              helpRequestsPending: 0
            },
            lastAdjustmentReview: '2025-06-19T11:20:00.000Z'
          }
        ],
        summary: {
          totalAdjustments: 20,
          adjustmentsRead: 18,
          adjustmentsPending: 2,
          averageReadPercentage: 90.0,
          teachersNeedingAttention: 1
        },
        lastUpdated: '2025-06-19T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'ID de departamento no válido',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID de departamento no válido',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Departamento no encontrado para el jefe autenticado',
    schema: {
      example: {
        statusCode: 404,
        message: 'No se encontró el departamento para el jefe especificado',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({ 
    status: 403, 
    description: 'Rol no autorizado - Solo jefes de departamento',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied - Not a department head',
        error: 'Forbidden'
      }
    }
  })
  async getDepartmentTeachers(
    @Request() req: { user: { userId: string } },
    @Query('semester') semester?: string,
  ): Promise<DepartmentTeachersResponseDto> {
    const userId = req.user.userId;
    const department = await this.departmentStatsService.getDepartmentByHead(userId);
    
    if (!department) {
      throw new NotFoundException('No se encontró el departamento para el jefe especificado');
    }
    
    const departmentId = department._id?.toString?.();
    if (!departmentId) {
      throw new BadRequestException('ID de departamento no válido');
    }
    
    const currentYear = new Date().getFullYear();
    const defaultSemester = `${currentYear}-1`; // Primer semestre del año actual
    const targetSemester = semester || department.currentSemester || defaultSemester;
    
    return this.departmentStatsService.getTeachersByDepartment(departmentId, targetSemester);
  }

  @Get('departments/:departmentId/statistics')
  @ApiOperation({ 
    summary: 'Estadísticas de departamento específico (Admin)',
    description: 'Obtiene estadísticas de un departamento específico por ID. Este endpoint está diseñado para uso administrativo y requiere permisos especiales para acceder a datos de departamentos que no están bajo la supervisión directa del usuario.'
  })
  @ApiParam({
    name: 'departmentId',
    description: 'ObjectId del departamento a consultar',
    example: '507f1f77bcf86cd799439035'
  })
  @ApiQuery({
    name: 'semester',
    required: true,
    description: 'Semestre académico para generar estadísticas (formato YYYY-P)',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[1-2]$'
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del departamento especificado',
    type: DepartmentStatsResponseDto,
    schema: {
      example: {
        department: {
          id: '507f1f77bcf86cd799439035',
          name: 'Departamento de Matemáticas',
          faculty: 'Facultad de Ciencias Exactas'
        },
        semester: '2025-1',
        totalStudents: 450,
        studentsWithNEE: 28,
        neePercentage: 6.22,
        totalTeachers: 15,
        teachersWithNEEStudents: 12,
        totalCourses: 42,
        coursesWithNEEStudents: 35,
        adjustmentStats: {
          total: 85,
          approved: 78,
          pending: 5,
          rejected: 2
        },
        lastUpdated: '2025-06-19T21:15:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Formato de semestre inválido o parámetros incorrectos',
    schema: {
      examples: {
        'semestre-invalido': {
          summary: 'Formato de semestre incorrecto',
          value: {
            statusCode: 400,
            message: 'El formato del semestre debe ser YYYY-S (ej: 2023-1)',
            error: 'Bad Request'
          }
        },
        'id-invalido': {
          summary: 'ObjectId de departamento inválido',
          value: {
            statusCode: 400,
            message: 'Invalid departmentId format',
            error: 'Bad Request'
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado - Requiere permisos administrativos especiales',
    schema: {
      example: {
        statusCode: 403,
        message: 'Acceso denegado',
        error: 'Forbidden'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Departamento no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Department not found',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  async getDepartmentStatsById(
    @Param('departmentId') departmentId: string,
    @Query('semester') semester: string,
  ): Promise<DepartmentStatsResponseDto> {
    // Validar que el semestre tenga el formato correcto (YYYY-S)
    if (semester && !/^\d{4}-[12]$/.test(semester)) {
      throw new BadRequestException('El formato del semestre debe ser YYYY-S (ej: 2023-1)');
    }
    
    const currentYear = new Date().getFullYear();
    const targetSemester = semester || `${currentYear}-1`;
    
    return this.departmentStatsService.getDepartmentStats(departmentId, targetSemester);
  }
}
