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
@ApiBearerAuth() // Indica que se requiere autenticación Bearer (JWT) para Swagger
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Crear un nuevo estudiante',
    description: 'Crea un nuevo estudiante y lo asocia automáticamente a la carrera especificada',
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Estudiante creado exitosamente',
    type: StudentResponseDto
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - No tiene permisos suficientes' })
  @ApiBody({ type: CreateStudentDto })
  async create(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Obtener todos los estudiantes',
    description: 'Retorna la lista de todos los estudiantes registrados en el sistema',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre académico (ej: 2025-1)',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de estudiantes obtenida exitosamente',
    type: [StudentResponseDto]
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - No tiene permisos suficientes' })
  async findAll(@Query('semester') semester?: string): Promise<Student[]> {
    // Actualizamos el servicio para que acepte el parámetro de semestre
    return this.studentsService.findAll(semester);
  }

  @Get('profile')
  @Roles(UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Obtener el perfil académico del estudiante actual',
    description: 'Obtiene el perfil completo del estudiante autenticado usando la relación con su cuenta de usuario'
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil académico del estudiante.',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Perfil de estudiante no encontrado.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido - El usuario no tiene rol de estudiante.' })
  async getProfile(@CurrentUser() user: UserPublicData): Promise<Student> {
    // Usar el ID del usuario para buscar el perfil de estudiante relacionado
    return this.studentsService.findByUserId(user._id);
  }

  @Get(':id')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({ summary: 'Obtener un estudiante por su ID (Coordinador, Educadora Social)' })
  @ApiParam({
    name: 'id',
    description: 'ID único del estudiante (ObjectId)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles del estudiante.',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async findOne(@Param('id') id: string): Promise<Student> {
    // El servicio ahora lanza NotFoundException si no se encuentra.
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Actualizar un estudiante existente (Coordinador, Educadora Social)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del estudiante a actualizar',
    type: String,
  })
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({
    status: 200,
    description: 'Estudiante actualizado exitosamente.',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
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
    summary: 'Actualizar información semestral de un estudiante (Coordinador, Educadora Social)',
    description: 'Permite actualizar información relevante del estudiante para el semestre indicado. Útil para renovar o modificar datos cada semestre.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del estudiante a actualizar',
    type: String,
  })
  @ApiParam({
    name: 'semester',
    description: 'Semestre académico a actualizar (formato YYYY-1 o YYYY-2)',
    type: String,
  })
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({
    status: 200,
    description: 'Información semestral del estudiante actualizada exitosamente.',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async updateSemester(
    @Param('id') id: string,
    @Param('semester') semester: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    return this.studentsService.updateSemester(id, semester, updateStudentDto);
  }

  @Delete(':id')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @HttpCode(HttpStatus.NO_CONTENT) // Estándar para DELETE exitoso sin contenido de respuesta
  @ApiOperation({ summary: 'Eliminar un estudiante (Coordinador, Educadora Social)' })
  @ApiParam({
    name: 'id',
    description: 'ID único del estudiante a eliminar',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Estudiante eliminado exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async remove(@Param('id') id: string): Promise<void> {
    // El servicio ahora lanza NotFoundException si no se encuentra para eliminar.
    await this.studentsService.remove(id);
    // No se retorna nada en el cuerpo para una respuesta 204
  }
}
