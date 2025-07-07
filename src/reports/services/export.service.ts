import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ComplianceReportService } from './compliance-report.service';
import { ReportsService } from '../reports.service';

@Injectable()
export class ExportService {
  constructor(
    private readonly complianceReportService: ComplianceReportService,
    private readonly reportsService: ReportsService,
  ) {}

  async generateComplianceExcel(
    type: 'department' | 'teacher' | 'students',
    semester: string,
    user: any,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'Sistema Incluye UCN';
    workbook.lastModifiedBy = 'Sistema Incluye UCN';
    workbook.created = new Date();
    workbook.modified = new Date();

    switch (type) {
      case 'department':
        await this.addDepartmentSheet(workbook, semester, user);
        break;
      case 'teacher':
        await this.addTeacherSheet(workbook, semester, user);
        break;
      case 'students':
        await this.addStudentsSheet(workbook, semester, user);
        break;
    }

    return (await workbook.xlsx.writeBuffer()) as Buffer;
  }

  private async addDepartmentSheet(
    workbook: ExcelJS.Workbook,
    semester: string,
    user: any,
  ): Promise<void> {
    const worksheet = workbook.addWorksheet('Cumplimiento por Departamento');

    // Configurar encabezados
    worksheet.columns = [
      { header: 'Departamento', key: 'departmentName', width: 30 },
      { header: 'Total Ajustes', key: 'totalAdjustments', width: 15 },
      { header: 'Ajustes Revisados', key: 'reviewedAdjustments', width: 18 },
      { header: 'Ajustes Pendientes', key: 'pendingAdjustments', width: 18 },
      { header: 'Ajustes Vencidos', key: 'overdueAdjustments', width: 18 },
      { header: 'Tasa de Cumplimiento (%)', key: 'complianceRate', width: 25 },
      { header: 'Última Actualización', key: 'lastUpdate', width: 20 },
    ];

    // Estilo para encabezados
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4CAF50' },
      };
      cell.alignment = { horizontal: 'center' };
    });

    // Obtener datos
    const data = await this.complianceReportService.getComplianceByDepartment(
      semester,
      undefined,
      user,
    );

    // Agregar datos
    data.forEach((item) => {
      worksheet.addRow({
        departmentName: item.departmentName,
        totalAdjustments: item.totalAdjustments,
        reviewedAdjustments: item.reviewedAdjustments,
        pendingAdjustments: item.pendingAdjustments,
        overdueAdjustments: item.overdueAdjustments,
        complianceRate: item.complianceRate,
        lastUpdate: item.lastUpdate.toLocaleDateString('es-CL'),
      });
    });

    // Aplicar formato condicional para la tasa de cumplimiento
    worksheet
      .getColumn('complianceRate')
      .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber > 1) {
          const value = cell.value as number;
          if (value >= 90) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE8F5E8' },
            };
          } else if (value >= 70) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFF3E0' },
            };
          } else {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFEBEE' },
            };
          }
        }
      });
  }

  private async addTeacherSheet(
    workbook: ExcelJS.Workbook,
    semester: string,
    user: any,
  ): Promise<void> {
    const worksheet = workbook.addWorksheet('Cumplimiento por Docente');

    // Configurar encabezados
    worksheet.columns = [
      { header: 'Nombre Docente', key: 'teacherName', width: 25 },
      { header: 'Email', key: 'teacherEmail', width: 30 },
      { header: 'Departamento', key: 'department', width: 25 },
      { header: 'Total Ajustes', key: 'totalAdjustments', width: 15 },
      { header: 'Ajustes Revisados', key: 'reviewedAdjustments', width: 18 },
      { header: 'Ajustes Pendientes', key: 'pendingAdjustments', width: 18 },
      { header: 'Ajustes Vencidos', key: 'overdueAdjustments', width: 18 },
      { header: 'Tasa de Cumplimiento (%)', key: 'complianceRate', width: 25 },
      {
        header: 'Tiempo Promedio Revisión (días)',
        key: 'averageReviewTime',
        width: 30,
      },
      { header: 'Última Revisión', key: 'lastReviewDate', width: 20 },
    ];

    // Estilo para encabezados
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2196F3' },
      };
      cell.alignment = { horizontal: 'center' };
    });

    // Obtener datos
    const data = await this.complianceReportService.getComplianceByTeacher(
      semester,
      undefined,
      user,
    );

    // Agregar datos
    data.forEach((item) => {
      worksheet.addRow({
        teacherName: item.teacherName,
        teacherEmail: item.teacherEmail,
        department: item.department,
        totalAdjustments: item.totalAdjustments,
        reviewedAdjustments: item.reviewedAdjustments,
        pendingAdjustments: item.pendingAdjustments,
        overdueAdjustments: item.overdueAdjustments,
        complianceRate: item.complianceRate,
        averageReviewTime: item.averageReviewTime,
        lastReviewDate: item.lastReviewDate
          ? item.lastReviewDate.toLocaleDateString('es-CL')
          : 'Sin revisiones',
      });
    });

    // Aplicar formato condicional
    worksheet
      .getColumn('complianceRate')
      .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber > 1) {
          const value = cell.value as number;
          if (value >= 90) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE8F5E8' },
            };
          } else if (value >= 70) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFF3E0' },
            };
          } else {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFEBEE' },
            };
          }
        }
      });
  }

  private async addStudentsSheet(
    workbook: ExcelJS.Workbook,
    semester: string,
    user: any,
  ): Promise<void> {
    const worksheet = workbook.addWorksheet('Estudiantes con NEE');

    // Configurar encabezados
    worksheet.columns = [
      { header: 'RUT', key: 'rut', width: 15 },
      { header: 'Nombre Completo', key: 'fullName', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Carrera', key: 'career', width: 25 },
      { header: 'Semestre', key: 'semester', width: 12 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Total Ajustes', key: 'totalAdjustments', width: 15 },
      { header: 'Ajustes Activos', key: 'activeAdjustments', width: 18 },
      { header: 'Fecha Registro', key: 'registrationDate', width: 18 },
    ];

    // Estilo para encabezados
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF9800' },
      };
      cell.alignment = { horizontal: 'center' };
    });

    // Obtener datos (simulamos la función que debería existir)
    const data = await this.getStudentsWithNEEData(semester, user);

    // Agregar datos
    data.forEach((item: any) => {
      worksheet.addRow({
        rut: item.rut,
        fullName: item.fullName,
        email: item.email,
        career: item.career,
        semester: item.semester,
        status: item.status,
        totalAdjustments: item.totalAdjustments,
        activeAdjustments: item.activeAdjustments,
        registrationDate: item.registrationDate.toLocaleDateString('es-CL'),
      });
    });
  }

  private async getStudentsWithNEEData(
    semester: string,
    user: any,
  ): Promise<any[]> {
    // Implementación temporal - esto debería conectar con el servicio real
    return [
      {
        rut: '12.345.678-9',
        fullName: 'Juan Pérez García',
        email: 'juan.perez@ucn.cl',
        career: 'Ingeniería Civil Informática',
        semester: semester,
        status: 'Activo',
        totalAdjustments: 5,
        activeAdjustments: 3,
        registrationDate: new Date(),
      },
    ];
  }
}
