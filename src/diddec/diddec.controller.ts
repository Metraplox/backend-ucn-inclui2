import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DiddecService } from './diddec.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('DIDDEC')
@Controller('diddec')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DiddecController {
  constructor(private readonly diddecService: DiddecService) {}

  @Get('statistics')
  @Roles(Role.ADMIN, Role.STAFF, Role.DIDDEC)
  @ApiOperation({ summary: 'Obtener estadísticas generales' })
  @ApiQuery({ name: 'semester', required: true, type: String, description: 'Semestre académico (formato YYYY-P)' })
  @ApiResponse({ status: 200, description: 'Estadísticas generales del sistema para el semestre especificado' })
  async getStatistics(@Query('semester') semester: string) {
    return this.diddecService.getGeneralStatistics(semester);
  }

  @Get('reports/semester/:semester')
  @Roles(Role.ADMIN, Role.STAFF, Role.DIDDEC)
  @ApiOperation({ summary: 'Obtener informe detallado por semestre' })
  @ApiParam({ name: 'semester', required: true, description: 'Semestre académico (formato YYYY-P)' })
  @ApiResponse({ status: 200, description: 'Informe detallado para el semestre especificado' })
  async getSemesterReport(@Param('semester') semester: string) {
    return this.diddecService.getSemesterReport(semester);
  }

  @Get('students/all')
  @Roles(Role.ADMIN, Role.STAFF, Role.DIDDEC)
  @ApiOperation({ summary: 'Obtener todos los estudiantes con NEE' })
  @ApiQuery({ name: 'semester', required: true, type: String, description: 'Semestre académico (formato YYYY-P)' })
  @ApiResponse({ status: 200, description: 'Lista de todos los estudiantes con NEE para el semestre especificado' })
  async getAllStudentsWithNEE(@Query('semester') semester: string) {
    return this.diddecService.getAllStudentsWithNEE(semester);
  }

  @Get('adjustments/trends')
  @Roles(Role.ADMIN, Role.STAFF, Role.DIDDEC)
  @ApiOperation({ summary: 'Obtener tendencias de ajustes a lo largo del tiempo' })
  @ApiQuery({ name: 'years', required: false, type: Number, description: 'Número de años a analizar (por defecto: 3)' })
  @ApiResponse({ status: 200, description: 'Tendencias de ajustes por semestre en el período especificado' })
  async getAdjustmentTrends(@Query('years') years: number = 3) {
    return this.diddecService.getAdjustmentTrends(years);
  }

  @Get('adjustments/compliance')
  @Roles(Role.ADMIN, Role.STAFF, Role.DIDDEC)
  @ApiOperation({ summary: 'Obtener tasa de cumplimiento de ajustes por departamento' })
  @ApiQuery({ name: 'semester', required: true, type: String, description: 'Semestre académico (formato YYYY-P)' })
  @ApiResponse({ status: 200, description: 'Tasas de cumplimiento de ajustes por departamento para el semestre especificado' })
  async getAdjustmentComplianceByDepartment(@Query('semester') semester: string) {
    return this.diddecService.getAdjustmentComplianceByDepartment(semester);
  }
}
