import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

class CareerHeadDto {
  @ApiProperty()
  _id: Types.ObjectId;

  @ApiProperty()
  nombreCompleto: string;
}

class CareerDepartmentDto {
  @ApiProperty()
  _id: Types.ObjectId;

  @ApiProperty()
  name: string;
}

export class CareerResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ type: CareerHeadDto, required: false })
  headId: CareerHeadDto;

  @ApiProperty({ type: CareerDepartmentDto })
  departmentId: CareerDepartmentDto;

  @ApiProperty({ type: [String], description: 'Lista de IDs de estudiantes de la carrera' })
  studentIds: string[];

  @ApiProperty()
  faculty: string;

  @ApiProperty()
  campus: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  currentSemester: string;
  
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 