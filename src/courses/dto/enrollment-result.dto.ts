import { ApiProperty } from '@nestjs/swagger';

export class EnrollmentResultDto {
  @ApiProperty({
    example: '5f3a8d7e1c9d440000a1b2c3',
    description: 'ID de matrícula',
  })
  enrollmentId: string;

  @ApiProperty({ example: '2024-1', description: 'Semestre académico' })
  semester: string;

  @ApiProperty({
    example: 'MAT-101',
    description: 'Código del curso matriculado',
  })
  courseCode: string;

  @ApiProperty({ example: 3, description: 'Créditos del curso' })
  credits: number;

  @ApiProperty({
    example: ['tiempo_adicional'],
    description: 'Ajustes aplicados',
    required: false,
  })
  adjustments?: string[];
}
