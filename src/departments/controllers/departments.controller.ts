import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DepartmentsService } from '../departments.service';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Department } from '../schemas/department.schema';
import { DepartmentResponseDto } from '../dto/department-response.dto';

// Test comment to trigger re-lint
@ApiTags('departments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles(UserRole.COORDINADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear un nuevo departamento académico',
    description: 'Registra un nuevo departamento en el sistema. Solo los coordinadores pueden crear departamentos. El código del departamento debe ser único.'
  })
  @ApiBody({
    type: CreateDepartmentDto,
    description: 'Datos del departamento a crear',
    examples: {
      ejemplo_departamento: {
        value: {
          name: 'Departamento de Ciencias de la Computación',
          code: 'DCC',
          facultyId: '507f1f77bcf86cd799439011',
          description: 'Departamento encargado de las carreras de computación e informática',
          isActive: true
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Departamento creado exitosamente.',
    type: DepartmentResponseDto,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Departamento de Ciencias de la Computación',
        code: 'DCC',
        facultyId: '507f1f77bcf86cd799439012',
        careerIds: [],
        headId: null,
        isActive: true,
        createdAt: '2025-06-19T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos - El código o nombre no cumplen los requisitos.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token JWT inválido o expirado.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - Solo coordinadores pueden crear departamentos.' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflicto - Ya existe un departamento con ese código.' 
  })
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
  ): Promise<Department> {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.DIDDEC_STAFF, UserRole.JEFE_DEPARTAMENTO, UserRole.JEFE_CARRERA, UserRole.DOCENTE, UserRole.ESTUDIANTE)
  @ApiOperation({ 
    summary: 'Listar todos los departamentos',
    description: 'Retorna la lista completa de departamentos académicos. Todos los usuarios autenticados pueden ver esta información. Permite filtrar por semestre.'
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar departamentos activos en un semestre específico',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[12]$'
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de departamentos obtenida exitosamente.',
    type: [DepartmentResponseDto],
    isArray: true,
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token JWT inválido o expirado.' 
  })
  async findAll(@Query('semester') semester?: string): Promise<Department[]> {
    if (semester) {
      return this.departmentsService.findAll(semester);
    }
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.DIDDEC_STAFF, UserRole.JEFE_DEPARTAMENTO, UserRole.JEFE_CARRERA, UserRole.DOCENTE, UserRole.ESTUDIANTE)
  @ApiOperation({ 
    summary: 'Obtener un departamento específico por ID',
    description: 'Busca y retorna la información completa de un departamento utilizando su ID único. Incluye información del jefe de departamento si está asignado.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del departamento (ObjectId de MongoDB)',
    type: String,
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Departamento encontrado exitosamente.', 
    type: DepartmentResponseDto,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Departamento de Ciencias de la Computación',
        code: 'DCC',
        facultyId: '507f1f77bcf86cd799439012',
        careerIds: ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'],
        headId: '507f1f77bcf86cd799439015',
        head: {
          _id: '507f1f77bcf86cd799439015',
          nombreCompleto: 'Dr. Pedro Sánchez',
          email: 'pedro.sanchez@ucn.cl'
        },
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-06-19T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Departamento no encontrado con el ID especificado.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token JWT inválido o expirado.' 
  })
  async findOne(@Param('id') id: string): Promise<Department> {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.COORDINADOR)
  @ApiOperation({ 
    summary: 'Actualizar un departamento existente',
    description: 'Actualiza parcialmente la información de un departamento. Solo se actualizan los campos enviados en el body. Solo coordinadores pueden actualizar departamentos.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del departamento a actualizar',
    type: String,
    example: '507f1f77bcf86cd799439011'
  })
  @ApiBody({
    type: UpdateDepartmentDto,
    description: 'Campos del departamento a actualizar',
    examples: {
      actualizar_nombre: {
        value: {
          name: 'Departamento de Ciencias Computacionales'
        },
        description: 'Actualizar solo el nombre'
      },
      asignar_jefe: {
        value: {
          headId: '507f1f77bcf86cd799439015'
        },
        description: 'Asignar un jefe de departamento'
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Departamento actualizado exitosamente.', 
    type: DepartmentResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Departamento no encontrado con el ID especificado.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos - Validación fallida.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token JWT inválido o expirado.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - Solo coordinadores pueden actualizar departamentos.' 
  })
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.COORDINADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Eliminar un departamento',
    description: 'Elimina permanentemente un departamento del sistema. Esta acción es irreversible. El departamento no debe tener carreras asociadas para poder ser eliminado.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del departamento a eliminar',
    type: String,
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Departamento eliminado exitosamente. Sin contenido en la respuesta.' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Departamento no encontrado con el ID especificado.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'No se puede eliminar - El departamento tiene carreras asociadas.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token JWT inválido o expirado.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - Solo coordinadores pueden eliminar departamentos.' 
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.departmentsService.remove(id);
  }
}
// End test comment
