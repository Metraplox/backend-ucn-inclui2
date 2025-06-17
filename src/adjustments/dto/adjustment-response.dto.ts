import { ApiProperty } from '@nestjs/swagger';
import { AdjustmentStatus } from '../schemas/adjustment.schema';
import { Types } from 'mongoose';

// DTOs anidados para representar datos poblados

class AdjustmentUserDto {
  @ApiProperty({ example: '605c72ef9167f86c2cabc789' })
  _id: Types.ObjectId;

  @ApiProperty({ example: 'Juan Perez' })
  nombreCompleto: string;

  @ApiProperty({ example: 'juan.perez@ucn.cl' })
  email: string;
}

class AdjustmentStudentDto {
  @ApiProperty({ example: '605c72ef9167f86c2cabc123' })
  _id: Types.ObjectId;

  @ApiProperty({ example: '12345678-9' })
  rut: string;

  @ApiProperty({ example: 'Maria Ignacia' })
  nombres: string;

  @ApiProperty({ example: 'Rojas Diaz' })
  apellidos: string;

  @ApiProperty({ example: 'maria.rojas@alumnos.ucn.cl' })
  email: string;
}

class AdjustmentCategoryDto {
  @ApiProperty({ example: '605c72ef9167f86c2cabc456' })
  _id: Types.ObjectId;

  @ApiProperty({ example: 'Tiempo extra para evaluaciones' })
  name: string;

  @ApiProperty({ example: 'Otorga un 50% de tiempo adicional en pruebas y exámenes.' })
  description: string;
}

class ReadByResponseDto {
  @ApiProperty({ type: () => AdjustmentUserDto })
  userId: AdjustmentUserDto;

  @ApiProperty()
  readDate: Date;

  @ApiProperty({ required: false })
  comments?: string;
}

class HelpRequestResponseDto {
  @ApiProperty({ type: () => AdjustmentUserDto })
  userId: AdjustmentUserDto;

  @ApiProperty()
  requestDate: Date;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: ['pendiente', 'en_proceso', 'resuelta'] })
  status: string;
}

class CurrentAdjustmentResponseDto {
  @ApiProperty({ type: () => AdjustmentCategoryDto })
  type: AdjustmentCategoryDto;

  @ApiProperty()
  courseNrc: string;

  @ApiProperty({ required: false })
  profesor?: string;

  @ApiProperty({ type: () => AdjustmentUserDto })
  approvedBy: AdjustmentUserDto;

  @ApiProperty()
  approvedAt: Date;

  @ApiProperty()
  fechaInicio: Date;

  @ApiProperty()
  requiresSemesterConfirmation: boolean;

  @ApiProperty()
  expirationDate: Date;

  @ApiProperty({ enum: AdjustmentStatus })
  estado: AdjustmentStatus;

  @ApiProperty({ type: [String], description: 'IDs de documentos asociados' })
  documentosAsociados?: Types.ObjectId[];

  @ApiProperty({ required: false })
  comentarios?: string;

  @ApiProperty()
  semester: string;

  @ApiProperty({ type: [ReadByResponseDto] })
  readBy?: ReadByResponseDto[];

  @ApiProperty({ type: [HelpRequestResponseDto] })
  helpRequests?: HelpRequestResponseDto[];
}

class AdjustmentHistoryResponseDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  requestedBy: string;

  @ApiProperty()
  reviewedBy: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty({ required: false })
  comments?: string;
}

// DTO Principal
export class AdjustmentResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  studentRut: string;

  @ApiProperty({ type: () => AdjustmentStudentDto })
  studentId: AdjustmentStudentDto;

  @ApiProperty({ type: [CurrentAdjustmentResponseDto] })
  currentAdjustments: CurrentAdjustmentResponseDto[];

  @ApiProperty({ type: [AdjustmentHistoryResponseDto] })
  history: AdjustmentHistoryResponseDto[];

  @ApiProperty({ required: false })
  semester?: string;

  @ApiProperty({ type: () => AdjustmentUserDto, required: false })
  modificadoPor?: AdjustmentUserDto;

  @ApiProperty({ required: false })
  ultimaModificacion?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 