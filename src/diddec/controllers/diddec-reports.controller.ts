import { Controller, Post, Body, Res, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportReportDto } from '../dto/export-report.dto';
import { ExportService } from '../services/export.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('DIDDEC Reports')
@Controller('diddec/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DiddecReportsController {
  constructor(private readonly exportService: ExportService) {}

  @Post('export')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF, UserRole.JEFE_CARRERA, UserRole.JEFE_DEPARTAMENTO)
  @ApiOperation({ summary: 'Generate a report export file' })
  @ApiResponse({ status: 201, description: 'Report has been generated successfully' })
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
  @ApiOperation({ summary: 'Download a generated report' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
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
