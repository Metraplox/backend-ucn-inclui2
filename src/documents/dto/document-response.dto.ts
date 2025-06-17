import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { DocumentCategory, DocumentStatus } from '../schemas/document.schema';
import { UserPublicDataDto } from '../../users/dto/user-public-data.dto';

// Usaremos un subconjunto de UserPublicDataDto para el estudiante
// para evitar importar todo el DTO de estudiante.
class DocumentStudentDto {
  @ApiProperty()
  _id: Types.ObjectId;

  @ApiProperty()
  rut: string;

  @ApiProperty()
  nombres: string;

  @ApiProperty()
  apellidos: string;
}

export class DocumentResponseDto {
  @ApiProperty({ description: 'ID único del documento' })
  _id: string;

  @ApiProperty({ type: DocumentStudentDto, description: 'Estudiante asociado al documento' })
  studentId: DocumentStudentDto;

  @ApiProperty({ description: 'Nombre original del archivo' })
  fileNameOriginal: string;

  @ApiProperty({ description: 'Tipo MIME del archivo' })
  mimeType: string;

  @ApiProperty({ description: 'Tamaño del archivo en bytes' })
  sizeBytes: number;

  @ApiProperty({ enum: DocumentCategory, description: 'Categoría del documento' })
  category: DocumentCategory;

  @ApiProperty({ required: false, description: 'Descripción adicional' })
  description?: string;

  @ApiProperty({ type: UserPublicDataDto, description: 'Usuario que subió el documento' })
  uploadedBy: UserPublicDataDto;

  @ApiProperty({ description: 'Fecha de subida' })
  uploadDate: Date;

  @ApiProperty({ enum: DocumentStatus, description: 'Estado actual del documento' })
  status: DocumentStatus;

  @ApiProperty({ type: UserPublicDataDto, required: false, description: 'Usuario que verificó el documento' })
  verifiedBy?: UserPublicDataDto;

  @ApiProperty({ required: false, description: 'Fecha de verificación' })
  verificationDate?: Date;

  @ApiProperty({ required: false, description: 'Comentarios de la verificación' })
  comments?: string;

  @ApiProperty({ required: false, description: 'URL de descarga del archivo' })
  fileUrl?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 