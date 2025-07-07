import { ApiProperty } from '@nestjs/swagger';

// Interface for career information in the response
export interface CareerHeadCareerDto {
  _id: string;
  code: string;
  name: string;
  faculty: string;
  campus: string;
  duration: number;
  totalStudents: number;
}

// Class for the API response with Swagger decorators
export class CareerHeadStatsDto {
  @ApiProperty({
    description: 'Carreras a cargo del jefe de carrera',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        _id: { type: 'string', description: 'ID de la carrera' },
        code: { type: 'string', description: 'Código de la carrera' },
        name: { type: 'string', description: 'Nombre de la carrera' },
        faculty: {
          type: 'string',
          description: 'Facultad a la que pertenece la carrera',
        },
        campus: {
          type: 'string',
          description: 'Sede donde se imparte la carrera',
        },
        duration: {
          type: 'number',
          description: 'Duración de la carrera en semestres',
        },
        totalStudents: {
          type: 'number',
          description: 'Número total de estudiantes en la carrera',
        },
      },
    },
  })
  careers: CareerHeadCareerDto[];

  @ApiProperty({
    description: 'Número total de estudiantes en todas las carreras',
    type: 'number',
    example: 150,
  })
  totalStudents: number;

  @ApiProperty({
    description: 'Número total de estudiantes con NEE',
    type: 'number',
    example: 25,
  })
  studentsWithNEE: number;

  @ApiProperty({
    description: 'Número total de ajustes razonables',
    type: 'number',
    example: 50,
  })
  totalAdjustments: number;

  @ApiProperty({
    description: 'Número de ajustes implementados',
    type: 'number',
    example: 40,
  })
  implementedAdjustments: number;

  @ApiProperty({
    description: 'Porcentaje de implementación de ajustes',
    type: 'number',
    example: 80,
  })
  implementationRate: number;
}
