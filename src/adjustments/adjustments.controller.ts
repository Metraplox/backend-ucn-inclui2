import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AdjustmentsService } from './adjustments.service';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { UpdateAdjustmentDto } from './dto/update-adjustment.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Adjustment, AdjustmentStatus } from './schemas/adjustment.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { UserPublicData } from '../users/interfaces/user-public-data.interface';
import { Types } from 'mongoose';
import { AdjustmentResponseDto } from './dto/adjustment-response.dto';

@ApiTags('adjustments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('adjustments')
export class AdjustmentsController {
  constructor(private readonly adjustmentsService: AdjustmentsService) {}

  @Post()
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Crear nuevo ajuste razonable',
    description:
      'Registra un nuevo ajuste académico para un estudiante con NEE',
  })
  @ApiResponse({
    status: 201,
    description: 'Ajuste creado exitosamente',
    type: AdjustmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o faltantes' })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: El ajuste ya existe para este curso/estudiante',
  })
  @ApiBody({
    type: CreateAdjustmentDto,
    examples: {
      ejemplo1: {
        value: {
          studentRut: '12345678-9',
          currentAdjustments: [
            {
              type: 'tiempo_extra',
              courseNrc: 'MAT101-1',
              approvedBy: 'coordinadora@ucn.cl',
              approvedAt: '2025-04-10T00:00:00Z',
              requiresSemesterConfirmation: true,
              expirationDate: '2025-12-31T00:00:00Z',
            },
          ],
        },
      },
    },
  })
  async create(
    @Body() createAdjustmentDto: CreateAdjustmentDto,
  ): Promise<Adjustment> {
    return this.adjustmentsService.create(createAdjustmentDto);
  }

  @Get()
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.JEFE_CARRERA, UserRole.JEFE_DEPARTAMENTO, UserRole.DOCENTE)
  @ApiOperation({
    summary: 'Listar todos los ajustes',
    description:
      'Obtiene todos los ajustes razonables registrados con opción de filtrado',
  })
  @ApiQuery({
    name: 'studentRut',
    required: false,
    description: 'Filtrar por RUT de estudiante',
    example: '12345678-9',
  })
  @ApiQuery({
    name: 'courseNrc',
    required: false,
    description: 'Filtrar por código NRC del curso',
    example: 'MAT101-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ajustes encontrados',
    type: [AdjustmentResponseDto],
  })
  async findAll(): Promise<Adjustment[]> {
    return this.adjustmentsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.JEFE_CARRERA, UserRole.JEFE_DEPARTAMENTO, UserRole.DOCENTE, UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Obtener ajuste por ID',
    description: 'Recupera un ajuste específico usando su ID de MongoDB',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ajuste en MongoDB',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Ajuste encontrado',
    type: AdjustmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ajuste no encontrado',
  })
  async findOne(@Param('id') id: string, @Req() req: Request & { user: UserPublicData }): Promise<Adjustment> {
    const adjustment = await this.adjustmentsService.findOne(id);
    if (!adjustment) {
      throw new NotFoundException(`Adjustment with ID "${id}" not found`);
    }

    // Autorización: un estudiante solo puede ver sus propios ajustes
    if (req.user.roles.includes(UserRole.ESTUDIANTE)) {
      if (adjustment.studentId.toString() !== req.user.studentId) {
        throw new NotFoundException('Ajuste no encontrado o no autorizado');
      }
    }

    return adjustment;
  }

  @Patch(':id')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Actualizar ajuste existente',
    description: 'Actualiza parcialmente un ajuste razonable',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ajuste en MongoDB',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Ajuste actualizado',
    type: AdjustmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ajuste no encontrado' })
  @ApiBody({
    type: UpdateAdjustmentDto,
    description: 'Solo incluir campos a modificar',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAdjustmentDto: UpdateAdjustmentDto,
  ): Promise<Adjustment> {
    const updateAdjustment = await this.adjustmentsService.update(
      id,
      updateAdjustmentDto,
    );
    if (!updateAdjustment) {
      throw new NotFoundException(`Adjustment with ID "${id}" not found`);
    }
    return updateAdjustment;
  }

  @Delete(':id')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Eliminar ajuste',
    description: 'Elimina permanentemente un ajuste razonable',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ajuste en MongoDB',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 204,
    description: 'Ajuste eliminado',
  })
  @ApiResponse({
    status: 404,
    description: 'Ajuste no encontrado',
  })
  async remove(@Param('id') id: string): Promise<void> {
    const result = await this.adjustmentsService.remove(id);
    if (!result || result.deletedCount === 0) {
      throw new NotFoundException(`Adjustment with ID "${id}" not found`);
    }
  }

  @Get('student/:studentId')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Obtener ajustes por estudiante',
    description:
      'Recupera todos los ajustes asociados a un estudiante específico',
  })
  @ApiParam({
    name: 'studentId',
    description: 'ID del estudiante',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por estado del ajuste',
    enum: AdjustmentStatus,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ajustes del estudiante',
    type: [AdjustmentResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Estudiante no encontrado',
  })
  async findByStudent(
    @Param('studentId') studentId: string,
    @Req() req: Request & { user: UserPublicData },
    @Query('status') status?: AdjustmentStatus,
  ): Promise<Adjustment[]> {
    // Validar que el ID sea un ObjectId válido
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('ID de estudiante inválido');
    }

    // Si el usuario es un estudiante, verificar que esté accediendo a sus propios ajustes
    if (
      req.user.roles.includes(UserRole.ESTUDIANTE) &&
      req.user.studentId !== studentId
    ) {
      throw new NotFoundException('Ajustes no encontrados o no autorizados');
    }

    return this.adjustmentsService.findByStudentId(studentId, status);
  }

  @Get('department/:departmentId')
  @Roles(UserRole.JEFE_DEPARTAMENTO)
  @ApiOperation({
    summary: 'Obtener ajustes por ID de departamento',
    description:
      'Recupera todos los ajustes para estudiantes que pertenecen a un departamento específico',
  })
  @ApiParam({
    name: 'departmentId',
    description: 'ID del departamento',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'semester',
    required: true,
    description: 'Filtrar por semestre académico (ej. 2025-1)',
    example: '2025-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ajustes del departamento',
    type: [AdjustmentResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Departamento no encontrado',
  })
  async findByDepartment(
    @Param('departmentId') departmentId: string,
    @Query('semester') semester: string,
  ): Promise<Adjustment[]> {
    return this.adjustmentsService.findByDepartment(departmentId, semester);
  }

  @Get('course/:courseId')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.DOCENTE)
  @ApiOperation({
    summary: 'Obtener ajustes por ID de curso',
    description:
      'Recupera todos los ajustes asociados a un curso específico, accesible para docentes del mismo curso',
  })
  @ApiParam({
    name: 'courseId',
    description: 'ID del curso',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ajustes del curso',
    type: [AdjustmentResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Curso no encontrado',
  })
  async findByCourse(
    @Param('courseId') courseId: string,
  ): Promise<Adjustment[]> {
    return this.adjustmentsService.findByCourseId(courseId);
  }

  @Post(':id/documents/:documentId')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Asociar documento a ajuste',
    description:
      'Vincula un documento existente a un ajuste razonable específico',
  })
  @ApiParam({ name: 'id', description: 'ID del ajuste' })
  @ApiParam({ name: 'documentId', description: 'ID del documento' })
  @ApiResponse({
    status: 200,
    description: 'Documento asociado exitosamente',
    type: AdjustmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ajuste o documento no encontrado' })
  async associateDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
  ): Promise<Adjustment> {
    // Validar que los IDs sean ObjectId válidos
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de ajuste o documento inválido');
    }
    return this.adjustmentsService.associateDocument(id, documentId);
  }

  @Patch(':id/status/:status')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.JEFE_CARRERA)
  @ApiOperation({
    summary: 'Actualizar estado de un ajuste',
    description: 'Cambia el estado de un ajuste académico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ajuste',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'status',
    description: 'Nuevo estado del ajuste',
    enum: AdjustmentStatus,
  })
  @ApiQuery({
    name: 'adjustmentIndex',
    required: true,
    description: 'Índice del ajuste específico en el array de ajustes del estudiante',
    example: 0,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        comments: {
          type: 'string',
          description: 'Comentarios opcionales sobre el cambio de estado',
          example: 'Aprobado por junta académica.',
        },
      },
    },
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado correctamente',
    type: AdjustmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ajuste no encontrado',
  })
  async updateStatus(
    @Param('id') id: string,
    @Param('status') status: AdjustmentStatus,
    @Query('adjustmentIndex') adjustmentIndex: number,
    @Body('comments') comments: string,
    @Req() req: Request & { user: UserPublicData },
  ): Promise<Adjustment> {
    if (typeof adjustmentIndex !== 'number' || adjustmentIndex < 0) {
      throw new BadRequestException('El parámetro "adjustmentIndex" es requerido y debe ser un número positivo.');
    }
    return this.adjustmentsService.updateStatus(
      id,
      adjustmentIndex,
      status,
      req.user._id,
      comments,
    );
  }

  @Patch(':id/read')
  @Roles(UserRole.DOCENTE)
  @ApiOperation({
    summary: 'Marcar ajuste como leído por docente',
    description:
      'Permite marcar un ajuste como leído por el docente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ajuste',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'adjustmentIndex',
    required: true,
    description: 'Índice del ajuste específico en el array de ajustes del estudiante',
    example: 0,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        comments: {
          type: 'string',
          description: 'Comentarios opcionales del docente',
          example: 'Recibido y entendido.',
        },
      },
    },
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Ajuste marcado como leído',
    type: AdjustmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ajuste no encontrado',
  })
  async markAsRead(
    @Param('id') id: string,
    @Query('adjustmentIndex') adjustmentIndex: number,
    @Body('comments') comments: string,
    @Req() req: Request & { user: UserPublicData },
  ): Promise<Adjustment> {
    // Validar que el ID sea un ObjectId válido
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de ajuste inválido');
    }
    if (typeof adjustmentIndex !== 'number' || adjustmentIndex < 0) {
      throw new BadRequestException('El parámetro "adjustmentIndex" es requerido y debe ser un número positivo.');
    }

    return this.adjustmentsService.markAsRead(
      id,
      adjustmentIndex,
      req.user._id,
      comments,
    );
  }
}
