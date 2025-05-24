import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  ValidateNested,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

class CurrentAdjustmentDto {
  @ApiProperty({ description: 'Tipo de ajuste', example: 'tiempo_extra' })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'NRC del curso al que aplica el ajuste',
    example: 'MAT101-1',
  })
  @IsString()
  courseNrc: string;

  @ApiProperty({
    description: 'Correo del profesional que aprobó el ajuste',
    example: 'coordinadora.nee@ucn.cl',
  })
  @IsString()
  approvedBy: string;

  @ApiProperty({
    description: 'Fecha de aprobación del ajuste (ISO 8601)',
    example: '2025-04-10T10:00:00Z',
  })
  @IsDateString()
  approvedAt: string;

  @ApiProperty({
    description: 'Indica si el ajuste requiere confirmación semestral',
    example: true,
  })
  @IsBoolean()
  requiresSemesterConfirmation: boolean;

  @ApiProperty({
    description: 'Fecha de expiración del ajuste (ISO 8601)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsDateString()
  expirationDate: string;
}

export class CreateAdjustmentDto {
  @ApiProperty({
    description: 'RUT del estudiante asociado al ajuste',
    example: '12345678-9',
  })
  @IsString()
  studentRut: string;

  @ApiProperty({
    type: [CurrentAdjustmentDto],
    description: 'Lista de ajustes específicos para el estudiante',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CurrentAdjustmentDto)
  currentAdjustments: CurrentAdjustmentDto[];
}
