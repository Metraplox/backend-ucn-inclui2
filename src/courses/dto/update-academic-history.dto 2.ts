import { PartialType } from '@nestjs/mapped-types';
import { CreateAcademicHistoryDto } from './create-academic-history.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAcademicHistoryDto extends PartialType(CreateAcademicHistoryDto) {
  @ApiProperty({
    description: 'Estado del curso actualizado (opcional)',
    example: 'Aprobado',
    enum: ['En curso', 'Aprobado', 'Reprobado', 'Abandono'],
    required: false,
  })
  status?: string;

  @ApiProperty({
    description: 'Notas o comentarios actualizados (opcional)',
    example: 'Se completaron satisfactoriamente los ajustes requeridos',
    required: false,
  })
  notes?: string;
}
