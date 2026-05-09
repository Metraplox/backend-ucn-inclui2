import { IsString, IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Importar ApiProperty

export class CreateStudentDto {
  @ApiProperty({
    description: 'RUT único del estudiante (formato: 12345678-9 o 1234567-k)',
    example: '12345678-9',
    pattern: '^[0-9]{7,8}-[0-9kK]$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{7,8}-[0-9kK]$/, {
    message: 'RUT must be in format 12345678-9 or 1234567-k',
  })
  readonly rut: string;

  @ApiProperty({ description: 'Nombre del estudiante', example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({ description: 'Apellido del estudiante', example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @ApiProperty({
    description: 'Correo electrónico único del estudiante',
    example: 'juan.perez@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  // Agrega aquí otras propiedades si las definiste en el schema
}
