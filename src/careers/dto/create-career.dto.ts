import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsMongoId,
  Matches,
} from 'class-validator';

export class CreateCareerDto {
  @ApiProperty({
    description: 'Nombre de la carrera',
    example: 'Ingeniería Civil en Computación e Informática',
  })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name: string;

  @ApiProperty({
    description: 'Código de la carrera',
    example: 'ICC',
  })
  @IsString({ message: 'El código debe ser texto' })
  @IsNotEmpty({ message: 'El código no puede estar vacío' })
  code: string;

  @ApiProperty({
    description: 'Facultad a la que pertenece la carrera',
    example: 'Ingeniería',
  })
  @IsString({ message: 'La facultad debe ser texto' })
  @IsNotEmpty({ message: 'La facultad no puede estar vacía' })
  faculty: string;

  @ApiProperty({
    description: 'Semestre académico actual',
    example: '2025-1',
  })
  @IsString({ message: 'El semestre debe ser texto' })
  @IsNotEmpty({ message: 'El semestre no puede estar vacío' })
  @Matches(/^\d{4}-[1-2]$/, {
    message: 'El semestre debe tener el formato YYYY-P donde P es 1 o 2',
  })
  currentSemester: string;

  @ApiProperty({
    description: 'Duración de la carrera en semestres',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La duración debe ser un número' })
  duration?: number;

  @ApiProperty({
    description: 'ID del departamento al que pertenece la carrera',
    example: '6836440b3928a28e0e78eca1',
  })
  @IsMongoId({ message: 'El ID del departamento debe ser un MongoID válido' })
  @IsNotEmpty({ message: 'El ID del departamento no puede estar vacío' })
  departmentId: string;

  @ApiProperty({
    description: 'Si la carrera está activa',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  isActive?: boolean;

  @ApiProperty({
    description: 'Campus donde se imparte la carrera',
    example: 'ANTOFAGASTA',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El campus debe ser texto' })
  campus?: string;
}
