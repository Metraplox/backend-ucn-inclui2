import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { DocumentCategory } from '../schemas/document.schema'; // Ajusta la ruta si es necesario

export class CreateDocumentDto {
  @ApiProperty({
    description: 'ID del estudiante al que pertenece el documento.',
    example: '60c72b2f9b1d8c001f8e4a3c',
  })
  @IsMongoId({ message: 'El ID del estudiante debe ser un MongoID válido.' })
  @IsNotEmpty({ message: 'El ID del estudiante no puede estar vacío.' })
  studentId: string; // Se espera un string que represente un ObjectId

  @ApiProperty({
    description: 'Categoría del documento.',
    enum: DocumentCategory,
    example: DocumentCategory.INFORME_MEDICO,
  })
  @IsEnum(DocumentCategory, { message: 'La categoría del documento no es válida.' })
  @IsNotEmpty({ message: 'La categoría del documento no puede estar vacía.' })
  category: DocumentCategory;

  @ApiProperty({
    description: 'Descripción opcional del documento.',
    example: 'Informe médico detallado del especialista.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto.' })
  description?: string;

  // Nota: fileNameOriginal, storageFileName, filePath, mimeType, sizeBytes, uploadedBy, uploadDate
  // generalmente se manejan en el servicio después de que el archivo es procesado por Multer
  // y a partir de la información del usuario autenticado (para uploadedBy).
  // Por lo tanto, no se incluyen típicamente en el DTO de creación que envía el cliente para los metadatos.
}
