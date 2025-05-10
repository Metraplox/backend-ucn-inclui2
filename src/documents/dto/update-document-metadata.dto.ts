import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { DocumentCategory } from '../schemas/document.schema'; // Ajusta la ruta si es necesario

export class UpdateDocumentMetadataDto {
  @ApiPropertyOptional({
    description: 'Nueva categoría del documento.',
    enum: DocumentCategory,
    example: DocumentCategory.OTRO,
  })
  @IsOptional()
  @IsEnum(DocumentCategory, { message: 'La categoría del documento no es válida.' })
  category?: DocumentCategory;

  @ApiPropertyOptional({
    description: 'Nueva descripción opcional del documento.',
    example: 'Actualización de informe médico.',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto.' })
  @MaxLength(500, { message: 'La descripción no puede exceder los 500 caracteres.'})
  description?: string;
}
