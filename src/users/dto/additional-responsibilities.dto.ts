import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsOptional, IsArray } from 'class-validator';

export class AdditionalResponsibilitiesDto {
  @ApiProperty({
    description: 'Indica si el usuario es Jefe de Departamento.',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isDepartmentHead?: boolean;

  @ApiProperty({
    description: 'Indica si el usuario es Jefe de Carrera.',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isCareerHead?: boolean;

  @ApiProperty({
    description: 'Indica si el usuario es personal de DIDDEC.',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isDIDDECStaff?: boolean;

  @ApiProperty({
    description: 'IDs de los departamentos que gestiona el usuario (si aplica).',
    type: [String],
    example: ['60f7eabc1234567890abcdef'],
    required: false,
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  departmentIds?: string[];

  @ApiProperty({
    description: 'IDs de las carreras que gestiona el usuario (si aplica).',
    type: [String],
    example: ['60f7eabc1234567890abcdef'],
    required: false,
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  careerIds?: string[];
}
