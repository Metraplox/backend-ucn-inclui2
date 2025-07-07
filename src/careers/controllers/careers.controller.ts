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
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CareersService } from '../careers.service';
import { CreateCareerDto } from '../dto/create-career.dto';
import { UpdateCareerDto } from '../dto/update-career.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CareerResponseDto } from '../dto/career-response.dto';
import { StudentResponseDto } from '../../students/dto/student-response.dto';

@ApiTags('careers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Post()
  @Roles(UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Crear una nueva carrera académica',
    description:
      'Registra una nueva carrera en el sistema. La carrera se asocia automáticamente al departamento especificado. Solo coordinadores pueden crear carreras.',
  })
  @ApiBody({
    type: CreateCareerDto,
    description: 'Datos de la carrera a crear',
    examples: {
      ejemplo_carrera: {
        value: {
          name: 'Ingeniería Civil en Computación e Informática',
          code: 'ICCI',
          departmentId: '507f1f77bcf86cd799439011',
          description:
            'Carrera orientada al desarrollo de software y sistemas computacionales',
          duration: 5,
          isActive: true,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Carrera creada exitosamente y asociada al departamento.',
    type: CareerResponseDto,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Ingeniería Civil en Computación e Informática',
        code: 'ICCI',
        departmentId: '507f1f77bcf86cd799439012',
        headId: null,
        duration: 5,
        studentCount: 0,
        isActive: true,
        createdAt: '2025-06-19T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Datos de entrada inválidos - El código, nombre o departamento no son válidos.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Prohibido - Solo coordinadores pueden crear carreras.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflicto - Ya existe una carrera con ese código.',
  })
  create(@Body() createCareerDto: CreateCareerDto) {
    return this.careersService.create(createCareerDto);
  }

  @Get()
  @Roles(
    UserRole.COORDINADOR,
    UserRole.EDUCADORA_SOCIAL,
    UserRole.DIDDEC_STAFF,
    UserRole.JEFE_DEPARTAMENTO,
    UserRole.JEFE_CARRERA,
    UserRole.DOCENTE,
    UserRole.ESTUDIANTE,
  )
  @ApiOperation({
    summary: 'Listar todas las carreras',
    description:
      'Retorna la lista completa de carreras académicas del sistema. Incluye información sobre el número de estudiantes y el jefe de carrera si está asignado. Accesible para todos los usuarios autenticados.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de carreras obtenida exitosamente.',
    type: [CareerResponseDto],
    isArray: true,
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'Ingeniería Civil en Computación e Informática',
          code: 'ICCI',
          departmentId: '507f1f77bcf86cd799439012',
          department: {
            name: 'Departamento de Ciencias de la Computación',
            code: 'DCC',
          },
          headId: '507f1f77bcf86cd799439013',
          head: {
            nombreCompleto: 'Dra. Ana Martínez',
            email: 'ana.martinez@ucn.cl',
          },
          duration: 5,
          studentCount: 150,
          isActive: true,
        },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  findAll() {
    return this.careersService.findAll();
  }

  @Get(':id')
  @Roles(
    UserRole.COORDINADOR,
    UserRole.EDUCADORA_SOCIAL,
    UserRole.DIDDEC_STAFF,
    UserRole.JEFE_DEPARTAMENTO,
    UserRole.JEFE_CARRERA,
    UserRole.DOCENTE,
    UserRole.ESTUDIANTE,
  )
  @ApiOperation({
    summary: 'Obtener una carrera específica por ID',
    description:
      'Busca y retorna la información completa de una carrera utilizando su ID único. Incluye información del departamento y jefe de carrera.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la carrera (ObjectId de MongoDB)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Carrera encontrada exitosamente.',
    type: CareerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carrera no encontrada con el ID especificado.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  findOne(@Param('id') id: string) {
    return this.careersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Actualizar una carrera existente',
    description:
      'Actualiza parcialmente la información de una carrera. Solo se actualizan los campos enviados en el body. Solo coordinadores pueden actualizar carreras.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la carrera a actualizar',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateCareerDto,
    description: 'Campos de la carrera a actualizar',
    examples: {
      actualizar_nombre: {
        value: {
          name: 'Ingeniería Civil Computación e Informática',
        },
        description: 'Actualizar solo el nombre',
      },
      asignar_jefe: {
        value: {
          headId: '507f1f77bcf86cd799439013',
        },
        description: 'Asignar un jefe de carrera',
      },
      cambiar_departamento: {
        value: {
          departmentId: '507f1f77bcf86cd799439014',
        },
        description: 'Transferir carrera a otro departamento',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Carrera actualizada exitosamente.',
    type: CareerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carrera no encontrada con el ID especificado.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos - Validación fallida.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Prohibido - Solo coordinadores pueden actualizar carreras.',
  })
  update(@Param('id') id: string, @Body() updateCareerDto: UpdateCareerDto) {
    return this.careersService.update(id, updateCareerDto);
  }

  @Delete(':id')
  @Roles(UserRole.COORDINADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar una carrera',
    description:
      'Elimina permanentemente una carrera del sistema. Esta acción es irreversible. La carrera no debe tener estudiantes activos para poder ser eliminada.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la carrera a eliminar',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description:
      'Carrera eliminada exitosamente. Sin contenido en la respuesta.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carrera no encontrada con el ID especificado.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se puede eliminar - La carrera tiene estudiantes activos.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Prohibido - Solo coordinadores pueden eliminar carreras.',
  })
  remove(@Param('id') id: string) {
    return this.careersService.remove(id);
  }

  @Get(':id/students')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.JEFE_CARRERA)
  @ApiOperation({
    summary: 'Obtener estudiantes de una carrera',
    description:
      'Lista todos los estudiantes con NEE que pertenecen a una carrera específica. Permite filtrar por semestre académico. Solo accesible para coordinadores, educadoras sociales y el jefe de la carrera correspondiente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la carrera',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'semestre',
    required: false,
    description: 'Filtrar estudiantes por semestre académico',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[12]$',
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de estudiantes de la carrera obtenida exitosamente.',
    type: [StudentResponseDto],
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carrera no encontrada con el ID especificado.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Prohibido - Usuario no tiene los permisos necesarios para ver estudiantes de esta carrera.',
  })
  getStudents(@Param('id') id: string, @Query('semestre') semestre?: string) {
    return this.careersService.getStudents(id, semestre);
  }
}
