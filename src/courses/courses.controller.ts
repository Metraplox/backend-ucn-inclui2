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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
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
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Crear un nuevo curso',
    description:
      'Registra un nuevo curso en el sistema. El curso se asocia automáticamente a la carrera especificada. Solo coordinadores pueden crear cursos.',
  })
  @ApiBody({
    type: CreateCourseDto,
    description: 'Datos del curso a crear',
    examples: {
      curso_ejemplo: {
        value: {
          name: 'Cálculo I',
          courseNrc: 'MAT101-1',
          careerId: '507f1f77bcf86cd799439011',
          semester: '2025-1',
          credits: 6,
          schedule: 'Lu-Mi-Vi 08:00-09:30',
          teacherId: '507f1f77bcf86cd799439012',
          capacity: 40,
          isActive: true,
        },
        description: 'Curso de matemáticas básicas',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Curso creado exitosamente.',
    type: CourseResponseDto,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Cálculo I',
        courseNrc: 'MAT101-1',
        careerId: '507f1f77bcf86cd799439012',
        career: {
          name: 'Ingeniería Civil en Computación',
          code: 'ICCI',
        },
        semester: '2025-1',
        credits: 6,
        teacherId: '507f1f77bcf86cd799439013',
        teacher: {
          nombreCompleto: 'Dr. Juan Pérez',
          email: 'juan.perez@ucn.cl',
        },
        enrolledStudents: 0,
        capacity: 40,
        isActive: true,
        createdAt: '2025-06-19T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos de entrada inválidos - NRC duplicado o carrera no existe.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Solo coordinadores pueden crear cursos.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflicto - Ya existe un curso con ese código NRC en el semestre.',
  })
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @Roles(
    UserRole.COORDINADOR,
    UserRole.EDUCADORA_SOCIAL,
    UserRole.JEFE_CARRERA,
    UserRole.JEFE_DEPARTAMENTO,
    UserRole.DOCENTE,
  )
  @ApiOperation({
    summary: 'Listar todos los cursos',
    description:
      'Obtiene la lista de cursos del sistema. Los docentes solo ven los cursos que imparten. Permite filtrar por semestre académico.',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre académico',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[12]$',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos obtenida exitosamente.',
    type: [CourseResponseDto],
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Usuario no tiene los roles requeridos.',
  })
  async findAll(@Query('semester') semester?: string): Promise<Course[]> {
    if (semester) {
      return this.coursesService.findBySemester(semester);
    }
    return this.coursesService.findAll();
  }

  @Get('student/:studentId')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Obtener cursos inscritos de un estudiante',
    description:
      'Lista todos los cursos en los que está inscrito un estudiante específico. Los estudiantes solo pueden ver sus propios cursos. Incluye información del docente y horarios.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'ID del estudiante (ObjectId)',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre académico',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[12]$',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos del estudiante.',
    type: [CourseResponseDto],
    isArray: true,
  })
  @ApiResponse({
    status: 404,
    description: 'Estudiante no encontrado.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido - Los estudiantes solo pueden ver sus propios cursos.',
  })
  async findByStudent(
    @Param('studentId') studentId: string,
    @Query('semester') semester?: string,
  ): Promise<Course[]> {
    return this.coursesService.findByStudent(studentId, semester);
  }

  @Get(':id')
  @Roles(
    UserRole.COORDINADOR,
    UserRole.EDUCADORA_SOCIAL,
    UserRole.JEFE_CARRERA,
    UserRole.JEFE_DEPARTAMENTO,
    UserRole.DOCENTE,
  )
  @ApiOperation({
    summary: 'Obtener un curso específico por ID',
    description:
      'Retorna la información completa de un curso incluyendo docente asignado, carrera y cantidad de estudiantes inscritos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso (ObjectId)',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Curso encontrado exitosamente.',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Curso no encontrado con el ID especificado.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Usuario no tiene los roles requeridos.',
  })
  async findOne(@Param('id') id: string): Promise<Course> {
    return this.coursesService.findOne(id);
  }

  @Get(':courseId/students-with-adjustments')
  @Roles(
    UserRole.COORDINADOR,
    UserRole.JEFE_CARRERA,
    UserRole.JEFE_DEPARTAMENTO,
    UserRole.DOCENTE,
  )
  @ApiOperation({
    summary: 'Obtener estudiantes con ajustes razonables en un curso',
    description:
      'Lista todos los estudiantes que tienen ajustes activos en un curso específico. Incluye detalles de los ajustes para que el docente pueda aplicarlos. Los docentes solo pueden acceder si son profesores del curso.',
  })
  @ApiParam({
    name: 'courseId',
    description: 'ID del curso',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estudiantes con sus ajustes activos en el curso.',
    type: [StudentWithAdjustmentsDto],
    isArray: true,
    schema: {
      example: [
        {
          studentId: '507f1f77bcf86cd799439012',
          nombre: 'Juan Pérez',
          rut: '12345678-9',
          email: 'juan.perez@alumnos.ucn.cl',
          adjustments: [
            {
              type: 'tiempo_extra',
              description: '50% de tiempo adicional en evaluaciones',
              status: 'active',
              expirationDate: '2025-12-31T00:00:00Z',
              readByTeacher: true,
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Curso no encontrado.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Docente no es profesor de este curso.',
  })
  async getStudentsWithAdjustments(
    @Param('courseId') courseId: string,
  ): Promise<any[]> {
    return this.coursesService.findStudentsWithAdjustments(courseId);
  }

  @Patch(':id')
  @Roles(UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Actualizar un curso existente',
    description:
      'Actualiza parcialmente la información de un curso. Útil para cambiar docente, horario, capacidad, etc. Solo coordinadores pueden actualizar cursos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso a actualizar',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateCourseDto,
    description: 'Campos del curso a actualizar',
    examples: {
      cambiar_docente: {
        value: {
          teacherId: '507f1f77bcf86cd799439014',
        },
        description: 'Asignar nuevo docente al curso',
      },
      actualizar_horario: {
        value: {
          schedule: 'Ma-Ju 10:00-11:30',
          capacity: 45,
        },
        description: 'Cambiar horario y aumentar capacidad',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Curso actualizado exitosamente.',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Curso no encontrado con el ID especificado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Solo coordinadores pueden actualizar cursos.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @Roles(UserRole.COORDINADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un curso',
    description:
      'Elimina permanentemente un curso del sistema. Esta acción es irreversible. El curso no debe tener estudiantes inscritos ni ajustes activos asociados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso a eliminar',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 204,
    description: 'Curso eliminado exitosamente. Sin contenido en la respuesta.',
  })
  @ApiResponse({
    status: 404,
    description: 'Curso no encontrado con el ID especificado.',
  })
  @ApiResponse({
    status: 400,
    description:
      'No se puede eliminar - El curso tiene estudiantes inscritos o ajustes activos.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Solo coordinadores pueden eliminar cursos.',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.coursesService.remove(id);
  }
}
