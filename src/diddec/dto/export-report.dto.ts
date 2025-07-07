import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export enum ReportType {
  GENERAL_STATISTICS = 'general_statistics',
  STUDENTS_WITH_NEE = 'students_with_nee',
  ADJUSTMENTS_BY_TYPE = 'adjustments_by_type',
  ADJUSTMENT_COMPLIANCE = 'adjustment_compliance',
  STUDENTS_BY_CAREER = 'students_by_career',
  COURSES_WITH_NEE = 'courses_with_nee',
}

export enum ExportFormat {
  EXCEL = 'excel',
  CSV = 'csv',
  PDF = 'pdf',
}

export class ExportReportDto {
  @ApiProperty({
    description: 'Academic semester (format: YYYY-P)',
    example: '2025-1',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-[1-2]$/, {
    message: 'Semester must follow the format YYYY-P where P is 1 or 2',
  })
  semester: string;

  @ApiProperty({
    description: 'Type of report to export',
    enum: ReportType,
    example: ReportType.GENERAL_STATISTICS,
  })
  @IsNotEmpty()
  @IsEnum(ReportType)
  reportType: ReportType;

  @ApiProperty({
    description: 'Format of the exported report',
    enum: ExportFormat,
    example: ExportFormat.EXCEL,
    default: ExportFormat.EXCEL,
  })
  @IsOptional()
  @IsEnum(ExportFormat)
  format: ExportFormat = ExportFormat.EXCEL;

  @ApiProperty({
    description: 'Optional filtering parameters as JSON string',
    example: '{"departmentId": "60a1b1b9b8b9b1b9b8b9b1b9"}',
    required: false,
  })
  @IsOptional()
  @IsString()
  filters?: string;
}
