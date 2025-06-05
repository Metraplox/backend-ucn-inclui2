import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type AcademicHistoryDocument = AcademicHistory & Document;

@Schema({ timestamps: true })
export class AcademicHistory {
  @ApiProperty({
    description: 'ID único del registro de historial académico',
    example: '605c72ef9167f86c2cabc123',
  })
  declare _id: string;

  @ApiProperty({
    description: 'ID del estudiante',
    example: '605c72ef9167f86c2cabc123',
  })
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @ApiProperty({
    description: 'ID del curso',
    example: '605c72ef9167f86c2cabc123',
  })
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @ApiProperty({
    description: 'Semestre académico',
    example: '2025-1',
  })
  @Prop({ required: true, trim: true, index: true })
  semester: string;

  @ApiProperty({
    description: 'Ajustes aplicados en este curso',
    example: ['Tiempo adicional', 'Material adaptado']
  })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Adjustment' }], default: [] })
  adjustmentIds: Types.ObjectId[];

  @ApiProperty({
    description: 'Estado del curso',
    example: 'En curso',
    enum: ['En curso', 'Aprobado', 'Reprobado', 'Abandono']
  })
  @Prop({ required: true, enum: ['En curso', 'Aprobado', 'Reprobado', 'Abandono'], default: 'En curso' })
  status: string;

  @ApiProperty({
    description: 'Notas o comentarios sobre la implementación de ajustes',
    example: 'El estudiante requirió apoyo adicional durante las evaluaciones',
    required: false
  })
  @Prop({ required: false })
  notes: string;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2023-01-01T12:00:00.000Z',
    readOnly: true,
  })
  declare createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    example: '2023-01-02T15:30:00.000Z',
    readOnly: true,
  })
  declare updatedAt: Date;
}

export const AcademicHistorySchema = SchemaFactory.createForClass(AcademicHistory);

// Índices para optimizar consultas
AcademicHistorySchema.index({ studentId: 1, semester: 1 });
AcademicHistorySchema.index({ courseId: 1, semester: 1 });
