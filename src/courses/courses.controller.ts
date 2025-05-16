import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './schemas/course.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Crear un nuevo curso (Admin, Staff)' })
  @ApiResponse({ status: 201, description: 'Curso creado exitosamente', type: Course })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Obtener todos los cursos (Admin, Staff)' })
  @ApiQuery({ name: 'semester', required: false, description: 'Filtrar por semestre (ej: 2025-1)' })
  @ApiResponse({ status: 200, description: 'Lista de cursos', type: [Course] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async findAll(@Query('semester') semester?: string): Promise<Course[]> {
    if (semester) {
      return this.coursesService.findBySemester(semester);
    }
    return this.coursesService.findAll();
  }

  @Get('student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STUDENT)
  @ApiOperation({ summary: 'Obtener cursos de un estudiante (Admin, Staff, Student)' })
  @ApiParam({ name: 'studentId', description: 'ID del estudiante' })
  @ApiQuery({ name: 'semester', required: false, description: 'Filtrar por semestre (ej: 2025-1)' })
  @ApiResponse({ status: 200, description: 'Lista de cursos del estudiante', type: [Course] })
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
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Obtener un curso por ID (Admin, Staff)' })
  @ApiParam({ name: 'id', description: 'ID del curso' })
  @ApiResponse({ status: 200, description: 'Detalles del curso', type: Course })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async findOne(@Param('id') id: string): Promise<Course> {
    return this.coursesService.findOne(id);
  }

  @Get(':courseId/students-with-adjustments')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Obtener estudiantes con ajustes en un curso (Admin, Staff)' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiResponse({ status: 200, description: 'Lista de estudiantes con ajustes activos en el curso' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async getStudentsWithAdjustments(@Param('courseId') courseId: string): Promise<any[]> {
    return this.coursesService.findStudentsWithAdjustments(courseId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Actualizar un curso (Admin, Staff)' })
  @ApiParam({ name: 'id', description: 'ID del curso' })
  @ApiResponse({ status: 200, description: 'Curso actualizado exitosamente', type: Course })
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar un curso (Admin)' })
  @ApiParam({ name: 'id', description: 'ID del curso' })
  @ApiResponse({ status: 204, description: 'Curso eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (rol no permitido)' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.coursesService.remove(id);
  }
}
