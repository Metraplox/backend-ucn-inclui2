import { PartialType } from '@nestjs/mapped-types';
import { CreateCareerDto } from './create-career.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsMongoId,
  Matches,
  IsArray,
} from 'class-validator';

export class UpdateCareerDto extends PartialType(CreateCareerDto) {
  @ApiProperty({
    description: 'Nombre de la carrera',
    example: 'Ingeniería Civil en Computación e Informática',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  name?: string;

  @ApiProperty({
    description: 'Código de la carrera',
    example: 'ICC',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El código debe ser texto' })
  code?: string;

  @ApiProperty({
    description: 'Facultad a la que pertenece la carrera',
    example: 'Ingeniería',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La facultad debe ser texto' })
  faculty?: string;

  @ApiProperty({
    description: 'Semestre académico actual',
    example: '2025-1',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El semestre debe ser texto' })
  @Matches(/^\d{4}-[1-2]$/, {
    message: 'El semestre debe tener el formato YYYY-P donde P es 1 o 2',
  })
  currentSemester?: string;

  @ApiProperty({
    description: 'ID del departamento al que pertenece la carrera',
    example: '6836440b3928a28e0e78eca1',
    required: false,
  })
  @IsOptional()
  @IsMongoId({ message: 'El ID del departamento debe ser un MongoID válido' })
  departmentId?: string;

  @ApiProperty({
    description: 'Duración de la carrera en semestres',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La duración debe ser un número' })
  duration?: number;

  @ApiProperty({
    description: 'Lista de IDs de estudiantes de la carrera',
    example: ['6836440b3928a28e0e78eca1', '6836440b3928a28e0e78eca2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({
    each: true,
    message: 'Cada ID de estudiante debe ser un MongoID válido',
  })
  studentIds?: string[];

  @ApiProperty({
    description: 'Si la carrera está activa',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  isActive?: boolean;

  @ApiProperty({
    description: 'ID del jefe de carrera',
    example: '60c72b2f9b1d8c001f8e4a3c',
    required: false,
  })
  @IsOptional()
  @IsMongoId({
    message: 'El ID del jefe de carrera debe ser un MongoID válido',
  })
  headId?: string;
}
