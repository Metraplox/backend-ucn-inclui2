import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Student } from '../../students/schemas/student.schema';
import { User } from '../../users/schemas/user.schema';

export type ConsentDocument = Consent & Document;

@Schema({ timestamps: true })
export class Consent {
  @ApiProperty({
    description: 'ID único del registro de consentimiento (generado por MongoDB)',
    example: '605c72ef9167f86c2cabc999',
  })
  declare _id: string;

  @ApiProperty({
    description: 'ID del estudiante que otorga el consentimiento',
    example: '605c72ef9167f86c2cabc123',
    type: String,
  })
  @Prop({
    type: Types.ObjectId,
    ref: Student.name,
    required: true,
    unique: true, // Un estudiante solo puede tener un consentimiento activo
    index: true,
  })
  studentId: Types.ObjectId;

  @ApiProperty({
    description: 'Si el estudiante autoriza compartir su diagnóstico con docentes y otras áreas',
    example: true,
  })
  @Prop({ type: Boolean, required: true, default: false })
  allowsDataSharing: boolean;

  @ApiProperty({
    description: 'Fecha en que se otorgó el consentimiento',
    example: '2025-01-15T10:00:00.000Z',
  })
  @Prop({ type: Date, required: true, default: Date.now })
  consentDate: Date;

  @ApiProperty({
    description: 'RUT del estudiante (para auditoría y reportes)',
    example: '12.345.678-9',
  })
  @Prop({ type: String, required: true })
  studentRut: string;

  @ApiProperty({
    description: 'Nombre completo del estudiante (para auditoría)',
    example: 'Juan Carlos Pérez González',
  })
  @Prop({ type: String, required: true })
  studentName: string;

  @ApiProperty({
    description: 'Carrera del estudiante (para contexto)',
    example: 'Ingeniería en Sistemas Computacionales',
  })
  @Prop({ type: String, required: true })
  studentCareer: string;

  @ApiProperty({
    description: 'Comentarios o razones del estudiante',
    example: 'Prefiero mantener mi diagnóstico privado',
    required: false,
  })
  @Prop({ type: String, trim: true })
  comments?: string;

  @ApiProperty({
    description: 'ID del usuario que registró el consentimiento',
    example: '605c72ef9167f86c2cabc789',
  })
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  registeredBy: Types.ObjectId;

  @ApiProperty({
    description: 'Dirección IP desde donde se otorgó el consentimiento (auditoría)',
    example: '192.168.1.100',
    required: false,
  })
  @Prop({ required: false, trim: true })
  ipAddress?: string;

  @ApiProperty({
    description: 'User agent del navegador (auditoría)',
    example: 'Mozilla/5.0 (...)',
    required: false,
  })
  @Prop({ required: false, trim: true })
  userAgent?: string;

  @ApiProperty({
    description: 'Indica si el consentimiento está activo',
    example: true,
  })
  @Prop({ type: Boolean, required: true, default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de revocación (si el estudiante cambió de opinión)',
    required: false,
  })
  @Prop({ type: Date })
  revokedAt?: Date;

  @ApiProperty({
    description: 'Razón de revocación',
    required: false,
  })
  @Prop({ type: String, trim: true })
  revocationReason?: string;

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

export const ConsentSchema = SchemaFactory.createForClass(Consent);

// Índices para optimizar consultas
ConsentSchema.index({ studentId: 1, isActive: 1 });
ConsentSchema.index({ allowsDataSharing: 1, isActive: 1 });
ConsentSchema.index({ consentDate: 1 });
