import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Student } from '../../students/schemas/student.schema';
import { DocumentEntity } from '../../documents/schemas/document.schema'; // Usamos DocumentEntity

export type ConsentDocument = Consent & Document;

@Schema({ timestamps: true })
export class Consent {
  @ApiProperty({
    description:
      'ID único del registro de consentimiento (generado por MongoDB)',
    example: '605c72ef9167f86c2cabc999',
  })
  declare _id: string;

  @ApiProperty({
    description: 'ID del documento asociado',
    example: '60c72b2f9b1d8c001f8e4a3c',
    type: String,
  })
  @Prop({
    type: Types.ObjectId,
    ref: DocumentEntity.name,
    required: true,
    index: true,
  })
  documentId: Types.ObjectId; // Referencia al documento para el cual se da consentimiento

  @ApiProperty({
    description: 'ID del estudiante que otorga el consentimiento',
    example: '605c72ef9167f86c2cabc123',
    type: String,
  })
  @Prop({
    type: Types.ObjectId,
    ref: Student.name,
    required: true,
    index: true,
  })
  studentId: Types.ObjectId; // Referencia al estudiante que da el consentimiento

  @ApiProperty({
    description: 'Estado del consentimiento (true si otorgado)',
    example: true,
  })
  @Prop({ required: true })
  isConsentGiven: boolean; // true si se otorga, false si se revoca (o manejar revocación de otra manera)

  @ApiProperty({
    description: 'Fecha y hora en que se registró el consentimiento/cambio',
    example: '2023-05-10T10:00:00.000Z',
  })
  @Prop({ type: Date, default: Date.now })
  consentDate: Date; // Fecha y hora en que se registró el consentimiento/cambio

  @ApiProperty({
    description:
      'Dirección IP desde donde se otorgó el consentimiento (auditoría)',
    example: '192.168.1.100',
    required: false,
  })
  @Prop({ required: false, trim: true })
  ipAddress?: string; // IP desde donde se dio el consentimiento (para auditoría)

  @ApiProperty({
    description:
      'User agent del navegador desde donde se otorgó el consentimiento (auditoría)',
    example: 'Mozilla/5.0 (...)',
    required: false,
  })
  @Prop({ required: false, trim: true })
  userAgent?: string; // User agent del navegador (para auditoría)

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

  // Podría haber un campo para versionado o historial si el consentimiento puede cambiar varias veces.
  // Por ahora, se asume que un registro representa el estado actual.
}

export const ConsentSchema = SchemaFactory.createForClass(Consent);

// Índice compuesto para asegurar que un estudiante solo tenga un registro de consentimiento por documento.
// Opcional, dependiendo de si se permite múltiples registros de consentimiento (ej. historial) o solo el último.
// Si solo se quiere el último, una lógica de upsert en el servicio es más común.
// ConsentSchema.index({ documentId: 1, studentId: 1 }, { unique: true });
