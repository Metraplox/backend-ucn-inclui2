import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { AcademicHistoryService } from '../services/academic-history.service';
import { AcademicHistory } from '../schemas/academic-history.schema';
import { CreateAcademicHistoryDto } from '../dto/create-academic-history.dto';
import { UpdateAcademicHistoryDto } from '../dto/update-academic-history.dto';

@ApiTags('academic-history')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academic-history')
export class AcademicHistoryController {
  constructor(
    private readonly academicHistoryService: AcademicHistoryService,
  ) {}

  @Post()
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({
    summary: 'Crear registro de historial académico',
    description:
      'Crea un nuevo registro de historial académico para un estudiante en un curso específico. Incluye notas, asistencia y observaciones del rendimiento académico.',
  })
  @ApiBody({
    description: 'Datos del nuevo registro de historial académico',
    examples: {
      registro_completo: {
        value: {
          studentId: '507f1f77bcf86cd799439012',
          courseId: '507f1f77bcf86cd799439015',
          semester: '2025-1',
          finalGrade: 6.2,
          attendance: 85.5,
          observations:
            'Estudiante con excelente participación en clases. Requirió tiempo adicional en evaluaciones.',
          adjustmentsUsed: ['Tiempo adicional', 'Evaluación oral'],
          evaluationDate: '2025-01-15T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Registro de historial académico creado exitosamente',
    example: {
      _id: '507f1f77bcf86cd799439016',
      studentId: '507f1f77bcf86cd799439012',
      courseId: '507f1f77bcf86cd799439015',
      semester: '2025-1',
      finalGrade: 6.2,
      attendance: 85.5,
      observations: 'Estudiante con excelente participación en clases',
      adjustmentsUsed: ['Tiempo adicional', 'Evaluación oral'],
      evaluationDate: '2025-01-15T10:00:00.000Z',
      createdAt: '2025-01-15T12:30:00.000Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o registro duplicado',
  })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos de coordinador o staff DIDDEC',
  })
  async create(
    @Body() createAcademicHistoryDto: CreateAcademicHistoryDto,
  ): Promise<AcademicHistory> {
    return this.academicHistoryService.create(createAcademicHistoryDto);
  }

  @Get()
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({
    summary: 'Obtener todos los registros de historial académico',
    description:
      'Lista completa de registros de historial académico con filtros opcionales por semestre. Útil para análisis institucional y reportes.',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Semestre académico en formato YYYY-P para filtrar registros',
    example: '2025-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros de historial académico',
    example: [
      {
        _id: '507f1f77bcf86cd799439016',
        studentId: '507f1f77bcf86cd799439012',
        studentRut: '20.123.456-7',
        studentName: 'Ana María García',
        courseId: '507f1f77bcf86cd799439015',
        courseName: 'Cálculo I',
        courseNrc: '30001',
        semester: '2025-1',
        finalGrade: 6.2,
        attendance: 85.5,
        observations: 'Estudiante con excelente participación',
        adjustmentsUsed: ['Tiempo adicional', 'Evaluación oral'],
        evaluationDate: '2025-01-15T10:00:00.000Z',
      },
    ],
  })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos de coordinador o staff DIDDEC',
  })
  async findAll(
    @Query('semester') semester?: string,
  ): Promise<AcademicHistory[]> {
    return this.academicHistoryService.findAll(semester);
  }

  @Get('student/:studentId')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({
    summary: 'Historial académico de un estudiante',
    description:
      'Obtiene el historial académico completo de un estudiante específico, incluyendo todas las asignaturas cursadas y su rendimiento histórico.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'ObjectId del estudiante',
    example: '507f1f77bcf86cd799439012',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre académico específico',
    example: '2025-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial académico completo del estudiante',
    example: [
      {
        _id: '507f1f77bcf86cd799439016',
        courseId: '507f1f77bcf86cd799439015',
        courseName: 'Cálculo I',
        courseNrc: '30001',
        semester: '2025-1',
        finalGrade: 6.2,
        attendance: 85.5,
        observations: 'Buen rendimiento con ajustes implementados',
        adjustmentsUsed: ['Tiempo adicional'],
        evaluationDate: '2025-01-15T10:00:00.000Z',
      },
      {
        _id: '507f1f77bcf86cd799439017',
        courseId: '507f1f77bcf86cd799439018',
        courseName: 'Física I',
        courseNrc: '30002',
        semester: '2024-2',
        finalGrade: 5.8,
        attendance: 90.0,
        observations: 'Necesitó apoyo adicional en laboratorios',
        adjustmentsUsed: ['Material adaptado', 'Evaluación oral'],
        evaluationDate: '2024-12-10T14:00:00.000Z',
      },
    ],
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  async findByStudent(
    @Param('studentId') studentId: string,
    @Query('semester') semester?: string,
  ): Promise<AcademicHistory[]> {
    return this.academicHistoryService.findByStudent(studentId, semester);
  }

  @Get('course/:courseId')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({
    summary: 'Historial académico de un curso',
    description:
      'Obtiene el historial de todos los estudiantes que han cursado una asignatura específica, útil para análisis de rendimiento por materia.',
  })
  @ApiParam({
    name: 'courseId',
    description: 'ObjectId del curso',
    example: '507f1f77bcf86cd799439015',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre académico específico',
    example: '2025-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial académico de todos los estudiantes del curso',
    example: [
      {
        _id: '507f1f77bcf86cd799439016',
        studentId: '507f1f77bcf86cd799439012',
        studentRut: '20.123.456-7',
        studentName: 'Ana María García',
        semester: '2025-1',
        finalGrade: 6.2,
        attendance: 85.5,
        observations: 'Excelente participación',
        adjustmentsUsed: ['Tiempo adicional'],
      },
      {
        _id: '507f1f77bcf86cd799439019',
        studentId: '507f1f77bcf86cd799439020',
        studentRut: '19.987.654-3',
        studentName: 'Carlos Eduardo López',
        semester: '2025-1',
        finalGrade: 5.5,
        attendance: 78.0,
        observations: 'Requirió apoyo constante',
        adjustmentsUsed: ['Material adaptado', 'Evaluación oral'],
      },
    ],
  })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async findByCourse(
    @Param('courseId') courseId: string,
    @Query('semester') semester?: string,
  ): Promise<AcademicHistory[]> {
    return this.academicHistoryService.findByCourse(courseId, semester);
  }

  @Get(':id')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({
    summary: 'Obtener registro específico de historial',
    description:
      'Obtiene los detalles completos de un registro específico de historial académico incluyendo toda la información asociada.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId del registro de historial académico',
    example: '507f1f77bcf86cd799439016',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro de historial académico encontrado',
    example: {
      _id: '507f1f77bcf86cd799439016',
      studentId: '507f1f77bcf86cd799439012',
      studentRut: '20.123.456-7',
      studentName: 'Ana María García',
      courseId: '507f1f77bcf86cd799439015',
      courseName: 'Cálculo I',
      courseNrc: '30001',
      semester: '2025-1',
      finalGrade: 6.2,
      attendance: 85.5,
      observations:
        'Estudiante con excelente participación en clases. Implementó ajustes exitosamente.',
      adjustmentsUsed: ['Tiempo adicional', 'Evaluación oral'],
      evaluationDate: '2025-01-15T10:00:00.000Z',
      createdAt: '2025-01-15T12:30:00.000Z',
      updatedAt: '2025-01-15T12:30:00.000Z',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Registro de historial no encontrado',
  })
  async findOne(@Param('id') id: string): Promise<AcademicHistory> {
    return this.academicHistoryService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({
    summary: 'Actualizar registro de historial académico',
    description:
      'Actualiza la información de un registro de historial académico existente. Permite modificar notas, observaciones y ajustes utilizados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId del registro a actualizar',
    example: '507f1f77bcf86cd799439016',
  })
  @ApiBody({
    description: 'Datos a actualizar en el registro de historial',
    examples: {
      actualizacion_nota: {
        value: {
          finalGrade: 6.5,
          observations:
            'Nota actualizada tras revisión. Estudiante demostró mejora significativa.',
          adjustmentsUsed: [
            'Tiempo adicional',
            'Evaluación oral',
            'Material adaptado',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Registro actualizado exitosamente',
    example: {
      _id: '507f1f77bcf86cd799439016',
      finalGrade: 6.5,
      observations:
        'Nota actualizada tras revisión. Estudiante demostró mejora significativa.',
      adjustmentsUsed: [
        'Tiempo adicional',
        'Evaluación oral',
        'Material adaptado',
      ],
      updatedAt: '2025-01-15T16:45:00.000Z',
    },
  })
  @ApiResponse({ status: 400, description: 'Datos de actualización inválidos' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateAcademicHistoryDto: UpdateAcademicHistoryDto,
  ): Promise<AcademicHistory> {
    return this.academicHistoryService.update(id, updateAcademicHistoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({
    summary: 'Eliminar registro de historial académico',
    description:
      'Elimina permanentemente un registro de historial académico. Esta acción es irreversible y debe utilizarse con precaución.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId del registro a eliminar',
    example: '507f1f77bcf86cd799439016',
  })
  @ApiResponse({
    status: 204,
    description: 'Registro eliminado exitosamente - Sin contenido',
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  @ApiResponse({
    status: 409,
    description:
      'No se puede eliminar - Registro referenciado en reportes activos',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.academicHistoryService.remove(id);
  }
}
