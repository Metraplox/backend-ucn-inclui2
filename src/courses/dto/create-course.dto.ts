import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Código del curso',
    example: 'MAT101',
  })
  @IsString({ message: 'El código debe ser texto' })
  @IsNotEmpty({ message: 'El código no puede estar vacío' })
  code: string;

  @ApiProperty({
    description: 'Código NRC del curso',
    example: 'MAT101-1',
  })
  @IsString({ message: 'El NRC debe ser texto' })
  @IsNotEmpty({ message: 'El NRC no puede estar vacío' })
  nrc: string;

  @ApiProperty({
    description: 'Nombre del curso',
    example: 'Cálculo I',
  })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  nombre: string;

  @ApiProperty({
    description: 'Nombre del profesor del curso',
    example: 'Profesor Martínez',
  })
  @IsString({ message: 'El nombre del profesor debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del profesor no puede estar vacío' })
  teacherName: string;

  @ApiProperty({
    description: 'Semestre académico',
    example: '2025-1',
  })
  @IsString({ message: 'El semestre debe ser texto' })
  @IsNotEmpty({ message: 'El semestre no puede estar vacío' })
  semestre: string;

  @ApiProperty({
    description: 'IDs de estudiantes inscritos en el curso (opcional)',
    example: ['60c72b2f9b1d8c001f8e4a3c', '60c72b2f9b1d8c001f8e4a3d'],
    required: false,
    type: [String],
  })
  //agregue esto para que al obtener mycourse, se puedan obtener los cursos de un profesor, no estaba el atributo en el documento y por lo tanto retornaba lista vacía
  @ApiProperty({
    description: 'Id del Profesor',
    example: 'MAT101',
  })
  @IsString({ message: 'El código debe ser texto' })
  @IsNotEmpty({ message: 'El código no puede estar vacío' })
  teacherId: string;

  @IsOptional()
  @IsArray({ message: 'Los estudiantes deben ser un array' })
  @IsMongoId({
    each: true,
    message: 'Cada ID de estudiante debe ser un MongoID válido',
  })
  students?: string[];
}
