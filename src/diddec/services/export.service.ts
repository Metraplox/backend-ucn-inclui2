import { Injectable } from '@nestjs/common';
import {
  ExportFormat,
  ExportReportDto,
  ReportType,
} from '../dto/export-report.dto';
import { DiddecService } from '../diddec.service';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExportService {
  constructor(private readonly diddecService: DiddecService) {
    // Ensure the exports directory exists
    this.ensureExportsDirectory();
  }

  private readonly exportsDir = path.join(process.cwd(), 'exports');

  private ensureExportsDirectory() {
    if (!fs.existsSync(this.exportsDir)) {
      fs.mkdirSync(this.exportsDir, { recursive: true });
    }
  }

  async exportReport(exportReportDto: ExportReportDto): Promise<{
    filePath: string;
    filename: string;
    contentType: string;
  }> {
    const { semester, reportType, format } = exportReportDto;
    let data: any;
    const filename = `reporte_${reportType}_${semester}_${uuidv4()}`;

    // Get data based on report type
    switch (reportType) {
      case ReportType.GENERAL_STATISTICS:
        data = await this.diddecService.getGeneralStatistics(semester);
        break;
      case ReportType.STUDENTS_WITH_NEE:
        data = await this.diddecService.getAllStudentsWithNEE(semester);
        break;
      case ReportType.ADJUSTMENTS_BY_TYPE:
        const reportData = await this.diddecService.getSemesterReport(semester);
        data = reportData.adjustmentsByType;
        break;
      case ReportType.ADJUSTMENT_COMPLIANCE:
        data =
          await this.diddecService.getAdjustmentComplianceByDepartment(
            semester,
          );
        break;
      case ReportType.STUDENTS_BY_CAREER:
        const semesterReport =
          await this.diddecService.getSemesterReport(semester);
        data = semesterReport.studentsByCareer;
        break;
      case ReportType.COURSES_WITH_NEE:
        const report = await this.diddecService.getSemesterReport(semester);
        data = report.topCoursesWithNEE;
        break;
      default:
        throw new Error(`Report type ${reportType} not supported`);
    }

    // Export based on format
    switch (format) {
      case ExportFormat.EXCEL:
      case ExportFormat.CSV:
        return this.exportToCsv(data, reportType, filename);
      case ExportFormat.PDF:
        throw new Error('PDF export not implemented yet');
      default:
        throw new Error(`Export format ${format} not supported`);
    }
  }

  private async exportToCsv(
    data: any,
    reportType: ReportType,
    filename: string,
  ): Promise<{ filePath: string; filename: string; contentType: string }> {
    let csvContent = '';
    const filenameWithExt = `${filename}.csv`;
    const filePath = path.join(this.exportsDir, filenameWithExt);

    // Format headers and content based on report type
    switch (reportType) {
      case ReportType.GENERAL_STATISTICS:
        csvContent = 'Métrica,Valor\n';
        csvContent += `Semestre,${data.semester}\n`;
        csvContent += `Total Estudiantes con NEE,${data.totalStudentsWithNEE}\n`;
        csvContent += `Total Ajustes,${data.totalAdjustments}\n`;
        csvContent += `Ajustes Reconocidos,${data.acknowledgedAdjustments}\n`;
        csvContent += `Ajustes Pendientes,${data.pendingAdjustments}\n`;
        csvContent += `Porcentaje Reconocimiento,${data.acknowledgedPercentage}%\n`;
        csvContent += `Total Cursos,${data.totalCourses}\n`;
        csvContent += `Total Carreras,${data.totalCareers}\n`;
        break;

      case ReportType.STUDENTS_WITH_NEE:
        csvContent = 'ID,Rut,Nombre,Apellido,Email,Carrera,Semestre\n';
        data.forEach((student) => {
          csvContent += `${student._id},${student.rut},${student.firstName},${student.lastName},${student.email},${student.carreraId?.name || 'N/A'},${student.semester}\n`;
        });
        break;

      case ReportType.ADJUSTMENTS_BY_TYPE:
        csvContent = 'Tipo de Ajuste,Cantidad\n';
        data.forEach((item) => {
          csvContent += `${item.type},${item.count}\n`;
        });
        break;

      case ReportType.ADJUSTMENT_COMPLIANCE:
        csvContent =
          'Departamento,Total Ajustes,Ajustes Reconocidos,Tasa de Cumplimiento\n';
        data.forEach((item) => {
          csvContent += `${item.department},${item.totalAdjustments},${item.acknowledgedAdjustments},${item.complianceRate}%\n`;
        });
        break;

      case ReportType.STUDENTS_BY_CAREER:
        csvContent = 'Carrera,Departamento,Cantidad de Estudiantes con NEE\n';
        data.forEach((item) => {
          csvContent += `${item.careerName},${item.department},${item.studentCount}\n`;
        });
        break;

      case ReportType.COURSES_WITH_NEE:
        csvContent =
          'Curso,Código,NRC,Semestre,Estudiantes con NEE,Total Estudiantes\n';
        data.forEach((course) => {
          csvContent += `${course.name},${course.code},${course.nrc},${course.semester},${course.studentsWithNEECount},${course.totalStudents}\n`;
        });
        break;

      default:
        throw new Error(
          `Report type ${reportType} not supported for CSV export`,
        );
    }

    // Write to file
    fs.writeFileSync(filePath, csvContent);

    return {
      filePath,
      filename: filenameWithExt,
      contentType: 'text/csv',
    };
  }
}
