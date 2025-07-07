import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class TeacherRegisterDto {
  @ApiProperty({
    description: 'Nombre completo del docente',
    example: 'Ana Torres',
  })
  @IsString()
  @IsNotEmpty()
  nombreCompleto: string;

  @ApiProperty({
    description:
      'Correo electrónico institucional del docente (debe ser @ucn.cl, pero no @alumnos.ucn.cl)',
    example: 'ana.torres@ucn.cl',
  })
  @IsEmail({}, { message: 'El formato del email no es válido.' })
  @Matches(/^[\w-\.]+@(?<!alumnos\.)ucn\.cl$/, {
    message:
      'El email debe ser una dirección de correo @ucn.cl que no pertenezca al dominio de alumnos.',
  })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contraseña para la cuenta del docente',
    example: 'ClaveSegura2025!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @IsNotEmpty()
  password: string;
}
