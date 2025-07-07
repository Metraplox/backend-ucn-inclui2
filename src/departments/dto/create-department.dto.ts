import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsMongoId,
  IsArray,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Nombre del departamento' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Código único del departamento' })
  @IsString()
  @IsNotEmpty()
  code: string;

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

  @ApiProperty({ description: 'Facultad a la que pertenece' })
  @IsString()
  @IsNotEmpty()
  faculty: string;

  @ApiProperty({ description: 'Sede del departamento' })
  @IsString()
  @IsNotEmpty()
  campus: string;

  @ApiProperty({ description: 'Estado activo del departamento', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Semestre actual', example: '2025-1' })
  @IsString()
  @IsNotEmpty()
  currentSemester: string;
}
