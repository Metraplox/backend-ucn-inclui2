import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/schemas/user.schema';
import { Student } from '../../students/schemas/student.schema';
import { Category } from '../../categories/schemas/category.schema';

export type AdjustmentDocument = Adjustment & Document;

export enum AdjustmentStatus {
  PENDING = 'pendiente',
  APPROVED = 'aprobado',
  REJECTED = 'rechazado',
  IMPLEMENTED = 'implementado',
  EXPIRED = 'vencido',
  CANCELLED = 'cancelado',
  ACTIVE = 'activo',
}

// Sub-esquema para ajustes actuales
@Schema({ _id: false })
class CurrentAdjustment {
  @ApiProperty({
    example: '605c72ef9167f86c2cabc456',
    description: 'ID de la categoría del ajuste razonable',
    type: String,
  })
  @Prop({ type: Types.ObjectId, ref: Category.name, required: true })
  type: Types.ObjectId;

  @ApiProperty({
    example: 'MAT101-1',
    description: 'Código NRC del curso asociado',
  })
  @Prop({ required: true, type: String })
  courseNrc: string;

  @ApiProperty({
    example: 'Profesor Martínez',
    description: 'Nombre del profesor del curso',
  })
  @Prop({ type: String })
  profesor?: string;

  @ApiProperty({
    example: '605c72ef9167f86c2cabc789',
    description: 'ID del usuario que aprobó el ajuste',
  })
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  approvedBy: Types.ObjectId;

  @ApiProperty({
    example: '2025-04-10T00:00:00Z',
    description: 'Fecha de aprobación del ajuste',
  })
  @Prop({ required: true, type: Date })
  approvedAt: Date;

  @ApiProperty({
    example: '2025-04-15T00:00:00Z',
    description: 'Fecha de inicio del ajuste',
  })
  @Prop({ required: true, type: Date })
  fechaInicio: Date;

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

  @ApiProperty({
    example: AdjustmentStatus.ACTIVE,
    description: 'Estado actual del ajuste',
    enum: AdjustmentStatus,
  })
  @Prop({
    required: true,
    type: String,
    enum: AdjustmentStatus,
    default: AdjustmentStatus.ACTIVE,
  })
  estado: AdjustmentStatus;

  @ApiProperty({
    example: ['605c72ef9167f86c2cabc001', '605c72ef9167f86c2cabc002'],
    description: 'IDs de documentos asociados a este ajuste',
    type: [String],
  })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Document' }] })
  documentosAsociados?: Types.ObjectId[];

  @ApiProperty({
    example: 'Ajuste aprobado por solicitud médica',
    description: 'Comentarios adicionales sobre el ajuste',
  })
  @Prop({ type: String })
  comentarios?: string;

  @ApiProperty({
    example: '2025-1',
    description: 'Semestre académico al que corresponde el ajuste',
  })
  @Prop({ type: String })
  semester: string;

  @ApiProperty({
    description: 'Registro de docentes que han marcado como leído el ajuste',
    type: Array,
    example: [
      {
        userId: '605c72ef9167f86c2cabc001',
        readDate: '2025-05-20T14:30:00Z',
        comments: 'Entendido, implementaré este ajuste en mis evaluaciones',
      },
    ],
  })
  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: User.name, required: true },
        readDate: { type: Date, required: true },
        comments: { type: String },
      },
    ],
    default: [],
  })
  readBy?: Array<{
    userId: Types.ObjectId;
    readDate: Date;
    comments?: string;
  }>;

  @ApiProperty({
    description: 'Solicitudes de ayuda para implementar el ajuste',
    type: Array,
    example: [
      {
        userId: '605c72ef9167f86c2cabc001',
        requestDate: '2025-05-21T10:15:00Z',
        description: 'Necesito orientación sobre cómo adaptar mis materiales',
        status: 'pendiente',
      },
    ],
  })
  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: User.name, required: true },
        requestDate: { type: Date, required: true },
        description: { type: String, required: true },
        status: {
          type: String,
          enum: ['pendiente', 'en_proceso', 'resuelta'],
          default: 'pendiente',
        },
      },
    ],
    default: [],
  })
  helpRequests?: Array<{
    userId: Types.ObjectId;
    requestDate: Date;
    description: string;
    status: string;
  }>;
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
export class Adjustment {
  @ApiProperty({
    description: 'ID único del ajuste (generado por MongoDB)',
    example: '605c72ef9167f86c2cabc456',
  })
  declare _id: string;

  @ApiProperty({
    example: '12345678-9',
    description: 'RUT del estudiante asociado',
  })
  @Prop({ required: true, type: String, index: true })
  studentRut: string;

  @ApiProperty({
    example: '605c72ef9167f86c2cabc123',
    description: 'ID del estudiante asociado',
  })
  @Prop({
    type: Types.ObjectId,
    ref: Student.name,
    required: true,
    index: true,
  })
  studentId: Types.ObjectId;

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

  @ApiProperty({
    example: '2025-1',
    description: 'Semestre académico al que corresponde el ajuste',
  })
  @Prop({ type: String })
  semester?: string;

  @ApiProperty({
    example: '605c72ef9167f86c2cabc789',
    description: 'ID del último usuario que modificó el ajuste',
  })
  @Prop({ type: Types.ObjectId, ref: User.name })
  modificadoPor?: Types.ObjectId;

  @ApiProperty({
    example: '2025-05-15T10:30:00Z',
    description: 'Fecha de la última modificación manual',
  })
  @Prop({ type: Date })
  ultimaModificacion?: Date;

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

export const AdjustmentSchema = SchemaFactory.createForClass(Adjustment);
