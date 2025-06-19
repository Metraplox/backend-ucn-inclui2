import { Controller, Post, Body, Res, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportReportDto } from '../dto/export-report.dto';
import { ExportService } from '../services/export.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('diddec-reports')
@Controller('diddec/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DiddecReportsController {
  constructor(private readonly exportService: ExportService) {}

  @Post('export')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF, UserRole.JEFE_CARRERA, UserRole.JEFE_DEPARTAMENTO)
  @ApiOperation({ 
    summary: 'Generar reporte de exportación',
    description: 'Genera un archivo de reporte exportable con datos del sistema UCN INCLUI2. Soporta múltiples formatos (Excel, PDF, CSV) y diferentes tipos de reportes según los parámetros especificados.'
  })
  @ApiBody({
    type: ExportReportDto,
    description: 'Configuración del reporte a generar',
    examples: {
      'reporte-estudiantes': {
        summary: 'Reporte de estudiantes con NEE',
        value: {
          reportType: 'students_with_nee',
          format: 'excel',
          semester: '2025-1',
          includeSensitiveData: false,
          filters: {
            departmentId: '507f1f77bcf86cd799439035',
            needsType: 'Discapacidad visual'
          }
        }
      },
      'reporte-ajustes': {
        summary: 'Reporte de ajustes razonables',
        value: {
          reportType: 'adjustments_summary',
          format: 'pdf',
          semester: '2025-1',
          includeSensitiveData: true,
          filters: {
            status: 'aprobado',
            dateRange: {
              from: '2025-01-01',
              to: '2025-06-30'
            }
          }
        }
      },
      'reporte-compliance': {
        summary: 'Reporte de cumplimiento por departamento',
        value: {
          reportType: 'compliance_by_department',
          format: 'csv',
          semester: '2025-1',
          includeSensitiveData: false
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Reporte generado exitosamente con URL de descarga',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Report generated successfully' },
        data: {
          type: 'object',
          properties: {
            filename: { 
              type: 'string', 
              example: 'reporte_estudiantes_nee_2025-1_20250619_143021.xlsx',
              description: 'Nombre del archivo generado con timestamp'
            },
            downloadUrl: { 
              type: 'string', 
              example: '/diddec/reports/download/reporte_estudiantes_nee_2025-1_20250619_143021.xlsx',
              description: 'URL relativa para descargar el archivo'
            }
          }
        }
      },
      example: {
        success: true,
        message: 'Report generated successfully',
        data: {
          filename: 'reporte_estudiantes_nee_2025-1_20250619_143021.xlsx',
          downloadUrl: '/diddec/reports/download/reporte_estudiantes_nee_2025-1_20250619_143021.xlsx'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de reporte inválidos o configuración incorrecta',
    schema: {
      example: {
        statusCode: 400,
        message: ['reportType should not be empty', 'format must be one of: excel, pdf, csv'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({ 
    status: 403, 
    description: 'Rol no autorizado - Requiere permisos de coordinación, DIDDEC o jefatura',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden'
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor durante la generación del reporte',
    schema: {
      example: {
        statusCode: 500,
        message: 'Error generating report: insufficient disk space',
        error: 'Internal Server Error'
      }
    }
  })
  async exportReport(@Body() exportReportDto: ExportReportDto) {
    const result = await this.exportService.exportReport(exportReportDto);

    return {
      success: true,
      message: 'Report generated successfully',
      data: {
        filename: result.filename,
        downloadUrl: `/diddec/reports/download/${path.basename(result.filePath)}`,
      },
    };
  }

  @Get('download/:filename')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF, UserRole.JEFE_CARRERA, UserRole.JEFE_DEPARTAMENTO)
  @ApiOperation({ 
    summary: 'Descargar reporte generado',
    description: 'Descarga un archivo de reporte previamente generado. Los archivos tienen un tiempo de vida limitado y se eliminan automáticamente después de un período determinado por seguridad.'
  })
  @ApiParam({
    name: 'filename',
    description: 'Nombre del archivo de reporte a descargar (incluye timestamp de generación)',
    example: 'reporte_estudiantes_nee_2025-1_20250619_143021.xlsx'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo descargado exitosamente',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      },
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      },
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    },
    headers: {
      'Content-Disposition': {
        description: 'Configuración de descarga con nombre original',
        schema: {
          type: 'string',
          example: 'attachment; filename="reporte_estudiantes_nee_2025-1.xlsx"'
        }
      },
      'Content-Type': {
        description: 'Tipo MIME del archivo',
        schema: {
          type: 'string',
          example: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Archivo de reporte no encontrado (puede haber expirado)',
    schema: {
      example: {
        success: false,
        message: 'File not found'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({ 
    status: 403, 
    description: 'Rol no autorizado - Requiere permisos de coordinación, DIDDEC o jefatura',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden'
      }
    }
  })
  async downloadReport(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(process.cwd(), 'exports', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    return res.download(filePath);
  }
}
