import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsMongoId } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiProperty({
    description: 'Código del curso (opcional)',
    example: 'MAT101',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El código debe ser texto' })
  codigo?: string;

  @ApiProperty({
    description: 'Código NRC del curso (opcional)',
    example: 'MAT101-1',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El NRC debe ser texto' })
  nrc?: string;

  @ApiProperty({
    description: 'Nombre del curso (opcional)',
    example: 'Cálculo I',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  nombre?: string;

  @ApiProperty({
    description: 'Nombre del profesor del curso (opcional)',
    example: 'Profesor Martínez',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre del profesor debe ser texto' })
  profesor?: string;

  @ApiProperty({
    description: 'Semestre académico (opcional)',
    example: '2025-1',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El semestre debe ser texto' })
  semestre?: string;

  @ApiProperty({
    description: 'IDs de estudiantes inscritos en el curso (opcional)',
    example: ['60c72b2f9b1d8c001f8e4a3c', '60c72b2f9b1d8c001f8e4a3d'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Los estudiantes deben ser un array' })
  @IsMongoId({ each: true, message: 'Cada ID de estudiante debe ser un MongoID válido' })
  estudiantes?: string[];
}
