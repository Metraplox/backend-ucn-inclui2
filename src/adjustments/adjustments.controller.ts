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

@ApiTags('adjustments')
@ApiBearerAuth() // Para autenticación JWT (opcional)
@Controller('adjustments')
export class AdjustmentsController {
  constructor(private readonly adjustmentsService: AdjustmentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nuevo ajuste razonable',
    description:
      'Registra un nuevo ajuste académico para un estudiante con NEE',
  })
  @ApiResponse({
    status: 201,
    description: 'Ajuste creado exitosamente',
    type: Adjustment,
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
    type: [Adjustment],
  })
  async findAll(): Promise<Adjustment[]> {
    return this.adjustmentsService.findAll();
  }

  @Get(':id')
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
    type: Adjustment,
  })
  @ApiResponse({
    status: 404,
    description: 'Ajuste no encontrado',
  })
  async findOne(@Param('id') id: string): Promise<Adjustment> {
    const adjustment = await this.adjustmentsService.findOne(id);
    if (!adjustment) {
      throw new NotFoundException(`Adjustment with ID "${id}" not found`);
    }
    return adjustment;
  }

  @Patch(':id')
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
    type: Adjustment,
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STUDENT)
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
    type: [Adjustment],
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
      req.user.roles.includes(UserRole.STUDENT) &&
      req.user._id !== studentId
    ) {
      throw new BadRequestException(
        'No puedes acceder a los ajustes de otro estudiante',
      );
    }

    return this.adjustmentsService.findByStudentId(studentId, status);
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Obtener ajustes por curso',
    description: 'Recupera todos los ajustes asociados a un curso específico',
  })
  @ApiParam({
    name: 'courseId',
    description: 'ID del curso',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ajustes del curso',
    type: [Adjustment],
  })
  async findByCourse(
    @Param('courseId') courseId: string,
  ): Promise<Adjustment[]> {
    // Validar que el ID sea un ObjectId válido
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('ID de curso inválido');
    }
    return this.adjustmentsService.findByCourseId(courseId);
  }

  @Patch(':id/associate-document/:documentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Asociar documento a un ajuste',
    description: 'Asocia un documento existente a un ajuste académico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ajuste',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'documentId',
    description: 'ID del documento a asociar',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Documento asociado correctamente',
    type: Adjustment,
  })
  @ApiResponse({
    status: 404,
    description: 'Ajuste o documento no encontrado',
  })
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
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
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado correctamente',
    type: Adjustment,
  })
  @ApiResponse({
    status: 404,
    description: 'Ajuste no encontrado',
  })
  async updateStatus(
    @Param('id') id: string,
    @Param('status') status: AdjustmentStatus,
    @Req() req: Request & { user: UserPublicData },
  ): Promise<Adjustment> {
    // Validar que el ID sea un ObjectId válido
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de ajuste inválido');
    }

    // Validar que el estado sea válido
    if (!Object.values(AdjustmentStatus).includes(status)) {
      throw new BadRequestException('Estado de ajuste inválido');
    }

    // Suponiendo que adjustmentIndex viene en el body o query, aquí lo obtendremos de req.body.adjustmentIndex
const adjustmentIndex = (req.body && (req.body as any).adjustmentIndex) ?? 0;
return this.adjustmentsService.updateStatus(id, adjustmentIndex, status, req.user._id);
  }
}
