import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  HttpStatus,
  BadRequestException,
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
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { CareersService } from '../careers.service';
import { CareerHeadStatsDto, CareerHeadCareerDto } from '../dto/career-head.dto';
import { Career } from '../schemas/career.schema';
import { Types } from 'mongoose';

@ApiTags('career-heads')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('career-heads')
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
  description: 'Acceso denegado - Requiere rol de Jefe de Carrera',
  schema: {
    example: {
      statusCode: 403,
      message: 'Forbidden resource',
      error: 'Forbidden'
    }
  }
})
export class CareerHeadsController {
  constructor(private readonly careersService: CareersService) {}

  @Get('my-career')
  @Roles(UserRole.JEFE_CARRERA)
  @ApiOperation({
    summary: 'Obtener carrera asignada',
    description: 'Obtiene la información completa de la carrera asignada al jefe de carrera autenticado, incluyendo estadísticas generales y datos de configuración.',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de la carrera asignada con estadísticas básicas',
    type: CareerHeadStatsDto,
    schema: {
      example: {
        career: {
          id: '507f1f77bcf86cd799439042',
          name: 'Ingeniería Civil en Computación e Informática',
          description: 'Carrera orientada a la formación de profesionales en computación e informática',
          department: {
            id: '507f1f77bcf86cd799439035',
            name: 'Departamento de Ingeniería de Sistemas'
          },
          head: {
            id: '507f1f77bcf86cd799439043',
            name: 'Dr. Roberto Silva Mendoza',
            email: 'roberto.silva@ucn.cl'
          },
          currentSemester: '2025-1',
          totalSemesters: 10,
          isActive: true
        },
        currentSemesterStats: {
          totalStudents: 320,
          studentsWithNEE: 18,
          neePercentage: 5.625,
          activeAdjustments: 42,
          coursesWithNEE: 28
        },
        lastUpdated: '2025-06-19T21:30:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró carrera asignada al jefe autenticado',
    schema: {
      example: {
        statusCode: 404,
        message: 'No se encontró ninguna carrera asociada a este jefe',
        error: 'Not Found'
      }
    }
  })
  async getMyCareer(@Request() req: { user: { userId: string } }): Promise<CareerHeadStatsDto> {
    const { userId } = req.user;
    const careers = await this.careersService.findByHead(userId);
    
    if (!careers || careers.length === 0) {
      throw new NotFoundException('No se encontró ninguna carrera asociada a este jefe');
    }
    
    // Convertir a objeto plano y asegurar el tipo
    const career = typeof (careers[0] as any).toObject === 'function' ? (careers[0] as any).toObject() : careers[0];
    const careerId = career._id.toString();
    
    if (!careerId) {
      throw new NotFoundException('ID de carrera no válido');
    }
    
    // Obtener estadísticas con el semestre actual
    return this.careersService.getCareerHeadStatistics(careerId);
  }

  @Get('statistics')
  @Roles(UserRole.JEFE_CARRERA)
  @ApiOperation({
    summary: 'Estadísticas detalladas de la carrera',
    description: 'Proporciona estadísticas exhaustivas sobre la carrera del jefe autenticado, incluyendo distribución de estudiantes con NEE, estado de ajustes razonables, rendimiento por semestre académico y métricas de implementación.',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Semestre académico específico para generar estadísticas (formato YYYY-P). Si no se especifica, se usan los datos del semestre actual de la carrera.',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[1-2]$'
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estadísticas completas de la carrera con desglose detallado',
    type: CareerHeadStatsDto,
    schema: {
      example: {
        career: {
          id: '507f1f77bcf86cd799439042',
          name: 'Ingeniería Civil en Computación e Informática',
          department: {
            id: '507f1f77bcf86cd799439035',
            name: 'Departamento de Ingeniería de Sistemas'
          }
        },
        semester: '2025-1',
        totalStudents: 320,
        studentsWithNEE: 18,
        neePercentage: 5.625,
        studentsByLevel: {
          '1-2': 8,
          '3-4': 5,
          '5-6': 3,
          '7-8': 2,
          '9-10': 0
        },
        adjustmentStats: {
          total: 42,
          approved: 38,
          pending: 3,
          rejected: 1,
          implemented: 35,
          byType: {
            'tiempo_adicional': 18,
            'evaluacion_oral': 12,
            'material_adaptado': 8,
            'ubicacion_preferencial': 4
          },
          byStatus: {
            'pendiente': 3,
            'aprobado': 38,
            'rechazado': 1,
            'implementado': 35,
            'vencido': 0
          }
        },
        coursesStats: {
          totalCourses: 45,
          coursesWithNEE: 28,
          averageNEEPerCourse: 1.5,
          coursesNeedingAttention: 5
        },
        teacherStats: {
          totalTeachers: 22,
          teachersWithNEEStudents: 18,
          averageReadPercentage: 87.5,
          teachersNeedingSupport: 3
        },
        needsDistribution: [
          { type: 'Discapacidad visual', count: 5 },
          { type: 'Trastorno de atención', count: 8 },
          { type: 'Discapacidad auditiva', count: 3 },
          { type: 'Discapacidad motora', count: 2 }
        ],
        semesterComparison: {
          previousSemester: '2024-2',
          growthRate: 12.5,
          newStudentsWithNEE: 2,
          graduatedStudentsWithNEE: 0
        },
        lastUpdated: '2025-06-19T21:45:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de solicitud inválidos o formato de semestre incorrecto',
    schema: {
      examples: {
        'carrera-no-encontrada': {
          summary: 'Carrera no asignada al jefe',
          value: {
            statusCode: 400,
            message: 'No se encontró ninguna carrera asignada a este jefe',
            error: 'Bad Request'
          }
        },
        'id-invalido': {
          summary: 'ID de carrera no válido',
          value: {
            statusCode: 400,
            message: 'ID de carrera no válido',
            error: 'Bad Request'
          }
        },
        'semestre-invalido': {
          summary: 'Formato de semestre incorrecto',
          value: {
            statusCode: 400,
            message: 'El formato del semestre debe ser YYYY-P donde P es 1 o 2',
            error: 'Bad Request'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró información para los criterios de búsqueda especificados',
    schema: {
      example: {
        statusCode: 404,
        message: 'No se encontraron datos para el semestre especificado',
        error: 'Not Found'
      }
    }
  })
  async getStatistics(
    @Request() req: { user: { userId: string } },
    @Query('semester') semester?: string,
  ): Promise<CareerHeadStatsDto> {
    const { userId } = req.user;
    const careers = await this.careersService.findByHead(userId);
    
    if (!careers || careers.length === 0) {
      throw new BadRequestException('No se encontró ninguna carrera asignada a este jefe');
    }

    // Por simplicidad, tomamos la primera carrera (podría extenderse para manejar múltiples carreras)
    // Convertir a objeto plano y asegurar el tipo
    const career = typeof (careers[0] as any).toObject === 'function' ? (careers[0] as any).toObject() : careers[0];
    const careerId = career._id?.toString();
    
    if (!careerId) {
      throw new BadRequestException('ID de carrera no válido');
    }
    
    return this.careersService.getCareerHeadStatistics(careerId, semester);
  }

  @Get('students')
  @Roles(UserRole.JEFE_CARRERA)
  @ApiOperation({
    summary: 'Estudiantes de la carrera',
    description: 'Obtiene un listado detallado y paginado de los estudiantes matriculados en la carrera que dirige el jefe autenticado, con información académica, estado de NEE y opciones de filtrado por semestre.',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre académico específico (formato YYYY-P). Si no se especifica, se muestran estudiantes del semestre actual.',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[1-2]$'
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de estudiantes con información detallada',
    schema: {
      type: 'object',
      properties: {
        data: { 
          type: 'array', 
          items: { 
            type: 'object',
            properties: {
              studentId: { type: 'string', example: '507f1f77bcf86cd799439044' },
              rut: { type: 'string', example: '98765432-1' },
              fullName: { type: 'string', example: 'Luis Alberto Martínez Torres' },
              email: { type: 'string', example: 'luis.martinez@alumnos.ucn.cl' },
              currentSemester: { type: 'number', example: 6 },
              academicStatus: { type: 'string', example: 'Regular' },
              hasNEE: { type: 'boolean', example: true },
              needsTypes: { 
                type: 'array', 
                items: { type: 'string' },
                example: ['Discapacidad visual', 'Trastorno de atención']
              },
              activeAdjustments: { type: 'number', example: 3 },
              enrolledCourses: { type: 'number', example: 6 },
              lastActivity: { type: 'string', format: 'date-time', example: '2025-06-19T16:30:00.000Z' }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 320 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 50 },
            totalPages: { type: 'number', example: 7 }
          }
        },
        filters: {
          type: 'object',
          properties: {
            semester: { type: 'string', example: '2025-1' },
            hasNEE: { type: 'boolean', example: null },
            academicStatus: { type: 'string', example: null }
          }
        },
        summary: {
          type: 'object',
          properties: {
            totalStudents: { type: 'number', example: 320 },
            studentsWithNEE: { type: 'number', example: 18 },
            activeStudents: { type: 'number', example: 315 },
            studentsOnLeave: { type: 'number', example: 5 }
          }
        }
      },
      example: {
        data: [
          {
            studentId: '507f1f77bcf86cd799439044',
            rut: '98765432-1',
            fullName: 'Luis Alberto Martínez Torres',
            email: 'luis.martinez@alumnos.ucn.cl',
            currentSemester: 6,
            academicStatus: 'Regular',
            hasNEE: true,
            needsTypes: ['Discapacidad visual', 'Trastorno de atención'],
            activeAdjustments: 3,
            enrolledCourses: 6,
            lastActivity: '2025-06-19T16:30:00.000Z'
          }
        ],
        pagination: {
          total: 320,
          page: 1,
          limit: 50,
          totalPages: 7
        },
        summary: {
          totalStudents: 320,
          studentsWithNEE: 18,
          activeStudents: 315,
          studentsOnLeave: 5
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de solicitud inválidos',
    schema: {
      examples: {
        'carrera-no-encontrada': {
          summary: 'Carrera no asignada',
          value: {
            statusCode: 400,
            message: 'No se encontró ninguna carrera asignada a este jefe',
            error: 'Bad Request'
          }
        },
        'id-invalido': {
          summary: 'ID de carrera inválido',
          value: {
            statusCode: 400,
            message: 'ID de carrera no válido',
            error: 'Bad Request'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la carrera asignada al jefe',
    schema: {
      example: {
        statusCode: 404,
        message: 'Career not found for the authenticated head',
        error: 'Not Found'
      }
    }
  })
  async getStudents(
    @Request() req: { user: { userId: string } },
    @Query('semester') semester?: string,
  ) {
    const { userId } = req.user;
    const careers = await this.careersService.findByHead(userId);
    
    if (!careers || careers.length === 0) {
      throw new BadRequestException('No se encontró ninguna carrera asignada a este jefe');
    }

    // Por simplicidad, tomamos la primera carrera (podría extenderse para manejar múltiples carreras)
    // Convertir a objeto plano y asegurar el tipo
    const career = typeof (careers[0] as any).toObject === 'function' ? (careers[0] as any).toObject() : careers[0];
    const careerId = career._id?.toString();
    
    if (!careerId) {
      throw new BadRequestException('ID de carrera no válido');
    }
    
    return this.careersService.getStudents(careerId, semester);
  }

  @Get('adjustments')
  @Roles(UserRole.JEFE_CARRERA)
  @ApiOperation({
    summary: 'Ajustes razonables de la carrera',
    description: 'Obtiene un listado completo y detallado de los ajustes razonables de los estudiantes de la carrera, con capacidades avanzadas de filtrado por estado, tipo, semestre y opciones de búsqueda. Incluye estadísticas agregadas y métricas de implementación.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar ajustes por estado específico',
    enum: ['pendiente', 'aprobado', 'rechazado', 'implementado', 'vencido'],
    example: 'aprobado',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre académico (formato YYYY-P)',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[1-2]$'
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista detallada de ajustes razonables con estadísticas y métricas',
    schema: {
      type: 'object',
      properties: {
        data: { 
          type: 'array', 
          items: { 
            type: 'object',
            properties: {
              adjustmentId: { type: 'string', example: '507f1f77bcf86cd799439045' },
              studentRut: { type: 'string', example: '98765432-1' },
              studentName: { type: 'string', example: 'Luis Alberto Martínez Torres' },
              adjustmentType: { type: 'string', example: 'tiempo_adicional' },
              description: { type: 'string', example: '50% tiempo adicional en evaluaciones' },
              status: { type: 'string', example: 'aprobado' },
              priority: { type: 'string', example: 'alta' },
              semester: { type: 'string', example: '2025-1' },
              affectedCourses: { 
                type: 'array', 
                items: { type: 'string' },
                example: ['ICI101-1', 'MAT101-1']
              },
              createdDate: { type: 'string', format: 'date-time', example: '2025-02-15T14:30:00.000Z' },
              approvedDate: { type: 'string', format: 'date-time', example: '2025-02-18T10:15:00.000Z' },
              implementationProgress: { type: 'number', example: 85.5 },
              teachersNotified: { type: 'number', example: 2 },
              teachersConfirmed: { type: 'number', example: 2 }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 42 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            totalPages: { type: 'number', example: 3 }
          }
        },
        stats: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 42 },
            byStatus: {
              type: 'object',
              additionalProperties: { type: 'number' },
              example: { pendiente: 3, aprobado: 35, implementado: 32, rechazado: 1, vencido: 1 }
            },
            byType: {
              type: 'object',
              additionalProperties: { type: 'number' },
              example: { 'tiempo_adicional': 18, 'evaluacion_oral': 12, 'material_adaptado': 8, 'ubicacion_preferencial': 4 }
            },
            byPriority: {
              type: 'object',
              additionalProperties: { type: 'number' },
              example: { alta: 8, media: 25, baja: 9 }
            },
            implementationRate: { type: 'number', example: 88.2 },
            averageApprovalTime: { type: 'number', example: 2.5 },
            teacherComplianceRate: { type: 'number', example: 92.1 }
          }
        },
        trends: {
          type: 'object',
          properties: {
            monthlyCreated: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  month: { type: 'string', example: '2025-06' },
                  count: { type: 'number', example: 8 }
                }
              }
            },
            semesterComparison: {
              type: 'object',
              properties: {
                current: { type: 'number', example: 42 },
                previous: { type: 'number', example: 38 },
                growthRate: { type: 'number', example: 10.5 }
              }
            }
          }
        }
      },
      example: {
        data: [
          {
            adjustmentId: '507f1f77bcf86cd799439045',
            studentRut: '98765432-1',
            studentName: 'Luis Alberto Martínez Torres',
            adjustmentType: 'tiempo_adicional',
            description: '50% tiempo adicional en evaluaciones',
            status: 'aprobado',
            priority: 'alta',
            semester: '2025-1',
            affectedCourses: ['ICI101-1', 'MAT101-1'],
            createdDate: '2025-02-15T14:30:00.000Z',
            approvedDate: '2025-02-18T10:15:00.000Z',
            implementationProgress: 85.5,
            teachersNotified: 2,
            teachersConfirmed: 2
          }
        ],
        stats: {
          total: 42,
          byStatus: { aprobado: 35, pendiente: 3, implementado: 32, rechazado: 1 },
          byType: { 'tiempo_adicional': 18, 'evaluacion_oral': 12, 'material_adaptado': 8 },
          implementationRate: 88.2
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de solicitud inválidos o formato de semestre incorrecto',
    schema: {
      examples: {
        'carrera-no-encontrada': {
          summary: 'Carrera no asignada',
          value: {
            statusCode: 400,
            message: 'No se encontró ninguna carrera asignada a este jefe',
            error: 'Bad Request'
          }
        },
        'estado-invalido': {
          summary: 'Estado de ajuste inválido',
          value: {
            statusCode: 400,
            message: 'Estado de ajuste no válido. Opciones: pendiente, aprobado, rechazado, implementado, vencido',
            error: 'Bad Request'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la carrera asignada al jefe',
    schema: {
      example: {
        statusCode: 404,
        message: 'Career not found for the authenticated head',
        error: 'Not Found'
      }
    }
  })
  async getAdjustments(
    @Request() req: { user: { userId: string } },
    @Query('status') status?: string,
    @Query('semester') semester?: string,
  ) {
    const { userId } = req.user;
    const careers = await this.careersService.findByHead(userId);
    
    if (!careers || careers.length === 0) {
      throw new BadRequestException('No se encontró ninguna carrera asignada a este jefe');
    }

    // Por simplicidad, tomamos la primera carrera (podría extenderse para manejar múltiples carreras)
    // Convertir a objeto plano y asegurar el tipo
    const career = typeof (careers[0] as any).toObject === 'function' ? (careers[0] as any).toObject() : careers[0];
    const careerId = career._id?.toString();
    
    if (!careerId) {
      throw new BadRequestException('ID de carrera no válido');
    }
    
    return this.careersService.getCareerAdjustments(careerId, status, semester);
  }
}
