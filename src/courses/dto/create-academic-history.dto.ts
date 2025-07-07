import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsEnum,
  IsOptional,
  IsArray,
  Matches,
} from 'class-validator';

export class CreateAcademicHistoryDto {
  @ApiProperty({
    description: 'ID del estudiante',
    example: '605c72ef9167f86c2cabc123',
  })
  @IsMongoId({ message: 'El ID del estudiante debe ser un MongoID válido' })
  @IsNotEmpty({ message: 'El ID del estudiante no puede estar vacío' })
  readonly studentId: string;

  @ApiProperty({
    description: 'ID del curso',
    example: '605c72ef9167f86c2cabc124',
  })
  @IsMongoId({ message: 'El ID del curso debe ser un MongoID válido' })
  @IsNotEmpty({ message: 'El ID del curso no puede estar vacío' })
  readonly courseId: string;

  @ApiProperty({
    description: 'Semestre académico',
    example: '2025-1',
  })
  @IsString({ message: 'El semestre debe ser texto' })
  @IsNotEmpty({ message: 'El semestre no puede estar vacío' })
  @Matches(/^\d{4}-[1-2]$/, {
    message: 'El semestre debe tener el formato YYYY-P donde P es 1 o 2',
  })
  readonly semester: string;

  @ApiProperty({
    description: 'IDs de los ajustes aplicados',
    example: ['605c72ef9167f86c2cabc125', '605c72ef9167f86c2cabc126'],
    required: false,
    type: [String],
  })
  @IsArray({ message: 'Los ajustes deben ser un array de IDs' })
  @IsMongoId({
    each: true,
    message: 'Cada ID de ajuste debe ser un MongoID válido',
  })
  @IsOptional()
  readonly adjustmentIds?: string[];

  @ApiProperty({
    description: 'Estado del curso',
    example: 'En curso',
    enum: ['En curso', 'Aprobado', 'Reprobado', 'Abandono'],
  })
  @IsEnum(['En curso', 'Aprobado', 'Reprobado', 'Abandono'], {
    message:
      'El estado debe ser uno de: En curso, Aprobado, Reprobado, Abandono',
  })
  @IsNotEmpty({ message: 'El estado no puede estar vacío' })
  readonly status: string;

  @ApiProperty({
    description: 'Notas o comentarios sobre la implementación de ajustes',
    example: 'El estudiante requirió apoyo adicional durante las evaluaciones',
    required: false,
  })
  @IsString({ message: 'Las notas deben ser texto' })
  @IsOptional()
  readonly notes?: string;
}
