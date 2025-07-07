import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger'; // Importar decoradores de Swagger
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './schemas/student.schema';
import { UserPublicData } from '../users/interfaces/user-public-data.interface';
import { StudentResponseDto } from './dto/student-response.dto';

@ApiTags('students')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Crear un nuevo estudiante con NEE',
    description:
      'Registra un nuevo estudiante con necesidades educativas especiales en el sistema. Automáticamente asocia al estudiante con la carrera especificada y crea su perfil completo.',
  })
  @ApiResponse({
    status: 201,
    description: 'Estudiante creado exitosamente y asociado a la carrera.',
    type: StudentResponseDto,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        rut: '12345678-9',
        nombre: 'Juan',
        apellido: 'Pérez González',
        email: 'juan.perez@alumnos.ucn.cl',
        telefono: '+56912345678',
        careerId: '507f1f77bcf86cd799439012',
        semesterInfo: {
          currentSemester: '2025-1',
          entryYear: 2025,
          academicStatus: 'regular',
        },
        neeDetails: {
          primaryDiagnosis: 'Dislexia',
          categories: ['Aprendizaje'],
          supportLevel: 'moderado',
        },
        isActive: true,
        createdAt: '2025-06-19T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos de entrada inválidos. El RUT, email o datos de carrera son incorrectos.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido - Solo coordinadores y educadoras sociales pueden crear estudiantes.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto - El RUT o email ya está registrado en el sistema.',
  })
  @ApiBody({
    type: CreateStudentDto,
    description: 'Datos completos del estudiante a registrar',
    examples: {
      ejemplo_completo: {
        value: {
          rut: '12345678-9',
          nombre: 'Juan',
          apellido: 'Pérez González',
          email: 'juan.perez@alumnos.ucn.cl',
          telefono: '+56912345678',
          careerId: '507f1f77bcf86cd799439012',
          semesterInfo: {
            currentSemester: '2025-1',
            entryYear: 2025,
          },
          neeDetails: {
            primaryDiagnosis: 'Dislexia',
            categories: ['Aprendizaje'],
            supportLevel: 'moderado',
            additionalNotes: 'Requiere tiempo adicional en evaluaciones',
          },
        },
      },
    },
  })
  async create(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @Roles(
    UserRole.COORDINADOR,
    UserRole.EDUCADORA_SOCIAL,
    UserRole.DIDDEC_STAFF,
    UserRole.JEFE_CARRERA,
    UserRole.JEFE_DEPARTAMENTO,
    UserRole.DOCENTE,
  )
  @ApiOperation({
    summary: 'Listar estudiantes con NEE según rol y contexto',
    description:
      'Retorna la lista de estudiantes con filtrado por rol: COORDINADOR y EDUCADORA_SOCIAL ven todos, DIDDEC_STAFF accede a reportes, JEFE_CARRERA ve su carrera, JEFE_DEPARTAMENTO ve su departamento, DOCENTE ve sus estudiantes asignados. Permite filtrar por semestre académico.',
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
    description: 'Lista de estudiantes obtenida exitosamente.',
    type: [StudentResponseDto],
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
  async findAll(@Query('semester') semester?: string): Promise<Student[]> {
    // Actualizamos el servicio para que acepte el parámetro de semestre
    return this.studentsService.findAll(semester);
  }

  @Get('profile')
  @Roles(UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Obtener mi perfil académico como estudiante',
    description:
      'ENDPOINT CON PROBLEMAS CONOCIDOS: Retorna el perfil completo del estudiante autenticado. Busca al estudiante por el email del usuario JWT. Actualmente puede fallar con error 500 si el estudiante no tiene cuenta de usuario asociada correctamente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil académico del estudiante obtenido exitosamente.',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description:
      'Estudiante no encontrado - El email del usuario no corresponde a ningún estudiante registrado.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido - Solo estudiantes pueden acceder a su propio perfil.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Error interno - Problema conocido cuando el estudiante no tiene cuenta de usuario asociada.',
  })
  async getProfile(@CurrentUser() user: any): Promise<Student> {
    if (!user) {
      throw new BadRequestException('Usuario no encontrado en token JWT');
    }

    // Usar la implementación que funcionaba: buscar por ID del usuario
    return this.studentsService.findByUserId(user._id);
  }

  @Get(':id')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Obtener un estudiante específico por ID',
    description:
      'Busca y retorna la información completa de un estudiante utilizando su ID único de MongoDB.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del estudiante (ObjectId de MongoDB)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Información completa del estudiante encontrada.',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Estudiante no encontrado con el ID especificado.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido - Solo coordinadores y educadoras sociales tienen acceso.',
  })
  async findOne(@Param('id') id: string): Promise<Student> {
    // El servicio ahora lanza NotFoundException si no se encuentra.
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Actualizar información de un estudiante',
    description:
      'Actualiza parcialmente los datos de un estudiante existente. Solo se actualizan los campos enviados en el body.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del estudiante a actualizar',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateStudentDto,
    description:
      'Campos del estudiante a actualizar. Solo incluir los campos que se desean modificar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estudiante actualizado exitosamente.',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Estudiante no encontrado con el ID especificado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos - Validación fallida.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido - Solo coordinadores y educadoras sociales pueden actualizar estudiantes.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    // El servicio ahora lanza NotFoundException si no se encuentra o no se puede actualizar.
    return this.studentsService.update(id, updateStudentDto);
  }

  @Patch(':id/semester/:semester')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Actualizar información semestral de un estudiante',
    description:
      'Actualiza o renueva la información del estudiante para un semestre específico. Útil para actualizar estado académico, renovar ajustes o modificar información que cambia cada semestre.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del estudiante',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'semester',
    description: 'Semestre académico a actualizar',
    type: String,
    example: '2025-1',
    schema: {
      pattern: '^\\d{4}-[12]$',
    },
  })
  @ApiBody({
    type: UpdateStudentDto,
    description: 'Información semestral a actualizar',
    examples: {
      renovacion_semestral: {
        value: {
          semesterInfo: {
            currentSemester: '2025-2',
            academicStatus: 'regular',
          },
          neeDetails: {
            supportLevel: 'alto',
            additionalNotes: 'Aumentar apoyo este semestre',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Información semestral actualizada exitosamente.',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Estudiante no encontrado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Formato de semestre inválido o datos incorrectos.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido - Solo coordinadores y educadoras sociales pueden actualizar información semestral.',
  })
  async updateSemester(
    @Param('id') id: string,
    @Param('semester') semester: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    return this.studentsService.updateSemester(id, semester, updateStudentDto);
  }

  @Delete(':id')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un estudiante del sistema',
    description:
      'Elimina permanentemente un estudiante y toda su información asociada. Esta acción es irreversible y también elimina ajustes, documentos y registros relacionados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del estudiante a eliminar',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 204,
    description:
      'Estudiante eliminado exitosamente. Sin contenido en la respuesta.',
  })
  @ApiResponse({
    status: 404,
    description: 'Estudiante no encontrado con el ID especificado.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido - Solo coordinadores y educadoras sociales pueden eliminar estudiantes.',
  })
  async remove(@Param('id') id: string): Promise<void> {
    // El servicio ahora lanza NotFoundException si no se encuentra para eliminar.
    await this.studentsService.remove(id);
    // No se retorna nada en el cuerpo para una respuesta 204
  }
}
