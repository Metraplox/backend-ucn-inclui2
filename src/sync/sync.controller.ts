import { Controller, Post, Body, UseGuards, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('sync')
@Controller('sync')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('students/nee')
  @ApiOperation({ 
    summary: 'Sincronizar estudiantes NEE desde Hawaii UCN',
    description: 'Obtiene la lista actualizada de estudiantes con Necesidades Educativas Especiales desde el sistema Hawaii UCN sin persistir en base de datos local.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estudiantes NEE sincronizados correctamente desde Hawaii UCN',
    example: {
      message: 'Sincronización de estudiantes NEE completada',
      count: 145,
      students: [
        {
          rut: '20.123.456-7',
          firstName: 'Ana María',
          lastName: 'García González',
          email: 'ana.garcia@alumnos.ucn.cl',
          career: 'Ingeniería Civil Industrial',
          disabilityType: 'Trastorno específico del aprendizaje',
          semester: '2025-1',
          source: 'hawaii_ucn'
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 503, description: 'Servicio Hawaii UCN no disponible' })
  async syncNeeStudents() {
    const students = await this.syncService.syncNeeStudents();
    return { 
      message: 'Sincronización de estudiantes NEE completada', 
      count: students.length,
      students 
    };
  }
  
  @Post('students/nee/persist')
  @ApiOperation({ 
    summary: 'Sincronizar y persistir estudiantes NEE',
    description: 'Sincroniza estudiantes NEE desde Hawaii UCN y los guarda/actualiza en la base de datos local del sistema INCLUI2.'
  })
  @ApiBody({
    description: 'Datos de sincronización con semestre académico',
    examples: {
      'sync_semester': {
        value: {
          semester: '2025-1'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estudiantes NEE sincronizados y persistidos correctamente',
    example: {
      message: 'Sincronización y persistencia de estudiantes NEE para semestre 2025-1 completada',
      count: 18
    }
  })
  @ApiResponse({ status: 400, description: 'Semestre es obligatorio o formato inválido' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 503, description: 'Error de conexión con Hawaii UCN' })
  async syncAndPersistNeeStudents(@Body('semester') semester: string) {
    if (!semester) {
      throw new BadRequestException('El campo semester es obligatorio');
    }
    const result = await this.syncService.syncAndPersistNeeStudents(semester);
    return { 
      message: `Sincronización y persistencia de estudiantes NEE para semestre ${semester} completada`, 
      count: result.count
    };
  }

  @Post('courses')
  @ApiOperation({ summary: 'Sincronizar cursos desde Hawaii UCN para un semestre' })
  @ApiResponse({ status: 200, description: 'Cursos sincronizados correctamente' })
  async syncCourses(@Body('semester') semester: string) {
    if (!semester) {
      throw new BadRequestException('El campo semester es obligatorio');
    }
    const courses = await this.syncService.syncCourses(semester);
    return { 
      message: `Sincronización de cursos para semestre ${semester} completada`, 
      count: courses.length,
      courses 
    };
  }
  
  @Post('courses/persist')
  @ApiOperation({ summary: 'Sincronizar y persistir cursos desde Hawaii UCN en la base de datos' })
  @ApiResponse({ status: 200, description: 'Cursos sincronizados y persistidos correctamente' })
  async syncAndPersistCourses(@Body('semester') semester: string) {
    if (!semester) {
      throw new BadRequestException('El campo semester es obligatorio');
    }
    const result = await this.syncService.syncAndPersistCourses(semester);
    return { 
      message: `Sincronización y persistencia de cursos para semestre ${semester} completada`, 
      count: result.count
    };
  }

  @Post('inscriptions')
  @ApiOperation({ summary: 'Sincronizar inscripciones desde Hawaii UCN para un semestre' })
  @ApiResponse({ status: 200, description: 'Inscripciones sincronizadas correctamente' })
  async syncInscriptions(@Body('semester') semester: string) {
    if (!semester) {
      throw new BadRequestException('El campo semester es obligatorio');
    }
    const inscriptions = await this.syncService.syncInscriptions(semester);
    return { 
      message: `Sincronización de inscripciones para semestre ${semester} completada`, 
      count: inscriptions.length,
      inscriptions 
    };
  }

  @Post('inscriptions/nee')
  @ApiOperation({ summary: 'Sincronizar inscripciones de estudiantes NEE desde Hawaii UCN para un semestre' })
  @ApiResponse({ status: 200, description: 'Inscripciones de estudiantes NEE sincronizadas correctamente' })
  async syncNeeInscriptions(@Body('semester') semester: string) {
    if (!semester) {
      throw new BadRequestException('El campo semester es obligatorio');
    }
    const inscriptions = await this.syncService.syncNeeInscriptions(semester);
    return { 
      message: `Sincronización de inscripciones NEE para semestre ${semester} completada`, 
      count: inscriptions.length,
      inscriptions 
    };
  }
}
