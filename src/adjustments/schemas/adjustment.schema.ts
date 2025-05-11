import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AdjustmentDocument = Adjustment & Document;

// Sub-esquema para ajustes actuales
@Schema({ _id: false })
class CurrentAdjustment {
  @ApiProperty({
    example: 'tiempo_extra',
    description: 'Tipo de ajuste razonable',
    enum: ['tiempo_extra', 'formato_alternativo', 'asistencia_especial'],
  })
  @Prop({ required: true, type: String })
  type: string;

  @ApiProperty({
    example: 'MAT101-1',
    description: 'Código NRC del curso asociado',
  })
  @Prop({ required: true, type: String })
  courseNrc: string;

  @ApiProperty({
    example: 'coordinadora@ucn.cl',
    description: 'Email del coordinador que aprobó el ajuste',
  })
  @Prop({ required: true, type: String })
  approvedBy: string;

  @ApiProperty({
    example: '2025-04-10T00:00:00Z',
    description: 'Fecha de aprobación del ajuste',
  })
  @Prop({ required: true, type: Date })
  approvedAt: Date;

  @ApiProperty({
    example: true,
    description: 'Indica si requiere confirmación semestral del estudiante',
  })
  @Prop({ required: true, type: Boolean })
  requiresSemesterConfirmation: boolean;

  @ApiProperty({
    example: '2025-12-31T00:00:00Z',
    description: 'Fecha de expiración del ajuste',
  })
  @Prop({ required: true, type: Date })
  expirationDate: Date;
}

// Sub-esquema para historial de cambios
@Schema({ _id: false })
class AdjustmentHistory {
  @ApiProperty({
    example: 'tiempo_extra',
    description: 'Tipo de ajuste registrado en el historial',
  })
  @Prop({ required: true, type: String })
  type: string;

  @ApiProperty({
    example: 'aprobado',
    description: 'Estado del ajuste',
    enum: ['aprobado', 'rechazado', 'pendiente'],
  })
  @Prop({ required: true, type: String })
  status: string;

  @ApiProperty({
    example: 'maria@alumnos.ucn.cl',
    description: 'Email del solicitante',
  })
  @Prop({ required: true, type: String })
  requestedBy: string;

  @ApiProperty({
    example: 'coordinadora@ucn.cl',
    description: 'Email del revisor',
  })
  @Prop({ required: true, type: String })
  reviewedBy: string;

  @ApiProperty({
    example: '2025-04-10T00:00:00Z',
    description: 'Fecha del evento',
  })
  @Prop({ required: true, type: Date })
  timestamp: Date;

  @ApiProperty({
    example: 'Aprobado por alta necesidad',
    description: 'Comentarios adicionales',
  })
  @Prop({ type: String })
  comments?: string;
}

// Esquema principal
@Schema({ timestamps: true })
export class Adjustment extends Document {
  @ApiProperty({ description: 'ID único del ajuste (generado por MongoDB)', example: '605c72ef9167f86c2cabc456' })
  declare _id: string; // Agregado para Swagger

  @ApiProperty({
    example: '12345678-9',
    description: 'RUT del estudiante asociado',
  })
  @Prop({ required: true, type: String, index: true })
  studentRut: string;

  @ApiProperty({
    type: [CurrentAdjustment],
    description: 'Ajustes activos actualmente',
  })
  @Prop({ type: [CurrentAdjustment], default: [] })
  currentAdjustments: CurrentAdjustment[];

  @ApiProperty({
    type: [AdjustmentHistory],
    description: 'Historial completo de cambios',
  })
  @Prop({ type: [AdjustmentHistory], default: [] })
  history: AdjustmentHistory[];

  @ApiProperty({ description: 'Fecha de creación del registro', example: '2023-01-01T12:00:00.000Z', readOnly: true })
  declare createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización del registro', example: '2023-01-02T15:30:00.000Z', readOnly: true })
  declare updatedAt: Date;
}

export const AdjustmentSchema = SchemaFactory.createForClass(Adjustment);
