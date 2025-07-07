import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsMongoId,
  IsArray,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateDepartmentDto } from './create-department.dto';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {
  @ApiProperty({ description: 'Nombre del departamento', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Código único del departamento',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: 'ID del jefe de departamento', required: false })
  @IsOptional()
  @IsMongoId()
  headId?: string;

  @ApiProperty({
    description: 'Lista de IDs de docentes del departamento',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  teacherIds?: string[];

  @ApiProperty({ description: 'Facultad a la que pertenece', required: false })
  @IsOptional()
  @IsString()
  faculty?: string;

  @ApiProperty({ description: 'Sede del departamento', required: false })
  @IsOptional()
  @IsString()
  campus?: string;

  @ApiProperty({
    description: 'Estado activo del departamento',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Semestre actual',
    required: false,
    example: '2025-1',
  })
  @IsOptional()
  @IsString()
  currentSemester?: string;
}
