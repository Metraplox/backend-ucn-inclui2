import {
  IsString,
  IsEmail,
  IsNotEmpty,
  Matches,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
  IsMongoId,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({
    description: 'RUT único del estudiante (formato: 12345678-9 o 1234567-k)',
    example: '12345678-9',
    pattern: '^[0-9]{7,8}-[0-9kK]$',
  })
  @IsString({ message: 'El RUT debe ser un texto.' })
  @IsNotEmpty({ message: 'El RUT no puede estar vacío.' })
  @Matches(/^[0-9]{7,8}-[0-9kK]$/, {
    message: 'El RUT debe tener el formato 12345678-9 o 1234567-k.',
  })
  readonly rut: string;

  @ApiProperty({
    description: 'Nombres del estudiante',
    example: 'Juan Alberto',
  })
  @IsString({ message: 'Los nombres deben ser texto.' })
  @IsNotEmpty({ message: 'Los nombres no pueden estar vacíos.' })
  @MinLength(2, { message: 'Los nombres deben tener al menos 2 caracteres.' })
  readonly nombres: string; // Cambiado de name

  @ApiProperty({
    description: 'Apellidos del estudiante',
    example: 'Pérez González',
  })
  @IsString({ message: 'Los apellidos deben ser texto.' })
  @IsNotEmpty({ message: 'Los apellidos no pueden estar vacíos.' })
  @MinLength(2, { message: 'Los apellidos deben tener al menos 2 caracteres.' })
  readonly apellidos: string; // Cambiado de lastName

  @ApiProperty({
    description: 'Correo electrónico único del estudiante',
    example: 'juan.perez@example.com',
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

  @ApiProperty({
    description: 'Fecha de nacimiento del estudiante (YYYY-MM-DD)',
    example: '2000-05-15',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'La fecha de nacimiento debe ser una fecha válida en formato YYYY-MM-DD.',
    },
  )
  readonly fechaNacimiento?: Date;

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
