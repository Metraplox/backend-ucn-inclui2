import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

class DepartmentHeadDto {
  @ApiProperty()
  _id: Types.ObjectId;

  @ApiProperty()
  nombreCompleto: string;

  @ApiProperty()
  email: string;
}

export class DepartmentResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ type: DepartmentHeadDto, required: false })
  headId: DepartmentHeadDto;

  @ApiProperty({ type: [String], description: 'Lista de IDs de docentes del departamento' })
  teacherIds: string[];

  @ApiProperty()
  faculty: string;

  @ApiProperty()
  campus: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  currentSemester: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 