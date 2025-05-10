import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  StreamableFile,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException, // <--- Añadido NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { Types } from 'mongoose';

import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentMetadataDto } from './dto/update-document-metadata.dto';
import { DocumentEntity } from './schemas/document.schema';

// Configuración básica de almacenamiento (debería coincidir o ser gestionada centralmente con el servicio)
const UPLOAD_LOCATION = process.env.UPLOAD_LOCATION || path.join(__dirname, '..', '..', 'uploads');

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { dest: UPLOAD_LOCATION })) // 'file' es el nombre del campo en el form-data
  @ApiOperation({ summary: 'Subir un nuevo documento para un estudiante (personal)' })
  @ApiConsumes('multipart/form-data') // Indicar que este endpoint consume form-data
  @ApiBody({
    description: 'Archivo a subir y metadatos del documento.',
    // Swagger no tiene un buen soporte para describir multipart/form-data con DTOs y archivos directamente.
    // Se suele documentar el campo del archivo y los campos del DTO por separado.
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'El archivo a subir.',
        },
        studentId: { type: 'string', example: '60c72b2f9b1d8c001f8e4a3c' },
        category: { type: 'string', example: 'Informe Médico' },
        description: { type: 'string', example: 'Informe detallado', required: false },
      },
      required: ['file', 'studentId', 'category'],
    },
  })
  @ApiResponse({ status: 201, description: 'Documento subido y metadatos guardados.', type: DocumentEntity })
  @ApiResponse({ status: 400, description: 'Datos inválidos o archivo faltante/incorrecto.' })
  async uploadDocument(
    // TODO: Se ha eliminado ParseFilePipe temporalmente debido a un error persistente de TypeScript:
    // "Type 'boolean' is not assignable to type 'string[]'." en la línea de validadores.
    // Esto significa que no hay validación de tamaño o tipo de archivo en este momento.
    // Se debe investigar y reintroducir la validación de archivos.
    @UploadedFile()
    file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto, // NestJS mapeará los campos del form-data al DTO
  ): Promise<DocumentEntity> {
    // Asumimos que 'uploadedByStaffId' vendrá de la autenticación (ej. req.user.id)
    // Por ahora, lo simularemos o dejaremos como un placeholder.
    const uploadedByStaffId = 'staff-placeholder-id'; // Reemplazar con lógica de usuario autenticado
    return this.documentsService.uploadForStudentByStaff(file, createDocumentDto, uploadedByStaffId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Obtener todos los documentos de un estudiante específico' })
  @ApiParam({ name: 'studentId', description: 'ID del estudiante', type: String })
  @ApiResponse({ status: 200, description: 'Lista de documentos del estudiante.', type: [DocumentEntity] })
  @ApiResponse({ status: 400, description: 'ID de estudiante inválido.' })
  async getDocumentsByStudent(@Param('studentId') studentId: string): Promise<DocumentEntity[]> {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('ID de estudiante inválido.');
    }
    return this.documentsService.getDocumentsByStudentId(studentId);
  }

  @Get(':documentId/metadata')
  @ApiOperation({ summary: 'Obtener los metadatos de un documento específico' })
  @ApiParam({ name: 'documentId', description: 'ID del documento', type: String })
  @ApiResponse({ status: 200, description: 'Metadatos del documento.', type: DocumentEntity })
  @ApiResponse({ status: 404, description: 'Documento no encontrado.' })
  @ApiResponse({ status: 400, description: 'ID de documento inválido.' })
  async getDocumentMetadata(@Param('documentId') documentId: string): Promise<DocumentEntity> {
     if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }
    return this.documentsService.getDocumentById(documentId);
  }

  @Get(':documentId/download')
  @ApiOperation({ summary: 'Descargar un archivo de documento específico' })
  @ApiParam({ name: 'documentId', description: 'ID del documento a descargar', type: String })
  @ApiResponse({ status: 200, description: 'Archivo del documento.' }) // El tipo de contenido será el del archivo
  @ApiResponse({ status: 404, description: 'Documento o archivo no encontrado.' })
  @ApiResponse({ status: 400, description: 'ID de documento inválido.' })
  async downloadDocument(
    @Param('documentId') documentId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
     if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }
    const document = await this.documentsService.getDocumentFileDetails(documentId);
    
    // filePath en el schema debe ser la ruta absoluta al archivo o una ruta que Multer haya guardado
    // y que sea accesible para fs.createReadStream.
    // Asegúrate que UPLOAD_LOCATION y la forma en que se guardan las rutas sean consistentes.
    // Si filePath es relativo al UPLOAD_LOCATION: const filePath = path.join(UPLOAD_LOCATION, document.storageFileName);
    // Si filePath ya es absoluto: const filePath = document.filePath;
    const filePath = document.filePath; // Asumiendo que filePath es la ruta completa y correcta.

    try {
      // Verificar si el archivo existe antes de intentar leerlo
      await fs.promises.access(filePath, fs.constants.F_OK);
    } catch (error) {
      throw new NotFoundException(`Archivo físico no encontrado para el documento ID "${documentId}" en la ruta ${filePath}`);
    }

    const fileStream = fs.createReadStream(filePath);
    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${document.fileNameOriginal}"`,
    });
    return new StreamableFile(fileStream);
  }

  @Patch(':documentId/metadata')
  @ApiOperation({ summary: 'Actualizar los metadatos de un documento existente' })
  @ApiParam({ name: 'documentId', description: 'ID del documento a actualizar', type: String })
  @ApiBody({ type: UpdateDocumentMetadataDto })
  @ApiResponse({ status: 200, description: 'Metadatos actualizados exitosamente.', type: DocumentEntity })
  @ApiResponse({ status: 404, description: 'Documento no encontrado.' })
  @ApiResponse({ status: 400, description: 'ID de documento inválido o datos de entrada inválidos.' })
  async updateMetadata(
    @Param('documentId') documentId: string,
    @Body() updateDto: UpdateDocumentMetadataDto,
  ): Promise<DocumentEntity> {
     if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }
    return this.documentsService.updateDocumentMetadata(documentId, updateDto);
  }

  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un documento (metadatos y archivo físico)' })
  @ApiParam({ name: 'documentId', description: 'ID del documento a eliminar', type: String })
  @ApiResponse({ status: 204, description: 'Documento eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado.' })
  @ApiResponse({ status: 400, description: 'ID de documento inválido.' })
  async deleteDocument(@Param('documentId') documentId: string): Promise<void> {
     if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }
    await this.documentsService.deleteDocument(documentId);
  }

  // Endpoint para que los estudiantes suban sus propios documentos
  @Post('student/upload') // Ruta podría ser '/me/documents/upload' o similar si se usa un prefijo de ruta para estudiantes
  @UseInterceptors(FileInterceptor('file', { dest: UPLOAD_LOCATION }))
  @ApiOperation({ summary: 'Subir un nuevo documento (estudiante autenticado)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo a subir y metadatos del documento. El studentId en el DTO debe coincidir con el del estudiante autenticado.',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'El archivo a subir.' },
        studentId: { type: 'string', example: '60c72b2f9b1d8c001f8e4a3c', description: 'Debe ser el ID del estudiante autenticado.' },
        category: { type: 'string', example: DocumentEntity.name }, // Usar DocumentCategory.INFORME_MEDICO
        description: { type: 'string', example: 'Mi informe médico', required: false },
      },
      required: ['file', 'studentId', 'category'],
    },
  })
  @ApiResponse({ status: 201, description: 'Documento subido y metadatos guardados.', type: DocumentEntity })
  @ApiResponse({ status: 400, description: 'Datos inválidos, archivo faltante/incorrecto, o ID de estudiante no coincide.' })
  @ApiResponse({ status: 401, description: 'No autenticado como estudiante.' }) // Asumiendo AuthGuard
  async uploadDocumentForStudent(
    @UploadedFile(
      // TODO: Reintroducir ParseFilePipe con validadores cuando se resuelva el error de TS.
      // new ParseFilePipe({ ... }) 
    )
    file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    // @Req() req: Request // Para obtener req.user.id o req.user.studentId si se usa un AuthGuard
  ): Promise<DocumentEntity> {
    // Placeholder para el ID del estudiante autenticado.
    // En una implementación real, esto vendría de un AuthGuard (ej. req.user.studentId).
    // Por ahora, para que funcione, el studentId del DTO se usará, pero se validará en el servicio.
    const authenticatedStudentId = createDocumentDto.studentId; // ESTO ES UN PLACEHOLDER PELIGROSO SIN AUTENTICACIÓN REAL
                                                              // El servicio valida que createDocumentDto.studentId === authenticatedStudentId

    if (!authenticatedStudentId) {
        throw new BadRequestException('No se pudo determinar el ID del estudiante autenticado. Implementar AuthGuard.');
    }
    
    // Aquí se podría añadir una validación para asegurar que el studentId del DTO
    // es el mismo que el del usuario autenticado, si el DTO aún lo requiere.
    // El servicio ya lo hace, pero una validación temprana aquí es buena.
    // if (createDocumentDto.studentId !== authenticatedStudentId) {
    //   throw new BadRequestException('El ID de estudiante en la solicitud no coincide con el usuario autenticado.');
    // }

    return this.documentsService.uploadForStudent(file, createDocumentDto, authenticatedStudentId);
  }
}
