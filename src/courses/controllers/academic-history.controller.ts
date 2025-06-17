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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { AcademicHistoryService } from '../services/academic-history.service';
import { AcademicHistory } from '../schemas/academic-history.schema';
import { CreateAcademicHistoryDto } from '../dto/create-academic-history.dto';
import { UpdateAcademicHistoryDto } from '../dto/update-academic-history.dto';

@ApiTags('academic-history')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academic-history')
export class AcademicHistoryController {
  constructor(private readonly academicHistoryService: AcademicHistoryService) {}

  @Post()
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({ summary: 'Crear un nuevo registro de historial académico' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Registro de historial académico creado exitosamente',
    type: AcademicHistory,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - No tiene permisos suficientes' })
  async create(@Body() createAcademicHistoryDto: CreateAcademicHistoryDto): Promise<AcademicHistory> {
    return this.academicHistoryService.create(createAcademicHistoryDto);
  }

  @Get()
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({ summary: 'Obtener todos los registros de historial académico' })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre académico (ej: 2025-1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros de historial académico',
    type: [AcademicHistory],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - No tiene permisos suficientes' })
  async findAll(@Query('semester') semester?: string): Promise<AcademicHistory[]> {
    return this.academicHistoryService.findAll(semester);
  }

  @Get('student/:studentId')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({ summary: 'Obtener historial académico de un estudiante' })
  @ApiParam({ name: 'studentId', description: 'ID del estudiante' })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre académico (ej: 2025-1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial académico del estudiante',
    type: [AcademicHistory],
  })
  async findByStudent(
    @Param('studentId') studentId: string,
    @Query('semester') semester?: string,
  ): Promise<AcademicHistory[]> {
    return this.academicHistoryService.findByStudent(studentId, semester);
  }

  @Get('course/:courseId')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({ summary: 'Obtener historial académico de un curso' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre académico (ej: 2025-1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial académico del curso',
    type: [AcademicHistory],
  })
  async findByCourse(
    @Param('courseId') courseId: string,
    @Query('semester') semester?: string,
  ): Promise<AcademicHistory[]> {
    return this.academicHistoryService.findByCourse(courseId, semester);
  }

  @Get(':id')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({ summary: 'Obtener un registro específico de historial académico' })
  @ApiParam({ name: 'id', description: 'ID del registro de historial académico' })
  @ApiResponse({
    status: 200,
    description: 'Registro de historial académico encontrado',
    type: AcademicHistory,
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  async findOne(@Param('id') id: string): Promise<AcademicHistory> {
    return this.academicHistoryService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({ summary: 'Actualizar un registro de historial académico' })
  @ApiParam({ name: 'id', description: 'ID del registro a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Registro actualizado exitosamente',
    type: AcademicHistory,
  })
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
  @ApiOperation({ summary: 'Eliminar un registro de historial académico' })
  @ApiParam({ name: 'id', description: 'ID del registro a eliminar' })
  @ApiResponse({
    status: 204,
    description: 'Registro eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.academicHistoryService.remove(id);
  }
}
