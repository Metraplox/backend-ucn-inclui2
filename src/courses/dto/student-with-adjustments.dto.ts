import { ApiProperty } from '@nestjs/swagger';

class AdjustmentInfoDto {
  @ApiProperty({ description: 'ID del ajuste específico en el contexto del curso' })
  _id: string;

  @ApiProperty({ description: 'Tipo o categoría del ajuste' })
  tipo: string;

  @ApiProperty({ description: 'Descripción detallada del ajuste' })
  descripcion: string;
}

export class StudentWithAdjustmentsDto {
  @ApiProperty({ description: 'ID del estudiante' })
  _id: string;

  @ApiProperty({ description: 'Nombres del estudiante' })
  nombres: string;

  @ApiProperty({ description: 'Apellidos del estudiante' })
  apellidos: string;

  @ApiProperty({ description: 'RUT del estudiante' })
  rut: string;

  @ApiProperty({ description: 'Email del estudiante' })
  email: string;

  @ApiProperty({
    type: [AdjustmentInfoDto],
    description: 'Lista de ajustes que tiene el estudiante en este curso',
  })
  ajustes: AdjustmentInfoDto[];
} 