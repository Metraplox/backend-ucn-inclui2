import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  Body, 
  UseGuards, 
  BadRequestException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SemesterSchedulerService } from './semester-scheduler.service';
import { SyncService } from '../sync/sync.service';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('semester-sync')
@Controller('semester-sync')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SemesterSyncController {
  
  constructor(
    private readonly semesterSchedulerService: SemesterSchedulerService,
    private readonly syncService: SyncService,
  ) {}

  @Post('full-sync/:semester')
  @Roles(UserRole.DIDDEC_STAFF, UserRole.COORDINADOR)
  @ApiOperation({ 
    summary: 'Sincronización completa de un semestre',
    description: 'Ejecuta sincronización completa de estudiantes NEE, cursos e inscripciones para el semestre especificado'
  })
  @ApiParam({
    name: 'semester',
    description: 'Semestre académico en formato YYYY-P',
    example: '2025-1'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sincronización completada exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        semester: { type: 'string' },
        duration: { type: 'string' },
        results: { type: 'object' },
        timestamp: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Formato de semestre inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos para ejecutar sincronización' })
  @ApiResponse({ status: 500, description: 'Error interno durante la sincronización' })
  async fullSemesterSync(@Param('semester') semester: string) {
    const startTime = Date.now();
    
    try {
      // 1. Validar formato semestre
      if (!semester.match(/^\d{4}-[1-2]$/)) {
        throw new BadRequestException('Formato de semestre inválido (debe ser YYYY-P)');
      }
      
      // 2. Ejecutar sincronización completa
      const results = await this.semesterSchedulerService.forceSemesterSync(semester);
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        semester,
        duration: `${duration}ms`,
        results: {
          students: results.students,
          courses: results.courses,
          enrollments: results.enrollments || { count: 0, message: 'Pendiente de implementar' }
        },
        timestamp: new Date().toISOString(),
        type: 'MANUAL_FULL_SYNC'
      };
      
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error en sincronización: ${error.message}`);
    }
  }

  @Get('sync-status/:semester')
  @Roles(UserRole.DIDDEC_STAFF, UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({ 
    summary: 'Obtener estado de sincronización de un semestre',
    description: 'Muestra estadísticas y estado actual de los datos sincronizados para el semestre especificado'
  })
  @ApiParam({
    name: 'semester',
    description: 'Semestre académico en formato YYYY-P',
    example: '2025-1'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de sincronización obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        semester: { type: 'string' },
        overview: {
          type: 'object',
          properties: {
            totalStudentsNEE: { type: 'number' },
            totalCourses: { type: 'number' },
            totalEnrollments: { type: 'number' },
            lastSyncDate: { type: 'string' },
            syncHealth: { type: 'string', enum: ['EXCELLENT', 'GOOD', 'WARNING', 'CRITICAL'] }
          }
        },
        recentLogs: { type: 'array' }
      }
    }
  })
  async getSyncStatus(@Param('semester') semester: string) {
    try {
      if (!semester.match(/^\d{4}-[1-2]$/)) {
        throw new BadRequestException('Formato de semestre inválido');
      }

      // Obtener estadísticas del semestre
      const [studentsCount, coursesCount, recentLogs] = await Promise.all([
        this.getStudentsCount(semester),
        this.getCoursesCount(semester),
        this.getRecentSyncLogs(semester, 10)
      ]);

      const lastSyncDate = recentLogs.length > 0 ? recentLogs[0].createdAt : null;
      const syncHealth = this.calculateSyncHealth(recentLogs);

      return {
        semester,
        overview: {
          totalStudentsNEE: studentsCount,
          totalCourses: coursesCount,
          totalEnrollments: 0, // Implementar cuando esté el modelo de inscripciones
          lastSyncDate,
          syncHealth
        },
        recentLogs: recentLogs.slice(0, 5), // Mostrar solo los 5 más recientes
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error obteniendo estado de sincronización: ${error.message}`);
    }
  }

  @Post('sync-students/:semester')
  @Roles(UserRole.DIDDEC_STAFF, UserRole.COORDINADOR)
  @ApiOperation({ 
    summary: 'Sincronizar solo estudiantes NEE',
    description: 'Ejecuta sincronización únicamente de estudiantes NEE para el semestre especificado'
  })
  async syncStudentsOnly(@Param('semester') semester: string) {
    try {
      if (!semester.match(/^\d{4}-[1-2]$/)) {
        throw new BadRequestException('Formato de semestre inválido');
      }

      const startTime = Date.now();
      const result = await this.syncService.syncAndPersistNeeStudents(semester);
      const duration = Date.now() - startTime;

      return {
        success: true,
        semester,
        studentsCount: result.count,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        type: 'STUDENTS_ONLY_SYNC'
      };

    } catch (error) {
      throw new InternalServerErrorException(`Error sincronizando estudiantes: ${error.message}`);
    }
  }

  @Post('sync-courses/:semester')
  @Roles(UserRole.DIDDEC_STAFF, UserRole.COORDINADOR)
  @ApiOperation({ 
    summary: 'Sincronizar solo cursos',
    description: 'Ejecuta sincronización únicamente de cursos para el semestre especificado'
  })
  async syncCoursesOnly(@Param('semester') semester: string) {
    try {
      if (!semester.match(/^\d{4}-[1-2]$/)) {
        throw new BadRequestException('Formato de semestre inválido');
      }

      const startTime = Date.now();
      const result = await this.syncService.syncAndPersistCourses(semester);
      const duration = Date.now() - startTime;

      return {
        success: true,
        semester,
        coursesCount: result.count,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        type: 'COURSES_ONLY_SYNC'
      };

    } catch (error) {
      throw new InternalServerErrorException(`Error sincronizando cursos: ${error.message}`);
    }
  }

  @Get('pre-check/:semester')
  @Roles(UserRole.DIDDEC_STAFF, UserRole.COORDINADOR)
  @ApiOperation({ 
    summary: 'Pre-validación antes de sincronización',
    description: 'Verifica que se cumplan todos los prerequisitos para ejecutar una sincronización'
  })
  async preCheckSynchronization(@Param('semester') semester: string) {
    try {
      if (!semester.match(/^\d{4}-[1-2]$/)) {
        throw new BadRequestException('Formato de semestre inválido');
      }

      // Verificar prerequisitos
      const checks = await this.performPreChecks(semester);
      
      const canProceed = checks.every(check => check.passed);

      return {
        semester,
        canProceed,
        checks,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      throw new InternalServerErrorException(`Error en pre-validación: ${error.message}`);
    }
  }

  @Get('current-semester')
  @ApiOperation({ 
    summary: 'Obtener semestre académico actual',
    description: 'Calcula y retorna el semestre académico actual basado en la fecha'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Semestre actual calculado exitosamente',
    schema: {
      type: 'object',
      properties: {
        currentSemester: { type: 'string' },
        nextSemester: { type: 'string' },
        calculatedAt: { type: 'string' }
      }
    }
  })
  getCurrentSemester() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    let currentSemester: string;
    let nextSemester: string;
    
    if (month >= 3 && month <= 7) {
      currentSemester = `${year}-1`;
      nextSemester = `${year}-2`;
    } else if (month >= 8 && month <= 12) {
      currentSemester = `${year}-2`;
      nextSemester = `${year + 1}-1`;
    } else {
      currentSemester = `${year - 1}-2`;
      nextSemester = `${year}-1`;
    }

    return {
      currentSemester,
      nextSemester,
      calculatedAt: new Date().toISOString()
    };
  }

  // Métodos auxiliares privados

  private async getStudentsCount(semester: string): Promise<number> {
    try {
      return await this.syncService['studentModel'].countDocuments({ semester }).exec();
    } catch (error) {
      return 0;
    }
  }

  private async getCoursesCount(semester: string): Promise<number> {
    try {
      return await this.syncService['courseModel'].countDocuments({ semester }).exec();
    } catch (error) {
      return 0;
    }
  }

  private async getRecentSyncLogs(semester: string, limit: number = 10): Promise<any[]> {
    try {
      return await this.syncService['syncLogModel']
        .find({ semester })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      return [];
    }
  }

  private calculateSyncHealth(logs: any[]): 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL' {
    if (logs.length === 0) return 'WARNING';
    
    const recentLogs = logs.slice(0, 5);
    const successCount = recentLogs.filter(log => log.status === 'SUCCESS').length;
    const successRate = successCount / recentLogs.length;
    
    if (successRate >= 0.9) return 'EXCELLENT';
    if (successRate >= 0.7) return 'GOOD';
    if (successRate >= 0.5) return 'WARNING';
    return 'CRITICAL';
  }

  private async performPreChecks(semester: string): Promise<Array<{
    name: string;
    description: string;
    passed: boolean;
    details?: string;
  }>> {
    const checks = [];

    try {
      // Check 1: Verificar formato de semestre
      checks.push({
        name: 'SEMESTER_FORMAT',
        description: 'Formato de semestre válido',
        passed: /^\d{4}-[1-2]$/.test(semester)
      });

      // Check 2: Verificar conectividad a base de datos
      try {
        await this.syncService['studentModel'].findOne().exec();
        checks.push({
          name: 'DATABASE_CONNECTION',
          description: 'Conexión a base de datos',
          passed: true
        });
      } catch (error) {
        checks.push({
          name: 'DATABASE_CONNECTION',
          description: 'Conexión a base de datos',
          passed: false,
          details: error.message
        });
      }

      // Check 3: Verificar existencia de archivos NEE
      checks.push({
        name: 'NEE_FILES',
        description: 'Archivos de estudiantes NEE disponibles',
        passed: true, // Implementar verificación real
        details: 'Verificación pendiente de implementar'
      });

      // Check 4: Verificar espacio en disco (mock)
      checks.push({
        name: 'DISK_SPACE',
        description: 'Espacio suficiente en disco',
        passed: true,
        details: 'Verificación simulada'
      });

      return checks;

    } catch (error) {
      return [{
        name: 'PRE_CHECK_ERROR',
        description: 'Error durante pre-validación',
        passed: false,
        details: error.message
      }];
    }
  }
} 