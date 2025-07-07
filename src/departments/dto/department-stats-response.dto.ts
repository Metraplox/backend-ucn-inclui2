import { ApiProperty } from '@nestjs/swagger';

export class DepartmentStatsResponseDto {
  @ApiProperty({ description: 'Total de docentes en el departamento' })
  totalTeachers: number;

  @ApiProperty({
    description: 'Total de estudiantes con NEE en el departamento',
  })
  totalStudentsWithNEE: number;

  @ApiProperty({ description: 'Total de ajustes razonables asignados' })
  totalAdjustments: number;

  @ApiProperty({ description: 'Total de ajustes implementados' })
  implementedAdjustments: number;

  @ApiProperty({ description: 'Total de ajustes pendientes' })
  pendingAdjustments: number;

  @ApiProperty({ description: 'Total de cursos en el departamento' })
  totalCourses: number;

  @ApiProperty({ description: 'Porcentaje de implementación de ajustes' })
  implementationRate: number;

  @ApiProperty({ description: 'Fecha de generación del reporte' })
  generatedAt: Date;

  @ApiProperty({ description: 'Semestre actual' })
  semester: string;
}
