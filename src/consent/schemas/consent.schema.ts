import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Student } from '../../students/schemas/student.schema';
import { DocumentEntity } from '../../documents/schemas/document.schema'; // Usamos DocumentEntity

export type ConsentDocument = Consent & Document;

@Schema({ timestamps: true })
export class Consent {
  @Prop({ type: Types.ObjectId, ref: DocumentEntity.name, required: true, index: true })
  documentId: Types.ObjectId; // Referencia al documento para el cual se da consentimiento

  @Prop({ type: Types.ObjectId, ref: Student.name, required: true, index: true })
  studentId: Types.ObjectId; // Referencia al estudiante que da el consentimiento

  @Prop({ required: true })
  isConsentGiven: boolean; // true si se otorga, false si se revoca (o manejar revocación de otra manera)

  @Prop({ type: Date, default: Date.now })
  consentDate: Date; // Fecha y hora en que se registró el consentimiento/cambio

  @Prop({ required: false, trim: true })
  ipAddress?: string; // IP desde donde se dio el consentimiento (para auditoría)

  @Prop({ required: false, trim: true })
  userAgent?: string; // User agent del navegador (para auditoría)

  // Podría haber un campo para versionado o historial si el consentimiento puede cambiar varias veces.
  // Por ahora, se asume que un registro representa el estado actual.
}

export const ConsentSchema = SchemaFactory.createForClass(Consent);

// Índice compuesto para asegurar que un estudiante solo tenga un registro de consentimiento por documento.
// Opcional, dependiendo de si se permite múltiples registros de consentimiento (ej. historial) o solo el último.
// Si solo se quiere el último, una lógica de upsert en el servicio es más común.
// ConsentSchema.index({ documentId: 1, studentId: 1 }, { unique: true });
