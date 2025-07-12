import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums';
import { HawaiiCacheService } from './hawaii-cache.service';

@ApiTags('hawaii-cache')
@Controller('admin/hawaii-cache')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HawaiiCacheController {
  private readonly logger = new Logger(HawaiiCacheController.name);

  constructor(private readonly hawaiiCacheService: HawaiiCacheService) {}

  @Get('stats')
  @Roles(UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Obtener estadísticas del caché Hawaii',
    description:
      'Muestra información detallada sobre el estado y uso del caché',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del caché obtenidas exitosamente',
    schema: {
      properties: {
        memoryCacheSize: {
          type: 'number',
          description: 'Número de elementos en caché memoria',
        },
        diskCacheFiles: {
          type: 'number',
          description: 'Archivos de caché en disco',
        },
        totalDiskSize: { type: 'number', description: 'Tamaño total en bytes' },
        oldestFile: {
          type: 'string',
          nullable: true,
          description: 'Archivo más antiguo',
        },
        newestFile: {
          type: 'string',
          nullable: true,
          description: 'Archivo más reciente',
        },
        hitRate: { type: 'number', description: 'Tasa de aciertos del caché' },
      },
    },
  })
  async getCacheStats() {
    this.logger.log('📊 Obteniendo estadísticas de caché Hawaii');
    const stats = await this.hawaiiCacheService.getCacheStats();

    return {
      success: true,
      message: 'Estadísticas de caché obtenidas exitosamente',
      stats,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('preload/:semester')
  @Roles(UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Pre-cargar datos completos de un semestre',
    description:
      'Descarga y cachea todos los datos (estudiantes, cursos, inscripciones) para un semestre específico',
  })
  @ApiParam({
    name: 'semester',
    description: 'Semestre académico (formato: YYYYPP)',
    example: '20251',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos pre-cargados exitosamente',
    schema: {
      properties: {
        success: { type: 'boolean' },
        students: { type: 'number' },
        courses: { type: 'number' },
        enrollments: { type: 'number' },
        cacheStats: {
          type: 'object',
          properties: {
            totalApiCalls: { type: 'number' },
            studentsFromCache: { type: 'boolean' },
            coursesFromCache: { type: 'boolean' },
            enrollmentsFromCache: { type: 'boolean' },
          },
        },
      },
    },
  })
  async preloadSemesterData(@Param('semester') semester: string) {
    this.logger.log(`🚀 Pre-cargando datos para semestre ${semester}`);

    try {
      const result = await this.hawaiiCacheService.preloadSemesterData(semester);

      return result;
    } catch (error) {
      this.logger.error('❌ Error en pre-carga de datos:', error);
      throw error;
    }
  }

  @Post('refresh')
  @Roles(UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Forzar actualización de caché',
    description: 'Invalida y actualiza el caché para datos específicos o todos',
  })
  @ApiResponse({ status: 200, description: 'Caché actualizado exitosamente' })
  async forceRefresh(
    @Body()
    body: {
      type: 'all' | 'estudiantes' | 'cursos' | 'inscripciones';
      semester?: string;
    },
  ) {
    this.logger.log(
      `🔄 Forzando actualización de caché: ${body.type}${body.semester ? ` para semestre ${body.semester}` : ''}`,
    );

    try {
      await this.hawaiiCacheService.forceRefresh(body.type, body.semester);

      return {
        success: true,
        message: `Caché ${body.type} actualizado exitosamente`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('❌ Error actualizando caché:', error);
      throw error;
    }
  }

  @Delete('cleanup')
  @Roles(UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Limpiar caché expirado',
    description:
      'Elimina archivos de caché antiguos y optimiza el almacenamiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Limpieza de caché completada exitosamente',
    schema: {
      properties: {
        success: { type: 'boolean' },
        filesRemoved: { type: 'number' },
        spaceFreed: { type: 'number' },
        oldestCache: { type: 'string', nullable: true },
      },
    },
  })
  async cleanupCache() {
    this.logger.log('🧹 Iniciando limpieza de caché...');

    try {
      const result = await this.hawaiiCacheService.cleanupCache();

      return {
        success: true,
        message: 'Limpieza de caché completada exitosamente',
        cleanup: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('❌ Error en limpieza de caché:', error);
      throw error;
    }
  }

  @Get('status/:type')
  @Roles(UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Verificar estado de caché específico',
    description:
      'Muestra si un tipo de dato específico está cacheado y cuándo se actualizó',
  })
  @ApiParam({
    name: 'type',
    enum: ['estudiantes', 'cursos', 'inscripciones'],
    description: 'Tipo de dato a verificar',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Semestre (requerido para cursos e inscripciones)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de caché obtenido exitosamente',
  })
  async getCacheStatus(
    @Param('type') type: 'estudiantes' | 'cursos' | 'inscripciones',
    @Query('semester') semester?: string,
  ) {
    this.logger.log(
      `🔍 Verificando estado de caché para: ${type}${semester ? ` (${semester})` : ''}`,
    );

    try {
      // Verificar si el caché existe y está válido
      let cacheKey: string;
      if (type === 'estudiantes') {
        cacheKey = 'estudiantes';
      } else if (type === 'cursos' && semester) {
        cacheKey = `oferta-${semester}`;
      } else if (type === 'inscripciones' && semester) {
        cacheKey = `inscripcion-${semester}`;
      } else {
        return {
          success: false,
          message:
            'Parámetros inválidos. Semester requerido para cursos e inscripciones',
          cached: false,
          timestamp: new Date().toISOString(),
        };
      }

      const stats = await this.hawaiiCacheService.getCacheStats();

      return {
        success: true,
        message: `Estado de caché para ${type} obtenido exitosamente`,
        type,
        semester,
        cacheKey,
        cached: stats.diskCacheFiles > 0,
        generalStats: {
          totalFiles: stats.diskCacheFiles,
          totalSize: stats.totalDiskSize,
          oldestFile: stats.oldestFile,
          newestFile: stats.newestFile,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('❌ Error verificando estado de caché:', error);
      throw error;
    }
  }

  @Post('warm-up')
  @Roles(UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Precalentar caché para múltiples semestres',
    description:
      'Descarga y cachea datos para varios semestres en una operación optimizada',
  })
  @ApiResponse({
    status: 200,
    description: 'Precalentamiento de caché completado',
  })
  async warmUpCache(
    @Body() body: { semesters: string[]; includeStudents?: boolean },
  ) {
    this.logger.log(
      `🔥 Precalentando caché para semestres: ${body.semesters.join(', ')}`,
    );

    const startTime = Date.now();
    const results: any[] = [];

    try {
      // Precargar estudiantes una sola vez si se solicita
      if (body.includeStudents !== false) {
        this.logger.log('👥 Precargando estudiantes...');
        await this.hawaiiCacheService.getEstudiantesWithCache();
      }

      // Precargar datos para cada semestre
      for (const semester of body.semesters) {
        this.logger.log(`📚 Precargando datos para semestre ${semester}...`);

        try {
          const result =
            await this.hawaiiCacheService.preloadSemesterData(semester);
          results.push({
            semester,
            success: true,
            ...result,
          });
        } catch (error) {
          this.logger.error(
            `❌ Error precargando semestre ${semester}:`,
            error,
          );
          results.push({
            semester,
            success: false,
            error: error.message,
          });
        }
      }

      const duration = Date.now() - startTime;
      const successCount = results.filter((r: any) => r.success).length;

      this.logger.log(
        `✅ Precalentamiento completado en ${duration}ms: ${successCount}/${body.semesters.length} semestres exitosos`,
      );

      return {
        success: successCount > 0,
        message: `Precalentamiento completado: ${successCount}/${body.semesters.length} semestres exitosos`,
        duration,
        results,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('❌ Error en precalentamiento de caché:', error);
      throw error;
    }
  }
}
