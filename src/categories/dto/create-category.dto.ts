import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'El nombre único de la categoría de ajuste.',
    example: 'Tiempo adicional para evaluaciones',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Una descripción detallada de lo que implica la categoría.',
    example: 'Otorga un 50% de tiempo extra en pruebas y exámenes.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Indica si la categoría está activa y disponible para ser usada.',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 