import { Controller, Post, Body, UseGuards, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('sync')
@Controller('sync')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('students/nee')
  @ApiOperation({ summary: 'Sincronizar estudiantes NEE desde Hawaii UCN' })
  @ApiResponse({ status: 200, description: 'Estudiantes NEE sincronizados correctamente' })
  async syncNeeStudents() {
    const students = await this.syncService.syncNeeStudents();
    return { 
      message: 'Sincronización de estudiantes NEE completada', 
      count: students.length,
      students 
    };
  }
  
  @Post('students/nee/persist')
  @ApiOperation({ summary: 'Sincronizar y persistir estudiantes NEE desde Hawaii UCN en la base de datos' })
  @ApiResponse({ status: 200, description: 'Estudiantes NEE sincronizados y persistidos correctamente' })
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
