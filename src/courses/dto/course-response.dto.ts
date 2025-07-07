import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

class CourseTeacherDto {
  @ApiProperty()
  _id: Types.ObjectId;

  @ApiProperty()
  nombreCompleto: string;

  @ApiProperty()
  email: string;
}

export class CourseResponseDto {
  @ApiProperty({
    description: 'ID único del curso',
    example: '605c72ef9167f86c2cabc789',
  })
  _id: string;

  @ApiProperty({
    example: 'MAT101',
    description: 'Código del curso',
  })
  code: string;

  @ApiProperty({
    example: 'MAT101-1',
    description: 'Código NRC del curso',
  })
  nrc: string;

  @ApiProperty({
    example: 'Cálculo I',
    description: 'Nombre del curso',
  })
  nombre: string;

  @ApiProperty({
    type: CourseTeacherDto,
    required: false,
    description: 'Profesor del curso (si está poblado)',
  })
  teacherId: CourseTeacherDto;

  @ApiProperty({
    example: 'Departamento de Matemáticas',
    description: 'Departamento académico al que pertenece el curso',
  })
  departamento: string;

  @ApiProperty({
    example: '2025-1',
    description: 'Semestre académico',
  })
  semestre: string;

  @ApiProperty({
    description: 'IDs de estudiantes inscritos en el curso',
    type: [String],
    example: ['605c72ef9167f86c2cabc123', '605c72ef9167f86c2cabc124'],
  })
  students: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
