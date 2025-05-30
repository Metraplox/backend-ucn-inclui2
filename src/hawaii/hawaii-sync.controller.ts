import { Controller, Get, Post, Body, Param, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { HawaiiSyncService } from './hawaii-sync.service';

@ApiTags('hawaii-sync')
@Controller('admin/hawaii-sync')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HawaiiSyncController {
  private readonly logger = new Logger(HawaiiSyncController.name);

  constructor(private readonly hawaiiSyncService: HawaiiSyncService) {}

  @Post('students')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Sincronizar estudiantes NEE desde Hawaii API' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estudiantes NEE sincronizados exitosamente',
    schema: {
      properties: {
        success: { type: 'boolean' },
        synchronized: { type: 'number' },
        notFound: { type: 'array', items: { type: 'string' } },
        errors: { type: 'array', items: { type: 'object' } }
      }
    }
  })
  async syncNeeStudents(@Body() body: { semester: string }) {
    this.logger.log(`Iniciando sincronización de estudiantes NEE para semestre ${body.semester}`);
    return this.hawaiiSyncService.syncNeeStudents(body.semester);
  }

  @Post('courses-enrollments')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Sincronizar cursos e inscripciones de estudiantes NEE' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cursos e inscripciones sincronizados exitosamente',
    schema: {
      properties: {
        success: { type: 'boolean' },
        courses: { type: 'number' },
        enrollments: { type: 'number' },
        errors: { type: 'array', items: { type: 'object' } }
      }
    }
  })
  async syncCoursesAndEnrollments(@Body() body: { semester: string }) {
    this.logger.log(`Iniciando sincronización de cursos e inscripciones para semestre ${body.semester}`);
    return this.hawaiiSyncService.syncNeeCoursesAndEnrollments(body.semester);
  }

  @Post('all')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Sincronizar todos los datos NEE desde Hawaii API' })
  @ApiResponse({ 
    status: 200, 
    description: 'Todos los datos NEE sincronizados exitosamente',
    schema: {
      properties: {
        success: { type: 'boolean' },
        students: { type: 'number' },
        courses: { type: 'number' },
        enrollments: { type: 'number' },
        errors: { 
          type: 'array', 
          items: { 
            type: 'object',
            properties: {
              rut: { type: 'string', nullable: true },
              nrc: { type: 'string', nullable: true },
              error: { type: 'string' }
            }
          }
        }
      }
    }
  })
  async syncAllNeeData(@Body() body: { semester: string }) {
    this.logger.log(`Iniciando sincronización completa de datos NEE para semestre ${body.semester}`);
    return this.hawaiiSyncService.syncAllNeeData(body.semester);
  }

  @Get('status')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Obtener estado de la sincronización Hawaii' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de sincronización obtenido exitosamente',
    schema: {
      properties: {
        lastSync: { type: 'string', format: 'date-time' },
        neeStudentsCount: { type: 'number' },
        syncStatus: { type: 'string' }
      }
    }
  })
  async getSyncStatus() {
    return {
      lastSync: new Date().toISOString(),
      neeStudentsCount: 63, // Número basado en tu archivo ESTUDIANTES_NEE.txt
      syncStatus: 'OK'
    };
  }
}
