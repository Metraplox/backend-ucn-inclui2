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
  HttpCode,
  HttpStatus,
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
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('adjustments')
export class AdjustmentsController {
  constructor(private readonly adjustmentsService: AdjustmentsService) {}

  @Post()
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Crear nuevo ajuste razonable para estudiante con NEE',
    description: 'Registra uno o varios ajustes académicos para un estudiante. Los ajustes pueden incluir tiempo extra, uso de tecnología, formatos alternativos, etc. Cada ajuste está asociado a un curso específico y tiene fecha de expiración.',
  })
  @ApiBody({
    type: CreateAdjustmentDto,
    description: 'Datos del ajuste o ajustes a crear para el estudiante',
    examples: {
      ajuste_multiple: {
        value: {
          studentRut: '12345678-9',
          currentAdjustments: [
            {
              type: 'tiempo_extra',
              courseNrc: 'MAT101-1',
              description: '50% de tiempo adicional en evaluaciones',
              approvedBy: 'coordinadora@ucn.cl',
              approvedAt: '2025-04-10T00:00:00Z',
              requiresSemesterConfirmation: true,
              expirationDate: '2025-12-31T00:00:00Z',
            },
            {
              type: 'formato_alternativo',
              courseNrc: 'FIS201-2',
              description: 'Evaluaciones orales en lugar de escritas',
              approvedBy: 'educadora@ucn.cl',
              approvedAt: '2025-04-10T00:00:00Z',
              requiresSemesterConfirmation: false,
              expirationDate: '2025-07-31T00:00:00Z',
            }
          ],
        },
        description: 'Múltiples ajustes para diferentes cursos'
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Ajuste(s) creado(s) exitosamente.',
    type: AdjustmentResponseDto,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        studentId: '507f1f77bcf86cd799439012',
        studentRut: '12345678-9',
        currentAdjustments: [
          {
            type: 'tiempo_extra',
            courseId: '507f1f77bcf86cd799439013',
            courseNrc: 'MAT101-1',
            description: '50% de tiempo adicional en evaluaciones',
            status: 'active',
            approvedBy: '507f1f77bcf86cd799439014',
            approvedAt: '2025-04-10T00:00:00Z',
            requiresSemesterConfirmation: true,
            expirationDate: '2025-12-31T00:00:00Z',
            readByTeacher: false
          }
        ],
        createdAt: '2025-06-19T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos - RUT incorrecto, curso no existe o fechas inválidas.' 
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto - Ya existe un ajuste del mismo tipo para el estudiante en ese curso.',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token JWT inválido o expirado.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - Solo coordinadores y educadoras sociales pueden crear ajustes.' 
  })
  async create(
    @Body() createAdjustmentDto: CreateAdjustmentDto,
  ): Promise<Adjustment> {
    return this.adjustmentsService.create(createAdjustmentDto);
  }

  @Get()
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.JEFE_CARRERA, UserRole.JEFE_DEPARTAMENTO, UserRole.DOCENTE)
  @ApiOperation({
    summary: 'Listar todos los ajustes del sistema',
    description: 'Obtiene todos los ajustes razonables registrados. Los docentes solo ven ajustes de sus cursos. Permite filtrar por RUT de estudiante o código NRC del curso.',
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
    description: 'Lista de ajustes encontrados.',
    type: [AdjustmentResponseDto],
    isArray: true,
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token JWT inválido o expirado.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - Usuario no tiene los roles requeridos.' 
  })
  async findAll(): Promise<Adjustment[]> {
    return this.adjustmentsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.JEFE_CARRERA, UserRole.JEFE_DEPARTAMENTO, UserRole.DOCENTE, UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Obtener un ajuste específico por ID',
    description: 'Recupera los detalles completos de un ajuste. Los estudiantes solo pueden ver sus propios ajustes. Los docentes solo pueden ver ajustes de sus cursos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ajuste (ObjectId de MongoDB)',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Ajuste encontrado.',
    type: AdjustmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ajuste no encontrado o no autorizado para verlo.',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token JWT inválido o expirado.' 
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
    summary: 'Actualizar un ajuste existente',
    description: 'Actualiza parcialmente la información de un ajuste. Útil para modificar descripción, fechas o agregar nuevos ajustes al documento.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ajuste a actualizar',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateAdjustmentDto,
    description: 'Campos del ajuste a actualizar',
    examples: {
      modificar_ajuste: {
        value: {
          currentAdjustments: [
            {
              type: 'tiempo_extra',
              courseNrc: 'MAT101-1',
              description: 'Aumentar a 100% de tiempo adicional',
              expirationDate: '2026-12-31T00:00:00Z',
            }
          ]
        },
        description: 'Modificar un ajuste existente'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Ajuste actualizado exitosamente.',
    type: AdjustmentResponseDto,
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Ajuste no encontrado con el ID especificado.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token JWT inválido o expirado.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - Solo coordinadores y educadoras sociales pueden actualizar ajustes.' 
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un ajuste',
    description: 'Elimina permanentemente un documento de ajustes completo. Esta acción es irreversible y elimina TODOS los ajustes del estudiante en el documento.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del documento de ajustes a eliminar',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 204,
    description: 'Ajuste eliminado exitosamente. Sin contenido en la respuesta.',
  })
  @ApiResponse({
    status: 404,
    description: 'Ajuste no encontrado con el ID especificado.',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token JWT inválido o expirado.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - Solo coordinadores y educadoras sociales pueden eliminar ajustes.' 
  })
  async remove(@Param('id') id: string): Promise<void> {
    const result = await this.adjustmentsService.remove(id);
    if (!result || result.deletedCount === 0) {
      throw new NotFoundException(`Adjustment with ID "${id}" not found`);
    }
  }

  @Get('student/:studentId')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.ESTUDIANTE,UserRole.JEFE_CARRERA)
  @ApiOperation({
    summary: 'Obtener todos los ajustes de un estudiante',
    description: 'Lista todos los ajustes asociados a un estudiante específico. Los estudiantes solo pueden ver sus propios ajustes. Permite filtrar por estado del ajuste.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'ID del estudiante (ObjectId)',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por estado del ajuste',
    enum: AdjustmentStatus,
    example: 'active',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ajustes del estudiante.',
    type: [AdjustmentResponseDto],
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: 'ID de estudiante inválido - No es un ObjectId válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Ajustes no encontrados o no autorizados.',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token JWT inválido o expirado.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - Los estudiantes solo pueden ver sus propios ajustes.' 
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
    summary: 'Obtener ajustes de estudiantes de un departamento',
    description: 'Lista todos los ajustes de estudiantes que pertenecen a carreras del departamento especificado. Solo accesible para el jefe del departamento correspondiente. Requiere filtro por semestre.',
  })
  @ApiParam({
    name: 'departmentId',
    description: 'ID del departamento',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'semester',
    required: true,
    description: 'Semestre académico a consultar',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[12]$'
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ajustes del departamento para el semestre especificado.',
    type: [AdjustmentResponseDto],
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: 'Formato de semestre inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Departamento no encontrado.',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token JWT inválido o expirado.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - Solo el jefe del departamento puede acceder a esta información.' 
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
    summary: 'Obtener ajustes de un curso específico',
    description: 'Lista todos los ajustes asociados a un curso. Los docentes solo pueden acceder si son profesores del curso. Útil para que los docentes conozcan los ajustes de sus estudiantes.',
  })
  @ApiParam({
    name: 'courseId',
    description: 'ID del curso',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ajustes del curso.',
    type: [AdjustmentResponseDto],
    isArray: true,
  })
  @ApiResponse({
    status: 404,
    description: 'Curso no encontrado.',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token JWT inválido o expirado.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - Docente no es profesor de este curso.' 
  })
  async findByCourse(
    @Param('courseId') courseId: string,
  ): Promise<Adjustment[]> {
    return this.adjustmentsService.findByCourseId(courseId);
  }

  @Post(':id/documents/:documentId')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Asociar documento de respaldo a un ajuste',
    description: 'Vincula un documento existente (certificado médico, informe psicológico, etc.) a un ajuste específico como respaldo.',
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del ajuste',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiParam({ 
    name: 'documentId', 
    description: 'ID del documento a asociar',
    example: '507f1f77bcf86cd799439012'
  })
  @ApiResponse({
    status: 200,
    description: 'Documento asociado exitosamente al ajuste.',
    type: AdjustmentResponseDto,
  })
  @ApiResponse({ 
    status: 400,
    description: 'IDs inválidos - No son ObjectId válidos de MongoDB.'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Ajuste o documento no encontrado.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token JWT inválido o expirado.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - Solo coordinadores y educadoras sociales pueden asociar documentos.' 
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
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.JEFE_CARRERA)
  @ApiOperation({
    summary: 'Cambiar el estado de un ajuste específico',
    description: 'Actualiza el estado de un ajuste dentro del array de ajustes. Requiere especificar el índice del ajuste en el array. Los jefes de carrera solo pueden aprobar/rechazar ajustes de su carrera.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del documento de ajustes',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'status',
    description: 'Nuevo estado del ajuste',
    enum: AdjustmentStatus,
    example: 'approved',
  })
  @ApiQuery({
    name: 'adjustmentIndex',
    required: true,
    description: 'Índice del ajuste específico en el array currentAdjustments (base 0)',
    example: 0,
    schema: {
      type: 'integer',
      minimum: 0
    }
  })
  @ApiBody({
    description: 'Comentarios opcionales sobre el cambio de estado',
    required: false,
    schema: {
      type: 'object',
      properties: {
        comments: {
          type: 'string',
          description: 'Razón o comentarios sobre el cambio de estado',
          example: 'Aprobado en reunión del consejo académico del 19-06-2025.',
          maxLength: 500
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del ajuste actualizado correctamente.',
    type: AdjustmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetro adjustmentIndex inválido o faltante.',
  })
  @ApiResponse({
    status: 404,
    description: 'Ajuste no encontrado o índice fuera de rango.',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token JWT inválido o expirado.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - Usuario no tiene permisos para cambiar el estado.' 
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
    summary: 'Marcar ajuste como leído por el docente',
    description: 'Permite a un docente marcar un ajuste específico como leído/revisado. Importante para el seguimiento y para confirmar que el docente conoce los ajustes de sus estudiantes.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del documento de ajustes',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'adjustmentIndex',
    required: true,
    description: 'Índice del ajuste específico en el array currentAdjustments (base 0)',
    example: 0,
    schema: {
      type: 'integer',
      minimum: 0
    }
  })
  @ApiBody({
    description: 'Comentarios opcionales del docente',
    required: false,
    schema: {
      type: 'object',
      properties: {
        comments: {
          type: 'string',
          description: 'Observaciones o confirmación del docente',
          example: 'Entendido. Se aplicará tiempo extra en todas las evaluaciones.',
          maxLength: 500
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Ajuste marcado como leído por el docente.',
    type: AdjustmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido o parámetro adjustmentIndex incorrecto.',
  })
  @ApiResponse({
    status: 404,
    description: 'Ajuste no encontrado o índice fuera de rango.',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token JWT inválido o expirado.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - Solo docentes pueden marcar ajustes como leídos.' 
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
