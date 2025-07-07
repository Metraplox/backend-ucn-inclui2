import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DiddecService } from './diddec.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('diddec')
@Controller('diddec')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DiddecController {
  constructor(private readonly diddecService: DiddecService) {}

  @Get('statistics')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({
    summary: 'Estadísticas generales del sistema',
    description:
      'Obtiene estadísticas comprensivas del sistema INCLUI2 para un semestre específico, incluyendo datos de estudiantes, ajustes, docentes y rendimiento general.',
  })
  @ApiQuery({
    name: 'semester',
    required: true,
    type: String,
    description: 'Semestre académico en formato YYYY-P',
    example: '2025-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas generales completas del sistema',
    example: {
      semester: '2025-1',
      summary: {
        totalStudentsNEE: 145,
        activeAdjustments: 324,
        completedAdjustments: 289,
        pendingAdjustments: 35,
        totalTeachers: 67,
        teachersWithNEEStudents: 52,
      },
      studentStats: {
        byDisabilityType: {
          'Trastorno específico del aprendizaje': 78,
          'Déficit atencional': 45,
          'Discapacidad visual': 12,
          'Discapacidad auditiva': 8,
          'Otra condición': 2,
        },
        byDepartment: {
          Ingeniería: 89,
          Ciencias: 34,
          Humanidades: 22,
        },
      },
      adjustmentStats: {
        mostUsedTypes: {
          'Tiempo adicional': 234,
          'Evaluación oral': 156,
          'Material adaptado': 98,
          'Ubicación preferencial': 87,
        },
        complianceRate: 89.2,
        averageImplementationTime: 3.2,
      },
      trends: {
        semesterGrowth: 12.5,
        adjustmentEffectiveness: 91.8,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos de coordinador o staff DIDDEC',
  })
  async getStatistics(@Query('semester') semester: string) {
    return this.diddecService.getGeneralStatistics(semester);
  }

  @Get('reports/semester/:semester')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({
    summary: 'Informe detallado por semestre',
    description:
      'Genera un informe comprensivo y detallado de todas las actividades INCLUI2 durante un semestre específico, incluyendo análisis comparativo.',
  })
  @ApiParam({
    name: 'semester',
    required: true,
    description: 'Semestre académico en formato YYYY-P',
    example: '2025-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Informe detallado y comprensivo del semestre',
    example: {
      semester: '2025-1',
      reportDate: '2025-01-15T14:30:00.000Z',
      executiveSummary: {
        totalStudentsNEE: 145,
        newStudentsThisSemester: 18,
        activeAdjustments: 324,
        successRate: 89.2,
        teacherParticipation: 77.6,
      },
      detailedAnalysis: {
        departmentPerformance: [
          {
            department: 'Ingeniería',
            studentsNEE: 89,
            adjustmentsImplemented: 198,
            successRate: 91.5,
            teacherTraining: 85.0,
          },
        ],
        disabilityTypeAnalysis: [
          {
            type: 'Trastorno específico del aprendizaje',
            count: 78,
            mostEffectiveAdjustments: ['Tiempo adicional', 'Material adaptado'],
            averageGrade: 5.8,
          },
        ],
        challenges: [
          'Necesidad de más capacitación docente en discapacidad visual',
          'Implementación tardía de ajustes en algunas facultades',
        ],
        recommendations: [
          'Intensificar talleres de sensibilización',
          'Mejorar comunicación entre coordinadores y docentes',
        ],
      },
      comparison: {
        previousSemester: {
          growth: '+12.5%',
          improvementAreas: [
            'Tiempo de implementación',
            'Satisfacción estudiantil',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Semestre no encontrado o sin datos',
  })
  async getSemesterReport(@Param('semester') semester: string) {
    return this.diddecService.getSemesterReport(semester);
  }

  @Get('students/all')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({
    summary: 'Todos los estudiantes con NEE',
    description:
      'Lista completa de estudiantes con Necesidades Educativas Especiales registrados en el sistema para un semestre específico, incluyendo su información académica y ajustes.',
  })
  @ApiQuery({
    name: 'semester',
    required: true,
    type: String,
    description: 'Semestre académico en formato YYYY-P',
    example: '2025-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de estudiantes NEE con información detallada',
    example: [
      {
        _id: '507f1f77bcf86cd799439012',
        rut: '20.123.456-7',
        firstName: 'Ana María',
        lastName: 'García González',
        email: 'ana.garcia@alumnos.ucn.cl',
        career: 'Ingeniería Civil Industrial',
        department: 'Ingeniería',
        semester: '2025-1',
        disabilityType: 'Trastorno específico del aprendizaje',
        disabilityDescription: 'Dislexia diagnosticada',
        registrationDate: '2024-03-15T10:00:00.000Z',
        currentAdjustments: [
          {
            type: 'Tiempo adicional',
            description: '50% tiempo adicional en evaluaciones',
            courses: ['Cálculo I', 'Física I'],
          },
        ],
        academicStatus: {
          enrolled: true,
          currentCourses: 6,
          averageGrade: 5.8,
        },
        supportServices: ['Tutorías especializadas', 'Apoyo psicopedagógico'],
      },
      {
        _id: '507f1f77bcf86cd799439020',
        rut: '19.987.654-3',
        firstName: 'Carlos Eduardo',
        lastName: 'López Fernández',
        email: 'carlos.lopez@alumnos.ucn.cl',
        career: 'Medicina',
        department: 'Ciencias de la Salud',
        semester: '2025-1',
        disabilityType: 'Déficit atencional',
        disabilityDescription: 'TDAH diagnosticado',
        currentAdjustments: [
          {
            type: 'Ubicación preferencial',
            description: 'Asiento en primera fila',
            courses: ['Anatomía', 'Fisiología'],
          },
        ],
        academicStatus: {
          enrolled: true,
          currentCourses: 7,
          averageGrade: 6.1,
        },
      },
    ],
  })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos de coordinador o staff DIDDEC',
  })
  async getAllStudentsWithNEE(@Query('semester') semester: string) {
    return this.diddecService.getAllStudentsWithNEE(semester);
  }

  @Get('adjustments/trends')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({
    summary: 'Tendencias de ajustes en el tiempo',
    description:
      'Analiza las tendencias de implementación y uso de ajustes razonables a lo largo de múltiples semestres, identificando patrones y evolución del sistema.',
  })
  @ApiQuery({
    name: 'years',
    required: false,
    type: Number,
    description: 'Número de años hacia atrás a analizar (por defecto: 3 años)',
    example: 3,
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis de tendencias temporales de ajustes razonables',
    example: {
      analysisRange: {
        fromSemester: '2022-1',
        toSemester: '2025-1',
        totalSemesters: 6,
      },
      overallTrends: {
        studentGrowth: {
          trend: 'increasing',
          averageGrowthPerSemester: 8.5,
          totalGrowth: 51.2,
        },
        adjustmentUsage: {
          trend: 'increasing',
          averageGrowthPerSemester: 12.3,
          mostGrowingType: 'Evaluación oral',
        },
      },
      semesterData: [
        {
          semester: '2022-1',
          studentsNEE: 98,
          totalAdjustments: 187,
          topAdjustments: ['Tiempo adicional', 'Material adaptado'],
        },
        {
          semester: '2025-1',
          studentsNEE: 145,
          totalAdjustments: 324,
          topAdjustments: [
            'Tiempo adicional',
            'Evaluación oral',
            'Material adaptado',
          ],
        },
      ],
      adjustmentTypeEvolution: {
        'Tiempo adicional': {
          '2022-1': 89,
          '2025-1': 234,
          growth: 162.9,
        },
        'Evaluación oral': {
          '2022-1': 34,
          '2025-1': 156,
          growth: 358.8,
        },
      },
      predictions: {
        nextSemesterEstimate: {
          studentsNEE: 157,
          totalAdjustments: 361,
        },
      },
    },
  })
  async getAdjustmentTrends(@Query('years') years: number = 3) {
    return this.diddecService.getAdjustmentTrends(years);
  }

  @Get('adjustments/compliance')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({
    summary: 'Cumplimiento de ajustes por departamento',
    description:
      'Analiza las tasas de cumplimiento e implementación de ajustes razonables por departamento académico, identificando fortalezas y áreas de mejora.',
  })
  @ApiQuery({
    name: 'semester',
    required: true,
    type: String,
    description: 'Semestre académico en formato YYYY-P',
    example: '2025-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis detallado de cumplimiento por departamento',
    example: {
      semester: '2025-1',
      overallCompliance: 89.2,
      lastUpdated: '2025-01-15T14:30:00.000Z',
      departmentAnalysis: [
        {
          department: 'Ingeniería',
          metrics: {
            studentsNEE: 89,
            totalAdjustments: 198,
            implementedAdjustments: 182,
            complianceRate: 91.9,
            averageImplementationTime: 2.8,
            onTimeImplementation: 94.5,
          },
          performanceIndicators: {
            teacherResponseRate: 88.7,
            studentSatisfaction: 91.2,
            adjustmentEffectiveness: 89.5,
          },
          commonAdjustments: [
            {
              type: 'Tiempo adicional',
              count: 89,
              successRate: 94.3,
            },
            {
              type: 'Material adaptado',
              count: 67,
              successRate: 87.8,
            },
          ],
          challenges: [
            'Coordinación con laboratorios',
            'Evaluaciones prácticas',
          ],
          strengths: [
            'Respuesta rápida de docentes',
            'Buena infraestructura tecnológica',
          ],
        },
        {
          department: 'Ciencias',
          metrics: {
            studentsNEE: 34,
            totalAdjustments: 78,
            implementedAdjustments: 69,
            complianceRate: 88.5,
            averageImplementationTime: 3.1,
            onTimeImplementation: 85.9,
          },
          performanceIndicators: {
            teacherResponseRate: 82.4,
            studentSatisfaction: 87.9,
            adjustmentEffectiveness: 91.2,
          },
          challenges: ['Evaluaciones de laboratorio', 'Material especializado'],
          strengths: ['Personal capacitado', 'Flexibilidad académica'],
        },
      ],
      benchmarking: {
        bestPerforming: 'Ingeniería',
        needsImprovement: 'Humanidades',
        nationalAverage: 85.3,
        institutionalRanking: 'Por encima del promedio',
      },
      recommendations: [
        'Implementar programa de mentorías entre departamentos',
        'Reforzar capacitación en departamentos con menor cumplimiento',
        'Estandarizar protocolos de implementación',
      ],
    },
  })
  async getAdjustmentComplianceByDepartment(
    @Query('semester') semester: string,
  ) {
    return this.diddecService.getAdjustmentComplianceByDepartment(semester);
  }
}
