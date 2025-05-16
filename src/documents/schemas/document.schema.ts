import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Student } from '../../students/schemas/student.schema';
import { User } from '../../users/schemas/user.schema';

export type DocumentDocument = Document & DocumentEntity; // Renombrado a DocumentEntity para evitar colisión con mongoose.Document

export enum DocumentCategory {
  INFORME_MEDICO = 'Informe Médico',
  CERTIFICADO_DISCAPACIDAD = 'Certificado de Discapacidad',
  CONSENTIMIENTO_INFORMADO = 'Consentimiento Informado',
  CERTIFICADO_ALUMNO_REGULAR = 'Certificado Alumno Regular',
  DIAGNOSTICO = 'Diagnóstico',
  INFORME = 'Informe',
  OTRO = 'Otro'
}

export enum DocumentStatus {
  PENDIENTE = 'pendiente',
  VERIFICADO = 'verificado',
  RECHAZADO = 'rechazado'
}

@Schema({ timestamps: true })
export class DocumentEntity {
  @ApiProperty({ description: 'ID único del documento (generado por MongoDB)', example: '605c72ef9167f86c2cabc001' })
  declare _id: string;

  @ApiProperty({ description: 'ID del estudiante asociado al documento', example: '60c72b2f9b1d8c001f8e4a3c', type: String })
  @Prop({ type: Types.ObjectId, ref: Student.name, required: true, index: true })
  studentId: Types.ObjectId;

  @ApiProperty({ description: 'Nombre original del archivo subido', example: 'informe_medico.pdf' })
  @Prop({ required: true, trim: true })
  fileNameOriginal: string;

  @ApiProperty({ description: 'Nombre del archivo almacenado en el sistema (puede incluir UUID)', example: 'uuid-informe_medico.pdf' })
  @Prop({ required: true, trim: true })
  storageFileName: string;

  @ApiProperty({ description: 'Ruta donde se almacena el archivo en el servidor', example: 'uploads/uuid-informe_medico.pdf' })
  @Prop({ required: true, trim: true })
  filePath: string;

  @ApiProperty({ description: 'Tipo MIME del archivo', example: 'application/pdf' })
  @Prop({ required: true, trim: true })
  mimeType: string;

  @ApiProperty({ description: 'Tamaño del archivo en bytes', example: 102400 })
  @Prop({ required: true })
  sizeBytes: number;

  @ApiProperty({ description: 'Categoría del documento', enum: DocumentCategory, example: DocumentCategory.INFORME_MEDICO })
  @Prop({ type: String, enum: DocumentCategory, required: true })
  category: DocumentCategory;

  @ApiProperty({ description: 'Descripción adicional del documento', example: 'Informe detallado del especialista.', required: false })
  @Prop({ trim: true })
  description?: string;

  @ApiProperty({ description: 'ID del usuario (personal/admin) que subió el documento', example: '605c72ef9167f86c2cabc789' })
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  uploadedBy: Types.ObjectId;

  @ApiProperty({ description: 'Fecha y hora de subida del documento', example: '2023-05-10T09:00:00.000Z' })
  @Prop({ type: Date, default: Date.now })
  uploadDate: Date;

  @ApiProperty({ description: 'Estado del documento', enum: DocumentStatus, example: DocumentStatus.PENDIENTE })
  @Prop({ type: String, enum: DocumentStatus, default: DocumentStatus.PENDIENTE })
  status: DocumentStatus;

  @ApiProperty({ description: 'ID del usuario que verificó el documento', example: '605c72ef9167f86c2cabc789', required: false })
  @Prop({ type: Types.ObjectId, ref: User.name })
  verifiedBy?: Types.ObjectId;

  @ApiProperty({ description: 'Fecha de verificación del documento', example: '2023-05-15T14:30:00.000Z', required: false })
  @Prop({ type: Date })
  verificationDate?: Date;

  @ApiProperty({ description: 'Comentarios sobre la verificación', example: 'Documento verificado correctamente', required: false })
  @Prop({ trim: true })
  comments?: string;

  @ApiProperty({ description: 'URL para acceder al archivo', example: 'https://example.com/files/uuid-informe_medico.pdf', required: false })
  @Prop({ trim: true })
  fileUrl?: string;

  @ApiProperty({ description: 'Fecha de creación del registro', example: '2023-01-01T12:00:00.000Z', readOnly: true })
  declare createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización del registro', example: '2023-01-02T15:30:00.000Z', readOnly: true })
  declare updatedAt: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentEntity); // Usar DocumentEntity
