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
  NotFoundException,
  UseGuards, // <--- Añadido UseGuards
  Req, // <--- Añadido Req
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express'; // <--- Añadido Request
import * as fs from 'fs';
import * as path from 'path';
import { Types } from 'mongoose';

import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { UserPublicData } from '../users/interfaces/user-public-data.interface';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentMetadataDto } from './dto/update-document-metadata.dto';
import { DocumentEntity } from './schemas/document.schema';

// Configuración básica de almacenamiento (debería coincidir o ser gestionada centralmente con el servicio)
const UPLOAD_LOCATION = process.env.UPLOAD_LOCATION || path.join(__dirname, '..', '..', 'uploads'); // TODO: Mover a ConfigService

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @UseInterceptors(FileInterceptor('file', { dest: UPLOAD_LOCATION }))
  @ApiOperation({ summary: 'Subir un nuevo documento para un estudiante (Admin, Staff)' })
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
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async uploadDocument(
    @UploadedFile(
      // TODO: Reintroducir ParseFilePipe
    )
    file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req: Request & { user: UserPublicData },
  ): Promise<DocumentEntity> {
    if (!file) {
      throw new BadRequestException('Archivo no proporcionado.');
    }
    const uploadedByStaffId = req.user._id; // ID del usuario autenticado (Admin/Staff)
    return this.documentsService.uploadForStudentByStaff(file, createDocumentDto, uploadedByStaffId);
  }

  @Get('student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Obtener todos los documentos de un estudiante específico (Admin, Staff)' })
  @ApiParam({ name: 'studentId', description: 'ID del estudiante', type: String })
  @ApiResponse({ status: 200, description: 'Lista de documentos del estudiante.', type: [DocumentEntity] })
  @ApiResponse({ status: 400, description: 'ID de estudiante inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async getDocumentsByStudent(@Param('studentId') studentId: string): Promise<DocumentEntity[]> {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('ID de estudiante inválido.');
    }
    return this.documentsService.getDocumentsByStudentId(studentId);
  }

  @Get(':documentId/metadata')
  @Roles(UserRole.ADMIN, UserRole.STAFF) // Estudiantes podrían tener acceso si el documento les pertenece
  @ApiOperation({ summary: 'Obtener los metadatos de un documento específico (Admin, Staff)' })
  @ApiParam({ name: 'documentId', description: 'ID del documento', type: String })
  @ApiResponse({ status: 200, description: 'Metadatos del documento.', type: DocumentEntity })
  @ApiResponse({ status: 404, description: 'Documento no encontrado.' })
  @ApiResponse({ status: 400, description: 'ID de documento inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async getDocumentMetadata(@Param('documentId') documentId: string): Promise<DocumentEntity> {
     if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }
    // TODO: Considerar si un estudiante puede ver metadatos de sus propios documentos.
    return this.documentsService.getDocumentById(documentId);
  }

  @Get(':documentId/download')
  @Roles(UserRole.ADMIN, UserRole.STAFF) // Estudiantes podrían tener acceso si el documento les pertenece
  @ApiOperation({ summary: 'Descargar un archivo de documento específico (Admin, Staff)' })
  @ApiParam({ name: 'documentId', description: 'ID del documento a descargar', type: String })
  @ApiResponse({ status: 200, description: 'Archivo del documento.' })
  @ApiResponse({ status: 404, description: 'Documento o archivo no encontrado.' })
  @ApiResponse({ status: 400, description: 'ID de documento inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async downloadDocument(
    @Param('documentId') documentId: string,
    @Res({ passthrough: true }) res: Response,
    // @Req() req: Request & { user: UserPublicData }, // Para verificar permisos si un estudiante descarga
  ): Promise<StreamableFile> {
     if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }
    // TODO: Lógica de autorización para estudiantes si pueden descargar sus propios documentos.
    // const documentOwnerId = await this.documentsService.getDocumentOwner(documentId);
    // if (req.user.roles.includes(UserRole.STUDENT) && req.user.studentRelatedId !== documentOwnerId) {
    //   throw new ForbiddenException('No tienes permiso para descargar este documento.');
    // }

    const document = await this.documentsService.getDocumentFileDetails(documentId);
    const filePath = document.filePath;

    try {
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
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Actualizar los metadatos de un documento existente (Admin, Staff)' })
  @ApiParam({ name: 'documentId', description: 'ID del documento a actualizar', type: String })
  @ApiBody({ type: UpdateDocumentMetadataDto })
  @ApiResponse({ status: 200, description: 'Metadatos actualizados exitosamente.', type: DocumentEntity })
  @ApiResponse({ status: 404, description: 'Documento no encontrado.' })
  @ApiResponse({ status: 400, description: 'ID de documento inválido o datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
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
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un documento (metadatos y archivo físico) (Admin, Staff)' })
  @ApiParam({ name: 'documentId', description: 'ID del documento a eliminar', type: String })
  @ApiResponse({ status: 204, description: 'Documento eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado.' })
  @ApiResponse({ status: 400, description: 'ID de documento inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async deleteDocument(@Param('documentId') documentId: string): Promise<void> {
     if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }
    await this.documentsService.deleteDocument(documentId);
  }

  // Endpoint para que los estudiantes suban sus propios documentos
  @Post('student/upload')
  @Roles(UserRole.STUDENT)
  @UseInterceptors(FileInterceptor('file', { dest: UPLOAD_LOCATION }))
  @ApiOperation({ summary: 'Subir un nuevo documento (Solo Estudiantes Autenticados)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo a subir y metadatos del documento. El studentId en el DTO debe coincidir con el del estudiante autenticado.',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'El archivo a subir.' },
        // studentId no es necesario si se toma del token, pero si se envía, debe coincidir.
        studentId: { type: 'string', example: '60c72b2f9b1d8c001f8e4a3c', description: 'ID del estudiante (debe coincidir con el autenticado).' },
        category: { type: 'string', example: 'CERTIFICADO_ALUMNO_REGULAR' },
        description: { type: 'string', example: 'Mi certificado', required: false },
      },
      required: ['file', 'studentId', 'category'],
    },
  })
  @ApiResponse({ status: 201, description: 'Documento subido y metadatos guardados.', type: DocumentEntity })
  @ApiResponse({ status: 400, description: 'Datos inválidos, archivo faltante/incorrecto, o ID de estudiante no coincide.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido o ID de estudiante no coincide.' })
  async uploadDocumentForStudent(
    @UploadedFile(
      // TODO: Reintroducir ParseFilePipe
    )
    file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req: Request & { user: UserPublicData },
  ): Promise<DocumentEntity> {
    if (!file) {
      throw new BadRequestException('Archivo no proporcionado.');
    }
    const authenticatedStudentUserId = req.user._id; // Este es el User._id

    // IMPORTANTE: Se asume que el User.studentId (o un campo similar que lo relacione con la entidad Student)
    // está disponible o que el User._id es suficiente si el estudiante es directamente un User.
    // Si User y Student son entidades separadas y un User (rol STUDENT) tiene un studentProfileId o similar,
    // ese es el ID que se debe usar/validar aquí.
    // Por ahora, asumimos que createDocumentDto.studentId se refiere al ID de la entidad Student.
    // Y que el usuario autenticado (req.user) tiene una forma de relacionarse con ese Student ID.
    // Para este ejemplo, vamos a asumir que el `req.user._id` (que es el `User._id`)
    // es el mismo que el `studentId` que se espera para el documento si el rol es ESTUDIANTE.
    // ESTA LÓGICA PUEDE NECESITAR AJUSTE BASADO EN EL MODELO DE DATOS EXACTO.

    // Validación: El studentId en el DTO debe coincidir con el ID del usuario autenticado (si es un estudiante)
    // O, si el studentId en el DTO es para identificar a qué estudiante pertenece el documento
    // y el usuario autenticado es un estudiante, entonces el DTO.studentId DEBE ser el ID del estudiante autenticado.
    if (createDocumentDto.studentId !== authenticatedStudentUserId.toString()) {
        throw new BadRequestException(
            `El studentId '${createDocumentDto.studentId}' proporcionado en el cuerpo no coincide con el ID del estudiante autenticado '${authenticatedStudentUserId.toString()}'.`
        );
    }
    
    // El servicio `uploadForStudent` debería usar el ID del usuario autenticado.
    return this.documentsService.uploadForStudent(file, createDocumentDto, authenticatedStudentUserId.toString());
  }
}
