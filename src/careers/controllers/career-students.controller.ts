import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { CareersService } from '../careers.service';
import { AddStudentDto } from '../dto/add-student.dto';

@ApiTags('career-students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('careers')
export class CareerStudentsController {
  constructor(private readonly careersService: CareersService) {}

  @Post(':id/students')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({ summary: 'Agregar un estudiante a una carrera' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Estudiante agregado a la carrera exitosamente',
  })
  async addStudent(
    @Param('id') careerId: string,
    @Body() addStudentDto: AddStudentDto,
  ) {
    return this.careersService.addStudent(careerId, addStudentDto.studentId);
  }

  @Delete(':id/students/:studentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({ summary: 'Eliminar un estudiante de una carrera' })
  @ApiParam({ name: 'id', description: 'ID de la carrera' })
  @ApiParam({
    name: 'studentId',
    description: 'ID del estudiante a eliminar de la carrera',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Estudiante eliminado de la carrera exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - No tiene permisos suficientes',
  })
  @ApiResponse({
    status: 404,
    description: 'Carrera o estudiante no encontrado',
  })
  async removeStudent(
    @Param('id') careerId: string,
    @Param('studentId') studentId: string,
  ) {
    await this.careersService.removeStudent(careerId, studentId);
  }

  @Get(':id/students')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({ summary: 'Obtener todos los estudiantes de una carrera' })
  @ApiParam({ name: 'id', description: 'ID de la carrera' })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre académico (ej: 2025-1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estudiantes de la carrera obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - No tiene permisos suficientes',
  })
  @ApiResponse({ status: 404, description: 'Carrera no encontrada' })
  async getStudents(
    @Param('id') careerId: string,
    @Query('semester') semester?: string,
  ) {
    return this.careersService.getStudents(careerId, semester);
  }
}
