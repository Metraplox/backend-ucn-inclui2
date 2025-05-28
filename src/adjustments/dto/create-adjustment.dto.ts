import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  ValidateNested,
  IsDateString,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CurrentAdjustmentDto {
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
  @ApiProperty({
    description: 'Semestre académico al que corresponde el ajuste',
    example: '2025-1',
  })
  @IsString()
  semester: string;
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

  @ApiProperty({
    description: 'Timestamp de creación',
    example: '2025-05-28T00:00:00Z',
    required: false,
  })
  @IsDateString()
  createdAt?: string;

  @ApiProperty({
    description: 'Timestamp de última actualización',
    example: '2025-05-28T00:00:00Z',
    required: false,
  })
  @IsDateString()
  updatedAt?: string;
}
