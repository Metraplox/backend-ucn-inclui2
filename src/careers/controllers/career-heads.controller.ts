import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { CareersService } from '../careers.service';
import { CareerHeadStatsDto, CareerHeadCareerDto } from '../dto/career-head.dto';
import { Career } from '../schemas/career.schema';
import { Types } from 'mongoose';

@ApiTags('Jefes de Carrera')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('career-heads')
@ApiResponse({ status: 401, description: 'No autorizado. Se requiere autenticación' })
@ApiResponse({ status: 403, description: 'Acceso denegado. Se requieren permisos de Jefe de Carrera' })
export class CareerHeadsController {
  constructor(private readonly careersService: CareersService) {}

  @Get('my-career')
  @Roles(UserRole.JEFE_CARRERA)
  @ApiOperation({
    summary: 'Obtener información de la carrera del jefe actual',
    description: 'Devuelve los detalles de la carrera asociada al jefe de carrera autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de la carrera obtenida exitosamente',
    type: CareerHeadStatsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró ninguna carrera asociada a este jefe',
  })
  async getMyCareer(@Request() req: { user: { userId: string } }): Promise<CareerHeadStatsDto> {
    const { userId } = req.user;
    const careers = await this.careersService.findByHead(userId);
    
    if (!careers || careers.length === 0) {
      throw new NotFoundException('No se encontró ninguna carrera asociada a este jefe');
    }
    
    // Convertir a objeto plano y asegurar el tipo
    const career = typeof (careers[0] as any).toObject === 'function' ? (careers[0] as any).toObject() : careers[0];
    const careerId = career._id.toString();
    
    if (!careerId) {
      throw new NotFoundException('ID de carrera no válido');
    }
    
    // Obtener estadísticas con el semestre actual
    return this.careersService.getCareerHeadStatistics(careerId);
  }

  @Get('statistics')
  @Roles(UserRole.JEFE_CARRERA)
  @ApiOperation({
    summary: 'Obtener estadísticas de la carrera',
    description: 'Proporciona estadísticas detalladas sobre la carrera del jefe autenticado, incluyendo conteo de estudiantes, ajustes por estado y distribución por semestre.',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre académico (formato: AÑO-PERIODO, ej: 2025-1)',
    example: '2025-1',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estadísticas obtenidas exitosamente',
    type: CareerHeadStatsDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de solicitud inválidos o formato de semestre incorrecto',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró información para los criterios de búsqueda especificados',
  })
  async getStatistics(
    @Request() req: { user: { userId: string } },
    @Query('semester') semester?: string,
  ): Promise<CareerHeadStatsDto> {
    const { userId } = req.user;
    const careers = await this.careersService.findByHead(userId);
    
    if (!careers || careers.length === 0) {
      throw new BadRequestException('No se encontró ninguna carrera asignada a este jefe');
    }

    // Por simplicidad, tomamos la primera carrera (podría extenderse para manejar múltiples carreras)
    // Convertir a objeto plano y asegurar el tipo
    const career = typeof (careers[0] as any).toObject === 'function' ? (careers[0] as any).toObject() : careers[0];
    const careerId = career._id?.toString();
    
    if (!careerId) {
      throw new BadRequestException('ID de carrera no válido');
    }
    
    return this.careersService.getCareerHeadStatistics(careerId, semester);
  }

  @Get('students')
  @Roles(UserRole.JEFE_CARRERA)
  @ApiOperation({
    summary: 'Obtener estudiantes de la carrera',
    description: 'Obtiene un listado paginado de los estudiantes asociados a la carrera que dirige el jefe autenticado, con opciones de filtrado por semestre.',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre académico (formato: AÑO-PERIODO, ej: 2025-1)',
    example: '2025-1',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de estudiantes obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Student' } },
        total: { type: 'number', example: 42 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de solicitud inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la carrera asignada al jefe',
  })
  async getStudents(
    @Request() req: { user: { userId: string } },
    @Query('semester') semester?: string,
  ) {
    const { userId } = req.user;
    const careers = await this.careersService.findByHead(userId);
    
    if (!careers || careers.length === 0) {
      throw new BadRequestException('No se encontró ninguna carrera asignada a este jefe');
    }

    // Por simplicidad, tomamos la primera carrera (podría extenderse para manejar múltiples carreras)
    // Convertir a objeto plano y asegurar el tipo
    const career = typeof (careers[0] as any).toObject === 'function' ? (careers[0] as any).toObject() : careers[0];
    const careerId = career._id?.toString();
    
    if (!careerId) {
      throw new BadRequestException('ID de carrera no válido');
    }
    
    return this.careersService.getStudents(careerId, semester);
  }

  @Get('adjustments')
  @Roles(UserRole.JEFE_CARRERA)
  @ApiOperation({
    summary: 'Obtener ajustes razonables de la carrera',
    description: 'Obtiene un listado detallado de los ajustes razonables de los estudiantes de la carrera, con opciones de filtrado por estado y semestre.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por estado del ajuste',
    enum: ['pendiente', 'aprobado', 'rechazado', 'implementado', 'vencido'],
    example: 'aprobado',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre académico (formato: AÑO-PERIODO, ej: 2025-1)',
    example: '2025-1',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de ajustes razonables obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Adjustment' } },
        total: { type: 'number', example: 15 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        stats: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 15 },
            byStatus: {
              type: 'object',
              additionalProperties: { type: 'number' },
              example: { pendiente: 5, aprobado: 7, implementado: 3 }
            },
            byType: {
              type: 'object',
              additionalProperties: { type: 'number' },
              example: { 'Tiempo extendido': 8, 'Material adaptado': 4, 'Otra adaptación': 3 }
            }
          }
        }
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de solicitud inválidos o formato de semestre incorrecto',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la carrera asignada al jefe',
  })
  async getAdjustments(
    @Request() req: { user: { userId: string } },
    @Query('status') status?: string,
    @Query('semester') semester?: string,
  ) {
    const { userId } = req.user;
    const careers = await this.careersService.findByHead(userId);
    
    if (!careers || careers.length === 0) {
      throw new BadRequestException('No se encontró ninguna carrera asignada a este jefe');
    }

    // Por simplicidad, tomamos la primera carrera (podría extenderse para manejar múltiples carreras)
    // Convertir a objeto plano y asegurar el tipo
    const career = typeof (careers[0] as any).toObject === 'function' ? (careers[0] as any).toObject() : careers[0];
    const careerId = career._id?.toString();
    
    if (!careerId) {
      throw new BadRequestException('ID de carrera no válido');
    }
    
    return this.careersService.getCareerAdjustments(careerId, status, semester);
  }
}
