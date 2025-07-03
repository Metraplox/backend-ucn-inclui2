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
  ConflictException,
  UseGuards,
  Req,
  ForbiddenException,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request, Response } from 'express'; // <--- Añadido Request
import * as fs from 'fs';
import * as path from 'path';
import { Types } from 'mongoose';
import { interval, from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { UserPublicData } from '../users/interfaces/user-public-data.interface';
import {
  CreateDocumentDto,
  UpdateDocumentMetadataDto,
  VerifyDocumentDto,
} from './dto';
import { DocumentEntity, DocumentStatus } from './schemas/document.schema';
import { DocumentResponseDto } from './dto/document-response.dto';

// Configuración básica de almacenamiento (debería coincidir o ser gestionada centralmente con el servicio)
const UPLOAD_LOCATION =
  process.env.UPLOAD_LOCATION || path.join(__dirname, '..', '..', 'uploads');
const TEMPLATES_LOCATION =
  process.env.TEMPLATES_LOCATION ||
  path.join(__dirname, '..', '..', 'templates');

@ApiTags('documents')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @UseInterceptors(FileInterceptor('file', { dest: UPLOAD_LOCATION }))
  @ApiOperation({
    summary: 'Subir documento para estudiante (Staff)',
    description: 'Permite al staff subir documentos de respaldo para estudiantes específicos. Los archivos se almacenan con validaciones de seguridad y se crean metadatos en la base de datos.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo a subir con metadatos del documento',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir (documentos de respaldo, informes médicos, certificados)',
        },
        studentId: { 
          type: 'string', 
          example: '507f1f77bcf86cd799439011',
          description: 'ObjectId del estudiante propietario del documento'
        },
        category: { 
          type: 'string', 
          example: 'INFORME_MEDICO',
          description: 'Categoría del documento según enum DocumentCategory'
        },
        description: { 
          type: 'string', 
          example: 'Informe médico del especialista en neurología - actualización trimestral',
          description: 'Descripción opcional detallada del documento'
        },
      },
      required: ['file', 'studentId', 'category'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Documento subido exitosamente con metadatos guardados',
    type: DocumentResponseDto,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439012',
        studentId: {
          _id: '507f1f77bcf86cd799439011',
          rut: '12345678-9',
          nombres: 'Juan Carlos',
          apellidos: 'Pérez González'
        },
        fileNameOriginal: 'informe_medico_juan.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 2048576,
        category: 'INFORME_MEDICO',
        description: 'Informe médico del especialista en neurología',
        uploadedBy: {
          _id: '507f1f77bcf86cd799439013',
          email: 'coordinadora@ucn.cl',
          nombres: 'María',
          apellidos: 'González'
        },
        status: 'PENDIENTE',
        uploadDate: '2025-06-19T10:30:00.000Z',
        createdAt: '2025-06-19T10:30:00.000Z',
        updatedAt: '2025-06-19T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o archivo faltante',
    schema: {
      example: {
        statusCode: 400,
        message: 'Archivo no proporcionado.',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({ 
    status: 403, 
    description: 'Rol no autorizado - Solo coordinadores y educadoras sociales',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden'
      }
    }
  })
  async uploadDocument(
    @UploadedFile() // TODO: Reintroducir ParseFilePipe
    file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req: Request & { user: UserPublicData },
  ): Promise<DocumentEntity> {
    if (!file) {
      throw new BadRequestException('Archivo no proporcionado.');
    }
    const uploadedByStaffId = req.user._id; // ID del usuario autenticado (Admin/Staff)
    return this.documentsService.uploadForStudentByStaff(
      file,
      createDocumentDto,
      uploadedByStaffId,
    );
  }

  @Get('student/:studentId')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Obtener documentos de estudiante',
    description: 'Obtiene todos los documentos de un estudiante específico. Requiere que el estudiante haya dado consentimiento para compartir documentos. Solo staff autorizado puede acceder.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'ObjectId del estudiante',
    type: String,
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de documentos del estudiante',
    type: [DocumentResponseDto],
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439012',
          studentId: {
            _id: '507f1f77bcf86cd799439011',
            rut: '12345678-9',
            nombres: 'Juan Carlos',
            apellidos: 'Pérez González'
          },
          fileNameOriginal: 'informe_medico.pdf',
          category: 'INFORME_MEDICO',
          status: 'VERIFICADO',
          uploadDate: '2025-06-19T10:30:00.000Z'
        },
        {
          _id: '507f1f77bcf86cd799439014',
          studentId: {
            _id: '507f1f77bcf86cd799439011',
            rut: '12345678-9',
            nombres: 'Juan Carlos',
            apellidos: 'Pérez González'
          },
          fileNameOriginal: 'certificado_regular.pdf',
          category: 'CERTIFICADO_ALUMNO_REGULAR',
          status: 'PENDIENTE',
          uploadDate: '2025-06-18T14:20:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ObjectId de estudiante inválido',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID de estudiante inválido.',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({ 
    status: 403, 
    description: 'El estudiante no ha autorizado compartir documentos o rol no permitido',
    schema: {
      example: {
        statusCode: 403,
        message: 'El estudiante no ha autorizado compartir sus documentos.',
        error: 'Forbidden'
      }
    }
  })
  async getDocumentsByStudent(
    @Param('studentId') studentId: string,
    @Req() req: Request & { user: UserPublicData },
  ): Promise<DocumentEntity[]> {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('ID de estudiante inválido.');
    }

    // Verificar autorización basada en consentimientos
    const userRole = req.user.roles.includes(UserRole.COORDINADOR) 
      ? UserRole.COORDINADOR 
      : UserRole.EDUCADORA_SOCIAL;
    
    const canViewDocuments = await this.documentsService['consentService'].canViewDocuments(
      studentId,
      userRole,
      req.user._id.toString()
    );

    if (!canViewDocuments) {
      throw new ForbiddenException('El estudiante no ha autorizado compartir sus documentos.');
    }

    return this.documentsService.getDocumentsByStudentId(studentId);
  }

  @Get(':documentId/metadata')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.DIDDEC_STAFF, UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Obtener metadatos de documento',
    description: 'Obtiene los metadatos de un documento específico sin descargar el archivo. Los estudiantes solo pueden acceder a sus propios documentos, el staff puede acceder según permisos.',
  })
  @ApiParam({
    name: 'documentId',
    description: 'ObjectId del documento',
    type: String,
    example: '507f1f77bcf86cd799439012'
  })
  @ApiResponse({
    status: 200,
    description: 'Metadatos del documento',
    type: DocumentResponseDto,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439012',
        studentId: {
          _id: '507f1f77bcf86cd799439011',
          rut: '12345678-9',
          nombres: 'Juan Carlos',
          apellidos: 'Pérez González'
        },
        fileNameOriginal: 'informe_medico_neurologia.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 2048576,
        category: 'INFORME_MEDICO',
        description: 'Evaluación neurológica para ajustes académicos',
        uploadedBy: {
          _id: '507f1f77bcf86cd799439013',
          email: 'coordinadora@ucn.cl',
          nombres: 'María',
          apellidos: 'González'
        },
        status: 'VERIFICADO',
        verifiedBy: {
          _id: '507f1f77bcf86cd799439013',
          email: 'coordinadora@ucn.cl',
          nombres: 'María',
          apellidos: 'González'
        },
        verificationDate: '2025-06-19T11:00:00.000Z',
        comments: 'Documento válido para ajustes de tiempo y evaluaciones',
        uploadDate: '2025-06-19T10:30:00.000Z',
        createdAt: '2025-06-19T10:30:00.000Z',
        updatedAt: '2025-06-19T11:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ObjectId de documento inválido',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID de documento inválido.',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Documento no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Documento no encontrado',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({ 
    status: 403, 
    description: 'Sin permisos para acceder a este documento',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden'
      }
    }
  })
  async getDocumentMetadata(
    @Param('documentId') documentId: string,
    @Req() req: Request & { user: UserPublicData },
  ): Promise<DocumentEntity> {
    if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }
    await this.documentsService.authorizeAccess(documentId, req.user);
    return this.documentsService.getDocumentById(documentId);
  }

  @Get(':documentId/download')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.DIDDEC_STAFF, UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Descargar archivo de documento',
    description: 'Descarga el archivo físico del documento. Se valida autorización y la existencia del archivo en el sistema de archivos antes de servir el contenido.',
  })
  @ApiParam({
    name: 'documentId',
    description: 'ObjectId del documento a descargar',
    type: String,
    example: '507f1f77bcf86cd799439012'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo del documento para descarga',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      },
      'application/msword': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      },
      'image/*': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    },
    headers: {
      'Content-Disposition': {
        description: 'Nombre del archivo original',
        schema: {
          type: 'string',
          example: 'attachment; filename="informe_medico.pdf"'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ObjectId de documento inválido',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID de documento inválido.',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Documento no encontrado en base de datos o archivo físico no existe',
    schema: {
      example: {
        statusCode: 404,
        message: 'Archivo físico no encontrado para el documento ID "507f1f77bcf86cd799439012"',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({ 
    status: 403, 
    description: 'Sin permisos para descargar este documento',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden'
      }
    }
  })
  async downloadDocument(
    @Param('documentId') documentId: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request & { user: UserPublicData },
  ): Promise<StreamableFile> {
    if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }
    
    await this.documentsService.authorizeAccess(documentId, req.user);

    const document =
      await this.documentsService.getDocumentFileDetails(documentId);
    const filePath = document.filePath;

    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
    } catch (error) {
      throw new NotFoundException(
        `Archivo físico no encontrado para el documento ID "${documentId}" en la ruta ${filePath}`,
      );
    }

    const fileStream = fs.createReadStream(filePath);
    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${document.fileNameOriginal}"`,
    });
    return new StreamableFile(fileStream);
  }

  @Patch(':documentId/metadata')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Actualizar metadatos de documento',
    description: 'Actualiza la categoría, descripción y otros metadatos de un documento existente. No modifica el archivo físico, solo los datos en la base de datos.',
  })
  @ApiParam({
    name: 'documentId',
    description: 'ObjectId del documento a actualizar',
    type: String,
    example: '507f1f77bcf86cd799439012'
  })
  @ApiBody({ 
    type: UpdateDocumentMetadataDto,
    examples: {
      'actualizar-categoria': {
        summary: 'Cambiar categoría',
        value: {
          category: 'CERTIFICADO_MEDICO',
          description: 'Reclasificado como certificado médico oficial'
        }
      },
      'actualizar-descripcion': {
        summary: 'Actualizar descripción',
        value: {
          description: 'Informe médico actualizado con recomendaciones específicas para exámenes'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Metadatos actualizados exitosamente',
    type: DocumentResponseDto,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439012',
        category: 'CERTIFICADO_MEDICO',
        description: 'Reclasificado como certificado médico oficial',
        updatedAt: '2025-06-19T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ObjectId inválido o datos de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID de documento inválido.',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Documento no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Documento no encontrado',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({ 
    status: 403, 
    description: 'Rol no autorizado - Solo coordinadores y educadoras sociales',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden'
      }
    }
  })
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
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar documento completo',
    description: 'Elimina permanentemente un documento de la base de datos y su archivo físico del sistema de archivos. Esta acción es irreversible y debe usarse con precaución.',
  })
  @ApiParam({
    name: 'documentId',
    description: 'ObjectId del documento a eliminar',
    type: String,
    example: '507f1f77bcf86cd799439012'
  })
  @ApiResponse({
    status: 204,
    description: 'Documento eliminado exitosamente (sin contenido en respuesta)',
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ObjectId de documento inválido',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID de documento inválido.',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Documento no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Documento no encontrado',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({ 
    status: 403, 
    description: 'Rol no autorizado - Solo coordinadores y educadoras sociales',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden'
      }
    }
  })
  async deleteDocument(@Param('documentId') documentId: string): Promise<void> {
    if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }
    await this.documentsService.deleteDocument(documentId);
  }

  @Patch('verify/:documentId')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Verificar documento',
    description: 'Marca un documento como verificado/aprobado por el staff. Cambia el estado a VERIFICADO y registra al usuario que realizó la verificación con comentarios opcionales.',
  })
  @ApiParam({ 
    name: 'documentId', 
    description: 'ObjectId del documento a verificar',
    example: '507f1f77bcf86cd799439012'
  })
  @ApiBody({ 
    type: VerifyDocumentDto,
    examples: {
      'verificacion-simple': {
        summary: 'Verificación básica',
        value: {
          comments: 'Documento válido y completo'
        }
      },
      'verificacion-detallada': {
        summary: 'Verificación con detalles',
        value: {
          comments: 'Informe médico válido. Aprobado para ajustes de tiempo adicional en evaluaciones según recomendaciones del especialista.'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Documento verificado exitosamente',
    type: DocumentResponseDto,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439012',
        status: 'VERIFICADO',
        verifiedBy: {
          _id: '507f1f77bcf86cd799439013',
          email: 'coordinadora@ucn.cl',
          nombres: 'María',
          apellidos: 'González'
        },
        verificationDate: '2025-06-19T12:30:00.000Z',
        comments: 'Documento válido y completo',
        updatedAt: '2025-06-19T12:30:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ObjectId de documento inválido',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID de documento inválido.',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Documento no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Documento no encontrado',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'El documento ya ha sido verificado',
    schema: {
      example: {
        statusCode: 409,
        message: 'El documento ya ha sido verificado',
        error: 'Conflict'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({ 
    status: 403, 
    description: 'Rol no autorizado - Solo coordinadores y educadoras sociales',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden'
      }
    }
  })
  async verifyDocument(
    @Param('documentId') documentId: string,
    @Body() verifyDto: VerifyDocumentDto,
    @Req() req: Request & { user: UserPublicData },
  ): Promise<DocumentEntity> {
    return this.documentsService.verifyDocument(
      documentId,
      verifyDto,
      req.user._id,
    );
  }

  @Patch('reject/:documentId')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Rechazar documento',
    description: 'Marca un documento como rechazado por el staff. Cambia el estado a RECHAZADO y registra al usuario que realizó el rechazo con razones obligatorias.',
  })
  @ApiParam({ 
    name: 'documentId', 
    description: 'ObjectId del documento a rechazar',
    example: '507f1f77bcf86cd799439012'
  })
  @ApiBody({ 
    type: VerifyDocumentDto,
    examples: {
      'rechazo-calidad': {
        summary: 'Rechazo por calidad',
        value: {
          comments: 'La imagen del documento no es legible. Por favor, suba una versión de mejor calidad.'
        }
      },
      'rechazo-contenido': {
        summary: 'Rechazo por contenido',
        value: {
          comments: 'El documento no corresponde a la categoría seleccionada. Se requiere un informe médico oficial, no un resumen clínico.'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Documento rechazado exitosamente',
    type: DocumentResponseDto,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439012',
        status: 'RECHAZADO',
        verifiedBy: {
          _id: '507f1f77bcf86cd799439013',
          email: 'coordinadora@ucn.cl',
          nombres: 'María',
          apellidos: 'González'
        },
        verificationDate: '2025-06-19T12:45:00.000Z',
        comments: 'La imagen del documento no es legible. Por favor, suba una versión de mejor calidad.',
        updatedAt: '2025-06-19T12:45:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ObjectId de documento inválido',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID de documento inválido.',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Documento no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Documento no encontrado',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'El documento ya ha sido rechazado',
    schema: {
      example: {
        statusCode: 409,
        message: 'El documento ya ha sido rechazado',
        error: 'Conflict'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({ 
    status: 403, 
    description: 'Rol no autorizado - Solo coordinadores y educadoras sociales',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden'
      }
    }
  })
  async rejectDocument(
    @Param('documentId') documentId: string,
    @Body() verifyDto: VerifyDocumentDto,
    @Req() req: Request & { user: UserPublicData },
  ): Promise<DocumentEntity> {
    return this.documentsService.rejectDocument(
      documentId,
      verifyDto,
      req.user._id,
    );
  }

  @Get('templates/:templateType')
  @ApiOperation({
    summary: 'Obtener URL de plantilla',
    description: 'Obtiene la URL de descarga y metadatos para plantillas de documentos (consentimientos, formularios, etc.). No requiere autenticación.',
  })
  @ApiParam({
    name: 'templateType',
    description: 'Tipo de plantilla solicitada',
    example: 'consentimiento',
    enum: ['consentimiento', 'informe', 'certificado']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Información de la plantilla',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'http://localhost:3000/documents/templates/download/consentimiento.pdf'
        },
        fileName: {
          type: 'string',
          example: 'consentimiento.pdf'
        },
        fileType: {
          type: 'string',
          example: 'application/pdf'
        }
      },
      example: {
        url: 'http://localhost:3000/documents/templates/download/consentimiento.pdf',
        fileName: 'Formato consentimiento 2025.pdf',
        fileType: 'application/pdf'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Plantilla no encontrada',
    schema: {
      example: {
        statusCode: 404,
        message: 'Plantilla "documento-inexistente" no encontrada',
        error: 'Not Found'
      }
    }
  })
  async getTemplateUrl(
    @Param('templateType') templateType: string,
  ): Promise<{ url: string; fileName: string; fileType: string }> {
    return this.documentsService.getDocumentTemplate(templateType);
  }

  @Get('templates/download/:fileName')
  @ApiOperation({ 
    summary: 'Descargar plantilla específica',
    description: 'Descarga directamente un archivo de plantilla por su nombre. Endpoint público para facilitar el acceso a formularios y plantillas estándar.',
  })
  @ApiParam({
    name: 'fileName',
    description: 'Nombre exacto del archivo de plantilla',
    example: 'consentimiento.pdf'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo de plantilla para descarga',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      },
      'application/msword': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    },
    headers: {
      'Content-Disposition': {
        description: 'Nombre del archivo de plantilla',
        schema: {
          type: 'string',
          example: 'attachment; filename="consentimiento.pdf"'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Archivo de plantilla no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Plantilla "archivo-inexistente.pdf" no encontrada.',
        error: 'Not Found'
      }
    }
  })
  async downloadTemplate(
    @Param('fileName') fileName: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const filePath = path.join(TEMPLATES_LOCATION, fileName);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`La plantilla con nombre "${fileName}" no fue encontrada.`);
    }

    const fileStream = fs.createReadStream(filePath);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    return new StreamableFile(fileStream);
  }

  @Get('templates/consent-form')
  @ApiOperation({
    summary: 'Descargar el formulario de consentimiento estándar',
    description: 'Proporciona el archivo PDF del formulario de consentimiento oficial para ser firmado por el estudiante.',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo PDF del consentimiento.',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Archivo de plantilla no encontrado en el servidor.' })
  async downloadConsentForm(
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const consentFileName = 'Formato consentimiento 2025.pdf';
    // Apuntar a la ruta correcta donde verificamos que está el archivo
    const consentFilePath = path.join(__dirname, '..', '..', 'docs', 'assets', 'documents', consentFileName);

    if (!fs.existsSync(consentFilePath)) {
      console.error(`Error Crítico: El archivo de consentimiento no se encuentra en la ruta esperada: ${consentFilePath}`);
      throw new NotFoundException('El archivo del formulario de consentimiento no fue encontrado en el servidor.');
    }

    const fileStream = fs.createReadStream(consentFilePath);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${consentFileName}"`,
    });
    return new StreamableFile(fileStream);
  }

  // Endpoint para que los estudiantes suban sus propios documentos
  @Post('student/upload')
  @Roles(UserRole.ESTUDIANTE)
  @UseInterceptors(FileInterceptor('file', { dest: UPLOAD_LOCATION }))
  @ApiOperation({
    summary: 'Subir documento propio (Estudiantes)',
    description: 'Permite a los estudiantes autenticados subir sus propios documentos de respaldo. El studentId debe coincidir con el usuario autenticado para seguridad.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo del estudiante con metadatos. El studentId debe coincidir con el usuario autenticado.',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo personal del estudiante (certificados, informes, documentos médicos)',
        },
        studentId: {
          type: 'string',
          example: '507f1f77bcf86cd799439011',
          description: 'ObjectId del estudiante (debe coincidir con el usuario autenticado)',
        },
        category: { 
          type: 'string', 
          example: 'CERTIFICADO_ALUMNO_REGULAR',
          description: 'Categoría del documento según enum DocumentCategory'
        },
        description: { 
          type: 'string', 
          example: 'Mi certificado de alumno regular semestre actual',
          description: 'Descripción opcional del documento'
        },
      },
      required: ['file', 'studentId', 'category'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Documento subido exitosamente por el estudiante',
    type: DocumentResponseDto,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439015',
        studentId: {
          _id: '507f1f77bcf86cd799439011',
          rut: '12345678-9',
          nombres: 'Juan Carlos',
          apellidos: 'Pérez González'
        },
        fileNameOriginal: 'certificado_alumno_regular.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024576,
        category: 'CERTIFICADO_ALUMNO_REGULAR',
        description: 'Mi certificado de alumno regular semestre actual',
        uploadedBy: {
          _id: '507f1f77bcf86cd799439011',
          email: 'juan.perez@alumnos.ucn.cl',
          nombres: 'Juan Carlos',
          apellidos: 'Pérez González'
        },
        status: 'PENDIENTE',
        uploadDate: '2025-06-19T13:00:00.000Z',
        createdAt: '2025-06-19T13:00:00.000Z',
        updatedAt: '2025-06-19T13:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo faltante, datos inválidos o studentId no coincide',
    schema: {
      examples: {
        'sin-archivo': {
          summary: 'Archivo no proporcionado',
          value: {
            statusCode: 400,
            message: 'Archivo no proporcionado.',
            error: 'Bad Request'
          }
        },
        'id-no-coincide': {
          summary: 'StudentId no coincide',
          value: {
            statusCode: 400,
            message: "El studentId '507f1f77bcf86cd799439999' proporcionado en el cuerpo no coincide con el ID del estudiante autenticado '507f1f77bcf86cd799439011'.",
            error: 'Bad Request'
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({
    status: 403,
    description: 'Rol no autorizado - Solo estudiantes pueden usar este endpoint',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden'
      }
    }
  })
  async uploadDocumentForStudent(
    @UploadedFile()
    file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req: Request & { user: UserPublicData },
  ): Promise<DocumentEntity> {
    if (!file) {
      throw new BadRequestException('Archivo no proporcionado.');
    }
    const authenticatedStudentUserId = req.user._id;

    // Validación: El studentId en el DTO debe coincidir con el ID del usuario autenticado
    if (createDocumentDto.studentId !== authenticatedStudentUserId.toString()) {
      throw new BadRequestException(
        `El studentId '${createDocumentDto.studentId}' proporcionado en el cuerpo no coincide con el ID del estudiante autenticado '${authenticatedStudentUserId.toString()}'.`,
      );
    }

    return this.documentsService.uploadForStudent(
      file,
      createDocumentDto,
      authenticatedStudentUserId.toString(),
    );
  }

  // SSE endpoint para emitir documentos pendientes en tiempo real
  @Sse('pending-stream')
  @Roles(UserRole.DIDDEC_STAFF)
  pendingDocumentsStream(): Observable<MessageEvent> {
    return interval(5000).pipe(
      switchMap(() => from(this.documentsService.getPendingDocuments())),
      map(docs => ({ data: docs })),
    );
  }
}
