import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class TeacherStatsDto {
  @ApiProperty({ description: 'ID del docente' })
  _id: string;

  @ApiProperty({ description: 'Nombre completo del docente' })
  fullName: string;

  @ApiProperty({ description: 'Email del docente' })
  email: string;

  @ApiProperty({ description: 'Cantidad de cursos asignados' })
  coursesCount: number;

  @ApiProperty({ description: 'Cantidad de estudiantes con NEE en sus cursos' })
  studentsWithNeeCount: number;

  @ApiProperty({ description: 'Cantidad de ajustes asignados' })
  adjustmentsCount: number;

  @ApiProperty({ description: 'Cantidad de ajustes implementados' })
  implementedAdjustments: number;

  @ApiProperty({ description: 'Porcentaje de implementación de ajustes' })
  implementationRate: number;
}

export class DepartmentTeachersResponseDto {
  @ApiProperty({ description: 'ID del departamento' })
  departmentId: string;

  @ApiProperty({ description: 'Nombre del departamento' })
  departmentName: string;

  @ApiProperty({ description: 'Total de docentes en el departamento' })
  totalTeachers: number;

  @ApiProperty({
    description: 'Lista de docentes con sus estadísticas',
    type: [TeacherStatsDto],
  })
  teachers: TeacherStatsDto[];

  @ApiProperty({ description: 'Fecha de generación del reporte' })
  generatedAt: Date;

  @ApiProperty({ description: 'Semestre actual' })
  semester: string;
}
