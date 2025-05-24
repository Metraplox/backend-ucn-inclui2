import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  DocumentEntity,
  DocumentDocument,
  DocumentStatus,
  DocumentCategory,
} from './schemas/document.schema';
import {
  CreateDocumentDto,
  UpdateDocumentMetadataDto,
  VerifyDocumentDto,
} from './dto';
import { Student } from '../students/schemas/student.schema';

// Configuración básica de almacenamiento (se puede mover a un archivo de config)
const UPLOAD_LOCATION =
  process.env.UPLOAD_LOCATION || path.join(__dirname, '..', '..', 'uploads');
const TEMPLATES_LOCATION =
  process.env.TEMPLATES_LOCATION ||
  path.join(__dirname, '..', '..', 'templates');

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentEntity.name)
    private documentModel: Model<DocumentDocument>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
  ) {
    // Asegurar que los directorios existan
    fs.mkdir(UPLOAD_LOCATION, { recursive: true }).catch(console.error);
    fs.mkdir(TEMPLATES_LOCATION, { recursive: true }).catch(console.error);
  }

  async uploadForStudentByStaff(
    file: Express.Multer.File,
    createDocumentDto: CreateDocumentDto,
    uploadedByStaffId: string,
  ): Promise<DocumentDocument> {
    if (!file) {
      throw new BadRequestException('Archivo no proporcionado.');
    }

    // Validar que el studentId existe
    const studentExists = await this.studentModel
      .findById(createDocumentDto.studentId)
      .exec();
    if (!studentExists) {
      // Eliminar el archivo temporal si el estudiante no existe
      try {
        await fs.unlink(file.path);
      } catch (error) {
        console.error(
          `Error al eliminar archivo temporal: ${file.path}`,
          error,
        );
      }
      throw new NotFoundException(
        `Estudiante con ID "${createDocumentDto.studentId}" no encontrado.`,
      );
    }

    // Generar URL para acceso al archivo
    const fileUrl = `${process.env.API_BASE_URL || 'http://localhost:3000'}/documents/${file.filename}/download`;

    const newDocument = new this.documentModel({
      ...createDocumentDto,
      studentId: new Types.ObjectId(createDocumentDto.studentId),
      fileNameOriginal: file.originalname,
      storageFileName: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedBy: new Types.ObjectId(uploadedByStaffId),
      uploadDate: new Date(),
      status: DocumentStatus.PENDIENTE,
      fileUrl: fileUrl,
    });

    try {
      return await newDocument.save();
    } catch (error) {
      // Si falla el guardado en DB, borrar el archivo físico
      try {
        await fs.unlink(file.path);
      } catch (unlinkError) {
        console.error(
          `Error al eliminar archivo después de fallo en DB: ${file.path}`,
          unlinkError,
        );
      }
      console.error('Error saving document to DB:', error);
      throw new InternalServerErrorException('Error al guardar el documento.');
    }
  }

  async getDocumentsByStudentId(
    studentId: string,
  ): Promise<DocumentDocument[]> {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('ID de estudiante inválido.');
    }
    return this.documentModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .exec();
  }

  async getDocumentById(documentId: string): Promise<DocumentDocument> {
    if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }
    const document = await this.documentModel.findById(documentId).exec();
    if (!document) {
      throw new NotFoundException(
        `Documento con ID "${documentId}" no encontrado.`,
      );
    }
    return document;
  }

  // Para descargar el archivo, el controlador se encargará de enviar el stream.
  // Este método solo recupera la información del archivo.
  async getDocumentFileDetails(documentId: string): Promise<DocumentDocument> {
    return this.getDocumentById(documentId); // Reutiliza la lógica de búsqueda y NotFound
  }

  async updateDocumentMetadata(
    documentId: string,
    updateDto: UpdateDocumentMetadataDto,
  ): Promise<DocumentDocument> {
    if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }
    const updatedDocument = await this.documentModel
      .findByIdAndUpdate(
        documentId,
        { $set: updateDto }, // Usar $set para asegurar que solo se actualicen los campos provistos
        { new: true },
      )
      .exec();

    if (!updatedDocument) {
      throw new NotFoundException(
        `Documento con ID "${documentId}" no encontrado para actualizar.`,
      );
    }
    return updatedDocument;
  }

  async deleteDocument(documentId: string): Promise<void> {
    if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }
    const documentToDelete = await this.getDocumentById(documentId); // Verifica existencia y obtiene datos

    try {
      // 1. Eliminar el archivo físico
      await fs.unlink(documentToDelete.filePath); // filePath debe ser la ruta absoluta o manejable por fs.unlink
    } catch (error) {
      // Si el archivo no existe o no se puede borrar, se podría loggear pero continuar a borrar de DB.
      // O decidir si es un error crítico. Por ahora, logueamos y continuamos.
      console.error(
        `Error al eliminar el archivo físico ${documentToDelete.filePath}:`,
        error,
      );
      // Podrías lanzar una excepción aquí si la eliminación del archivo es crítica:
      // throw new InternalServerErrorException(`Error al eliminar el archivo físico para el documento ${documentId}.`);
    }

    // 2. Eliminar la entrada de la base de datos
    const result = await this.documentModel
      .deleteOne({ _id: documentId })
      .exec();
    if (result.deletedCount === 0) {
      // Esto no debería ocurrir si getDocumentById tuvo éxito, pero es una doble verificación.
      throw new NotFoundException(
        `Documento con ID "${documentId}" no encontrado para eliminar (posiblemente eliminado entre operaciones).`,
      );
    }
  }

  async uploadForStudent(
    file: Express.Multer.File,
    createDocumentDto: CreateDocumentDto,
    authenticatedStudentId: string,
  ): Promise<DocumentDocument> {
    if (!file) {
      throw new BadRequestException('Archivo no proporcionado.');
    }

    // Validar que el studentId en el DTO coincida con el autenticado
    if (createDocumentDto.studentId !== authenticatedStudentId) {
      throw new BadRequestException(
        'El ID de estudiante en la solicitud no coincide con el usuario autenticado.',
      );
    }

    // Generar URL para acceso al archivo
    const fileUrl = `${process.env.API_BASE_URL || 'http://localhost:3000'}/documents/${file.filename}/download`;

    const newDocument = new this.documentModel({
      ...createDocumentDto,
      studentId: new Types.ObjectId(authenticatedStudentId),
      fileNameOriginal: file.originalname,
      storageFileName: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedBy: new Types.ObjectId(authenticatedStudentId),
      uploadDate: new Date(),
      status: DocumentStatus.PENDIENTE,
      fileUrl: fileUrl,
    });

    try {
      return await newDocument.save();
    } catch (error) {
      // Si falla el guardado en DB, borrar el archivo físico
      try {
        await fs.unlink(file.path);
      } catch (unlinkError) {
        console.error(
          `Error al eliminar archivo después de fallo en DB: ${file.path}`,
          unlinkError,
        );
      }
      console.error('Error saving document to DB by student:', error);
      throw new InternalServerErrorException('Error al guardar el documento.');
    }
  }

  async verifyDocument(
    documentId: string,
    verifyDto: VerifyDocumentDto,
    verifiedByUserId: string,
  ): Promise<DocumentDocument> {
    if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }

    const document = await this.documentModel.findById(documentId).exec();
    if (!document) {
      throw new NotFoundException(
        `Documento con ID "${documentId}" no encontrado.`,
      );
    }

    if (document.status === DocumentStatus.VERIFICADO) {
      throw new ConflictException(`El documento ya ha sido verificado.`);
    }

    const updateData = {
      status: DocumentStatus.VERIFICADO,
      verifiedBy: new Types.ObjectId(verifiedByUserId),
      verificationDate: new Date(),
      comments: verifyDto.comments,
    };

    const updatedDocument = await this.documentModel
      .findByIdAndUpdate(documentId, { $set: updateData }, { new: true })
      .exec();

    if (!updatedDocument) {
      throw new NotFoundException(
        `Error al actualizar el documento con ID "${documentId}".`,
      );
    }

    return updatedDocument;
  }

  async rejectDocument(
    documentId: string,
    verifyDto: VerifyDocumentDto,
    verifiedByUserId: string,
  ): Promise<DocumentDocument> {
    if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }

    const document = await this.documentModel.findById(documentId).exec();
    if (!document) {
      throw new NotFoundException(
        `Documento con ID "${documentId}" no encontrado.`,
      );
    }

    if (document.status === DocumentStatus.RECHAZADO) {
      throw new ConflictException(`El documento ya ha sido rechazado.`);
    }

    const updateData = {
      status: DocumentStatus.RECHAZADO,
      verifiedBy: new Types.ObjectId(verifiedByUserId),
      verificationDate: new Date(),
      comments: verifyDto.comments || 'Documento rechazado',
    };

    const updatedDocument = await this.documentModel
      .findByIdAndUpdate(documentId, { $set: updateData }, { new: true })
      .exec();

    if (!updatedDocument) {
      throw new NotFoundException(
        `Error al actualizar el documento con ID "${documentId}".`,
      );
    }

    return updatedDocument;
  }

  async getDocumentTemplate(
    templateType: string,
  ): Promise<{ url: string; fileName: string; fileType: string }> {
    // Mapeo de tipos de plantillas a archivos
    const templateMap = {
      consentimiento: {
        fileName: 'plantilla_consentimiento.docx',
        fileType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
      informe: {
        fileName: 'plantilla_informe.docx',
        fileType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
      diagnostico: {
        fileName: 'plantilla_diagnostico.pdf',
        fileType: 'application/pdf',
      },
    };

    const template = templateMap[templateType.toLowerCase()];
    if (!template) {
      throw new NotFoundException(
        `No se encontró plantilla para el tipo "${templateType}".`,
      );
    }

    const templatePath = path.join(TEMPLATES_LOCATION, template.fileName);

    try {
      // Verificar si el archivo existe
      await fs.access(templatePath);

      // Generar URL para acceso al archivo
      const url = `${process.env.API_BASE_URL || 'http://localhost:3000'}/documents/templates/download/${template.fileName}`;

      return {
        url,
        fileName: template.fileName,
        fileType: template.fileType,
      };
    } catch (error) {
      throw new NotFoundException(
        `Plantilla "${templateType}" no encontrada en el sistema.`,
      );
    }
  }
}
