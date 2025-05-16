import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger'; // Importar decoradores de Swagger
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

@ApiTags('students')
@ApiBearerAuth() // Indica que se requiere autenticación Bearer (JWT) para Swagger
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Crear un nuevo estudiante (Admin, Staff)' })
  @ApiResponse({ status: 201, description: 'El estudiante ha sido creado exitosamente.', type: Student })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  @ApiBody({ type: CreateStudentDto }) // Describe el cuerpo esperado
  async create(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Obtener todos los estudiantes (Admin, Staff)' })
  @ApiResponse({ status: 200, description: 'Lista de estudiantes.', type: [Student] })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async findAll(): Promise<Student[]> {
    return this.studentsService.findAll();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Obtener el perfil académico del estudiante actual' })
  @ApiResponse({ status: 200, description: 'Perfil académico del estudiante.', type: Student })
  @ApiResponse({ status: 404, description: 'Perfil de estudiante no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getProfile(@CurrentUser() user: UserPublicData): Promise<Student> {
    return this.studentsService.findByEmail(user.email);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Obtener un estudiante por su ID (Admin, Staff)' })
  @ApiParam({ name: 'id', description: 'ID único del estudiante (ObjectId)', type: String })
  @ApiResponse({ status: 200, description: 'Detalles del estudiante.', type: Student })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async findOne(@Param('id') id: string): Promise<Student> {
    // El servicio ahora lanza NotFoundException si no se encuentra.
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Actualizar un estudiante existente (Admin, Staff)' })
  @ApiParam({ name: 'id', description: 'ID único del estudiante a actualizar', type: String })
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({ status: 200, description: 'Estudiante actualizado exitosamente.', type: Student })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto): Promise<Student> {
    // El servicio ahora lanza NotFoundException si no se encuentra o no se puede actualizar.
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.NO_CONTENT) // Estándar para DELETE exitoso sin contenido de respuesta
  @ApiOperation({ summary: 'Eliminar un estudiante (Admin, Staff)' })
  @ApiParam({ name: 'id', description: 'ID único del estudiante a eliminar', type: String })
  @ApiResponse({ status: 204, description: 'Estudiante eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async remove(@Param('id') id: string): Promise<void> {
    // El servicio ahora lanza NotFoundException si no se encuentra para eliminar.
    await this.studentsService.remove(id);
    // No se retorna nada en el cuerpo para una respuesta 204
  }
}
