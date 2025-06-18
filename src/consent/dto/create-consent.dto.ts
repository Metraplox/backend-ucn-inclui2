import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateConsentDto {
  @ApiProperty({
    description: 'Si el estudiante autoriza compartir su diagnóstico con docentes y otras áreas',
    example: true,
  })
  @IsBoolean({ message: 'allowsDataSharing debe ser un valor booleano.' })
  allowsDataSharing: boolean;

  @ApiProperty({
    description: 'Comentarios adicionales del estudiante sobre su decisión',
    example: 'Autorizo compartir mi información para recibir mejor apoyo académico',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Los comentarios deben ser texto.' })
  @MaxLength(500, { message: 'Los comentarios no pueden exceder 500 caracteres.' })
  comments?: string;

  // studentId se tomará del usuario autenticado
  // Los datos del estudiante (RUT, nombre, carrera) se extraerán automáticamente
  // ipAddress y userAgent se capturan desde la request
  // registeredBy será el usuario autenticado
}
