import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class StudentNeeResponseDto {
  @ApiProperty({ description: 'ID del estudiante' })
  _id: Types.ObjectId;

  @ApiProperty({ description: 'Nombre completo del estudiante' })
  fullName: string;

  @ApiProperty({ description: 'RUT del estudiante' })
  rut: string;

  @ApiProperty({ description: 'Email del estudiante' })
  email: string;

  @ApiProperty({ description: 'Carrera del estudiante' })
  career: string;

  @ApiProperty({ description: 'Número de ajustes asignados' })
  adjustmentsCount: number;

  @ApiProperty({ description: 'Número de ajustes implementados' })
  implementedAdjustments: number;

  @ApiProperty({ description: 'Porcentaje de implementación' })
  implementationRate: number;

  @ApiProperty({ description: 'Semestre actual' })
  semester: string;
}

export class DepartmentStudentsNeeResponseDto {
  @ApiProperty({ description: 'ID del departamento' })
  departmentId: Types.ObjectId | string;

  @ApiProperty({ description: 'Nombre del departamento' })
  departmentName: string;

  @ApiProperty({ description: 'Total de estudiantes con NEE' })
  totalStudents: number;

  @ApiProperty({ description: 'Lista de estudiantes con NEE', type: [StudentNeeResponseDto] })
  students: StudentNeeResponseDto[];

  @ApiProperty({ description: 'Fecha de generación del reporte' })
  generatedAt: Date;

  @ApiProperty({ description: 'Semestre actual' })
  semester: string;
}
