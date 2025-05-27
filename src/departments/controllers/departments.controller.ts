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
} from '@nestjs/swagger';
import { Department } from '../schemas/department.schema';

// Test comment to trigger re-lint
@ApiTags('departments')
@Controller('departments')
@ApiBearerAuth()
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF) // Solo admin y staff pueden crear departamentos
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo departamento' })
  @ApiResponse({
    status: 201,
    description: 'Departamento creado exitosamente.',
    type: Department,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
  ): Promise<Department> {
    console.log('--- DTO Recibido en DepartmentsController.create ---');
    console.log(JSON.stringify(createDepartmentDto, null, 2));
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard) // Todos los usuarios autenticados pueden ver departamentos
  @ApiOperation({ summary: 'Obtener todos los departamentos' })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre. Devuelve todos si no se especifica.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de departamentos.',
    type: [Department],
  })
  async findAll(@Query('semester') semester?: string): Promise<Department[]> {
    if (semester) {
      return this.departmentsService.findAll(semester);
    }
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener un departamento por ID' })
  @ApiResponse({ status: 200, description: 'Departamento encontrado.', type: Department })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado.' })
  async findOne(@Param('id') id: string): Promise<Department> {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Actualizar un departamento' })
  @ApiResponse({ status: 200, description: 'Departamento actualizado.', type: Department })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado.' })
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un departamento (solo Admin)' })
  @ApiResponse({ status: 204, description: 'Departamento eliminado.' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.departmentsService.remove(id);
  }
}
// End test comment
