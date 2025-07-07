import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsMongoId,
  Matches,
  IsBoolean,
  MaxLength,
  IsISO8601,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../users/schemas/user.schema';

export class CreateStudentDto {
  @ApiProperty({
    description: 'Nombres del estudiante',
    example: 'Juan Andrés',
  })
  @IsString({ message: 'Los nombres deben ser una cadena de texto' })
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  nombres: string;

  @ApiProperty({
    description: 'Apellidos del estudiante',
    example: 'Pérez González',
  })
  @IsString({ message: 'Los apellidos deben ser una cadena de texto' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  apellidos: string;

  @ApiProperty({
    description:
      'RUT del estudiante, solo números y termina opcionalmente con K (sin puntos, sin guion, sin espacios)',
    example: '12345678K',
  })
  @IsString({ message: 'El RUT debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El RUT es obligatorio' })
  @Matches(/^[0-9]{7,8}[0-9K]?$/, {
    message:
      'El RUT debe contener 7 u 8 dígitos y terminar opcionalmente con K, sin guion, sin puntos, sin espacios',
  })
  rut: string;

  @ApiProperty({
    description: 'Correo electrónico institucional del estudiante',
    example: 'juan.perez@alumnos.ucn.cl',
  })
  @IsEmail(
    {},
    { message: 'El correo electrónico debe ser una dirección válida.' },
  )
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío.' })
  readonly email: string;

  @ApiProperty({
    description: 'ID de la carrera que cursa el estudiante',
    example: '605c72ef9167f86c2cabc123',
  })
  @IsMongoId({ message: 'El ID de la carrera debe ser un MongoID válido.' })
  @IsNotEmpty({ message: 'La carrera no puede estar vacía.' })
  readonly carreraId: string;

  @ApiProperty({
    description: 'Semestre académico actual',
    example: '2025-1',
  })
  @IsString({ message: 'El semestre debe ser texto.' })
  @IsNotEmpty({ message: 'El semestre no puede estar vacío.' })
  @Matches(/^\d{4}-[1-2]$/, {
    message: 'El semestre debe tener el formato YYYY-P donde P es 1 o 2',
  })
  readonly semester: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento del estudiante (YYYY-MM-DD)',
    example: '2000-05-15',
  })
  @IsOptional()
  @IsISO8601(
    {},
    {
      message:
        'La fecha de nacimiento debe ser una fecha válida en formato YYYY-MM-DD.',
    },
  )
  readonly fechaNacimiento?: string;

  @ApiProperty({
    description:
      'Información de contacto adicional (teléfono, dirección, etc.)',
    example: '+56912345678',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La información de contacto debe ser texto.' })
  @MaxLength(255, {
    message: 'La información de contacto no puede exceder los 255 caracteres.',
  })
  readonly informacionContacto?: string;

  @ApiProperty({
    description: 'Necesidades educativas especiales del estudiante',
    example: 'Apoyo visual para lecturas',
    required: false,
  })
  @IsOptional()
  @IsString({
    message: 'Las necesidades educativas especiales deben ser texto.',
  })
  @MaxLength(500, {
    message:
      'Las necesidades educativas especiales no pueden exceder los 500 caracteres.',
  })
  readonly necesidadesEducativasEspeciales?: string;
}
