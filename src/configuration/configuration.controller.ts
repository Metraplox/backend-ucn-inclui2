import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { HawaiiSyncService } from '../hawaii/hawaii-sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { RealDataLoaderService } from './real-data-loader.service';

@ApiTags('Configuración')
@ApiBearerAuth()
@Controller('configuracion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConfiguracionController {
  constructor(
    private readonly hawaiiSyncService: HawaiiSyncService,
    private readonly realDataLoaderService: RealDataLoaderService,
  ) {}

  @Post('sincronizar-bd')
  @Roles(UserRole.COORDINADOR)
  @ApiOperation({ summary: 'Sincronizar BD con datos Hawaii y NEE', description: 'Carga/actualiza todos los datos del semestre actual (estudiantes NEE, cursos, inscripciones, profesores).' })
  @ApiBody({ schema: { properties: { semestre: { type: 'string', example: '2025-2' } } } })
  @ApiResponse({ status: 200, description: 'Sincronización ejecutada', schema: { example: { success: true, students: 100, courses: 80, enrollments: 400, errors: [], cacheStats: { totalApiCalls: 3, cachingEnabled: true, preloadUsed: true } } } })
  async sincronizarBD(@Body('semestre') semestre: string) {
    if (!semestre || !/^\d{4}-?\d$/.test(semestre)) {
      return { success: false, error: 'Formato de semestre inválido. Ejemplo válido: 2025-2' };
    }
    // Usar el servicio de carga real para asegurar la lógica correcta
    return this.realDataLoaderService.cargarDatosReales(semestre);
  }
}
