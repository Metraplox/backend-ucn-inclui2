import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  ValidateNested,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CurrentAdjustmentDto {
  @ApiProperty({
    description: 'ID de la categoría del ajuste',
    example: '605c72ef9167f86c2cabc456',
  })
  @IsMongoId()
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
    description:"Fecha de Inicio del Ajuste",
    example:'2025-04-15T00:00:00Z',
  })
  @IsDateString()
  fechaInicio:string;


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
    description:'Id del estudiante',
    example:'749je919247eb81724'
  })
  @IsString()
  studentId:string;


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
