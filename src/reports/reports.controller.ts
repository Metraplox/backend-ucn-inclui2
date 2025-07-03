import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  StreamableFile,
  Header,
  Response,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ReportsService } from './reports.service';
import { Response as ExpressResponse } from 'express';

@ApiTags('reports')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
  ) {}

  @Get('students/with-nee')
  @Roles(UserRole.COORDINADOR, UserRole.JEFE_CARRERA, UserRole.DIDDEC_STAFF)
  @ApiOperation({
    summary: 'Obtener lista de estudiantes con NEE',
    description: 'Obtiene lista de estudiantes con Necesidades Educativas Especiales, filtrable por carrera.',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Semestre académico (formato YYYY-P)',
    example: '2025-1',
  })
  @ApiQuery({
    name: 'career',
    required: false,
    description: 'Filtrar por carrera específica',
  })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filtrar por estudiantes activos',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estudiantes con NEE obtenida exitosamente.',
  })
  async getStudentsWithNEE(
    @Query('semester') semester?: string,
    @Query('career') career?: string,
    @Query('active') active?: boolean,
    @Request() req?: any,
  ) {
    try {
      return await this.reportsService.getStudentsWithNEE(
        semester,
        career,
        active,
        req.user,
      );
    } catch (error) {
      throw new HttpException(
        'Error al obtener lista de estudiantes con NEE',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('student/:id/history')
  @Roles(UserRole.COORDINADOR, UserRole.ESTUDIANTE, UserRole.JEFE_CARRERA, UserRole.DIDDEC_STAFF)
  @ApiOperation({
    summary: 'Obtener historial académico de estudiante',
    description: 'Obtiene el historial académico de un estudiante incluyendo cursos y ajustes por semestre.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del estudiante',
    type: String,
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial académico obtenido exitosamente.',
  })
  async getStudentHistory(
    @Param('id') studentId: string,
    @Query('semester') semester?: string,
    @Request() req?: any,
  ) {
    try {
      return await this.reportsService.getStudentAcademicHistory(
        studentId,
        semester,
        req.user,
      );
    } catch (error) {
      throw new HttpException(
        'Error al obtener historial académico del estudiante',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
