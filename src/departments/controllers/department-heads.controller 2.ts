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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DepartmentHeadGuard } from '../../auth/guards/department-head.guard';
import { DepartmentStatsService } from '../services/department-stats.service';
import { DepartmentStatsResponseDto } from '../dto/department-stats-response.dto';
import { DepartmentStudentsNeeResponseDto } from '../dto/department-student-nee-response.dto';
import { DepartmentTeachersResponseDto } from '../dto/department-teachers-response.dto';
import { Department } from '../schemas/department.schema';

@ApiTags('Jefes de Departamento')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, DepartmentHeadGuard)
@Controller('departments/heads')
export class DepartmentHeadsController {
  constructor(private readonly departmentStatsService: DepartmentStatsService) {}

  @Get('my-department')
  @ApiOperation({ summary: 'Obtener información del departamento del jefe actual' })
  @ApiResponse({ status: 200, description: 'Información del departamento', type: Department })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  async getMyDepartment(@Request() req: { user: { userId: string } }): Promise<Department> {
    const userId = req.user.userId;
    const department = await this.departmentStatsService.getDepartmentByHead(userId);
    
    if (!department) {
      throw new NotFoundException('No se encontró el departamento para el jefe especificado');
    }
    
    return department;
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Obtener estadísticas del departamento del jefe actual' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas del departamento',
    type: DepartmentStatsResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
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
  @ApiOperation({ summary: 'Obtener estudiantes con NEE del departamento' })
  @ApiResponse({
    status: 200,
    description: 'Lista de estudiantes con NEE',
    type: DepartmentStudentsNeeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
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
  @ApiOperation({ summary: 'Obtener docentes del departamento con estadísticas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de docentes con estadísticas',
    type: DepartmentTeachersResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
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
  @ApiOperation({ summary: 'Obtener estadísticas de un departamento específico (solo administradores)' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del departamento',
    type: DepartmentStatsResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
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
