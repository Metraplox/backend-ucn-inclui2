import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './schemas/course.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CourseResponseDto } from './dto/course-response.dto';
import { StudentWithAdjustmentsDto } from './dto/student-with-adjustments.dto';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(UserRole.COORDINADOR)
  @ApiOperation({ summary: 'Crear un nuevo curso (Coordinador)' })
  @ApiResponse({
    status: 201,
    description: 'Curso creado exitosamente',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @Roles(UserRole.COORDINADOR, UserRole.JEFE_CARRERA, UserRole.JEFE_DEPARTAMENTO, UserRole.DOCENTE)
  @ApiOperation({ summary: 'Obtener todos los cursos (Coordinador, Jefes, Docente)' })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre (ej: 2025-1)',
  })
  @ApiResponse({ status: 200, description: 'Lista de cursos', type: [CourseResponseDto] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async findAll(@Query('semester') semester?: string): Promise<Course[]> {
    if (semester) {
      return this.coursesService.findBySemester(semester);
    }
    return this.coursesService.findAll();
  }

  @Get('student/:studentId')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Obtener cursos de un estudiante (Coordinador, Educadora, Estudiante)',
  })
  @ApiParam({ name: 'studentId', description: 'ID del estudiante' })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre (ej: 2025-1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos del estudiante',
    type: [CourseResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async findByStudent(
    @Param('studentId') studentId: string,
    @Query('semester') semester?: string,
  ): Promise<Course[]> {
    return this.coursesService.findByStudent(studentId, semester);
  }

  @Get(':id')
  @Roles(UserRole.COORDINADOR, UserRole.JEFE_CARRERA, UserRole.JEFE_DEPARTAMENTO, UserRole.DOCENTE)
  @ApiOperation({ summary: 'Obtener un curso por ID (Coordinador, Jefes, Docente)' })
  @ApiParam({ name: 'id', description: 'ID del curso' })
  @ApiResponse({ status: 200, description: 'Detalles del curso', type: CourseResponseDto })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async findOne(@Param('id') id: string): Promise<Course> {
    return this.coursesService.findOne(id);
  }

  @Get(':courseId/students-with-adjustments')
  @Roles(UserRole.COORDINADOR, UserRole.JEFE_CARRERA, UserRole.JEFE_DEPARTAMENTO, UserRole.DOCENTE)
  @ApiOperation({
    summary: 'Obtener estudiantes con ajustes en un curso (Coordinador, Jefes, Docente)',
  })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiResponse({
    status: 200,
    description: 'Lista de estudiantes con ajustes activos en el curso',
    type: [StudentWithAdjustmentsDto],
  })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async getStudentsWithAdjustments(
    @Param('courseId') courseId: string,
  ): Promise<any[]> {
    return this.coursesService.findStudentsWithAdjustments(courseId);
  }

  @Patch(':id')
  @Roles(UserRole.COORDINADOR)
  @ApiOperation({ summary: 'Actualizar un curso (Coordinador)' })
  @ApiParam({ name: 'id', description: 'ID del curso' })
  @ApiResponse({
    status: 200,
    description: 'Curso actualizado exitosamente',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @Roles(UserRole.COORDINADOR)
  @ApiOperation({ summary: 'Eliminar un curso (Coordinador)' })
  @ApiParam({ name: 'id', description: 'ID del curso' })
  @ApiResponse({ status: 204, description: 'Curso eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.coursesService.remove(id);
  }
}
