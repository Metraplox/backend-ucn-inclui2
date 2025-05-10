import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Student } from '../../students/schemas/student.schema'; // Asegúrate que la ruta sea correcta
// import { User } from '../../users/schemas/user.schema'; // Asumiendo que tienes un User schema para 'uploadedBy'

export type DocumentDocument = Document & DocumentEntity; // Renombrado a DocumentEntity para evitar colisión con mongoose.Document

export enum DocumentCategory {
  INFORME_MEDICO = 'Informe Médico',
  CERTIFICADO_DISCAPACIDAD = 'Certificado de Discapacidad',
  CONSENTIMIENTO_INFORMADO = 'Consentimiento Informado',
  OTRO = 'Otro',
}

@Schema({ timestamps: true })
export class DocumentEntity { // Renombrado a DocumentEntity
  @Prop({ type: Types.ObjectId, ref: Student.name, required: true, index: true })
  studentId: Types.ObjectId; // o Student | Types.ObjectId si quieres popular

  @Prop({ required: true, trim: true })
  fileNameOriginal: string;

  @Prop({ required: true, trim: true }) // Nombre usado para guardar en el sistema de archivos, puede incluir un UUID
  storageFileName: string;

  @Prop({ required: true, trim: true }) // Ruta relativa o completa donde se almacena el archivo
  filePath: string;

  @Prop({ required: true, trim: true })
  mimeType: string;

  @Prop({ required: true })
  sizeBytes: number;

  @Prop({ type: String, enum: DocumentCategory, required: true })
  category: DocumentCategory;

  @Prop({ trim: true })
  description?: string;

  // Asumiendo que tienes un módulo de usuarios/personal. Si no, esto podría ser un string simple.
  // @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  // uploadedBy: Types.ObjectId; // o User | Types.ObjectId
  @Prop({ required: true, trim: true }) // Simplificado por ahora si no hay módulo User
  uploadedBy: string; // Podría ser el ID o nombre del personal

  @Prop({ type: Date, default: Date.now })
  uploadDate: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentEntity); // Usar DocumentEntity
