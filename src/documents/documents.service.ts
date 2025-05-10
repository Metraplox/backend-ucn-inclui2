import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as fs from 'fs/promises';
import * as path from 'path';
import { DocumentEntity, DocumentDocument } from './schemas/document.schema';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentMetadataDto } from './dto/update-document-metadata.dto';
// import { Student } from '../students/schemas/student.schema'; // Para validar existencia de Student

// Configuración básica de almacenamiento (se puede mover a un archivo de config)
const UPLOAD_LOCATION = process.env.UPLOAD_LOCATION || path.join(__dirname, '..', '..', 'uploads'); // Directorio de uploads en la raíz del proyecto

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentEntity.name) private documentModel: Model<DocumentDocument>,
    // @InjectModel(Student.name) private studentModel: Model<StudentDocument>, // Para validar Student si es necesario
  ) {
    // Asegurar que el directorio de uploads exista
    fs.mkdir(UPLOAD_LOCATION, { recursive: true }).catch(console.error);
  }

  async uploadForStudentByStaff(
    file: Express.Multer.File,
    createDocumentDto: CreateDocumentDto,
    uploadedByStaffId: string, // ID o identificador del personal que sube
  ): Promise<DocumentDocument> {
    if (!file) {
      throw new BadRequestException('Archivo no proporcionado.');
    }

    // Validar que el studentId existe podría ser una buena adición aquí
    // const studentExists = await this.studentModel.findById(createDocumentDto.studentId).exec();
    // if (!studentExists) {
    //   // Si el archivo ya se guardó temporalmente por Multer, habría que borrarlo.
    //   // Por ahora, asumimos que Multer guarda directamente en la ruta final o que se maneja antes.
    //   throw new NotFoundException(`Estudiante con ID "${createDocumentDto.studentId}" no encontrado.`);
    // }

    const newDocument = new this.documentModel({
      ...createDocumentDto,
      studentId: new Types.ObjectId(createDocumentDto.studentId),
      fileNameOriginal: file.originalname,
      storageFileName: file.filename, // Asumiendo que Multer ya generó un nombre único
      filePath: file.path, // Asumiendo que Multer proporciona la ruta completa
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedBy: uploadedByStaffId, // Aquí iría el ID del personal autenticado
      uploadDate: new Date(),
    });

    try {
      return await newDocument.save();
    } catch (error) {
      // Si falla el guardado en DB, idealmente se debería borrar el archivo físico si ya se guardó.
      // Esto depende de la estrategia de Multer (si guarda antes o después de este método).
      // Por simplicidad, no se maneja aquí la eliminación del archivo en caso de error de DB.
      console.error('Error saving document to DB:', error);
      throw new InternalServerErrorException('Error al guardar el documento.');
    }
  }

  async getDocumentsByStudentId(studentId: string): Promise<DocumentDocument[]> {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('ID de estudiante inválido.');
    }
    return this.documentModel.find({ studentId: new Types.ObjectId(studentId) }).exec();
  }

  async getDocumentById(documentId: string): Promise<DocumentDocument> {
    if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }
    const document = await this.documentModel.findById(documentId).exec();
    if (!document) {
      throw new NotFoundException(`Documento con ID "${documentId}" no encontrado.`);
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
    const updatedDocument = await this.documentModel.findByIdAndUpdate(
      documentId,
      { $set: updateDto }, // Usar $set para asegurar que solo se actualicen los campos provistos
      { new: true },
    ).exec();

    if (!updatedDocument) {
      throw new NotFoundException(`Documento con ID "${documentId}" no encontrado para actualizar.`);
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
      console.error(`Error al eliminar el archivo físico ${documentToDelete.filePath}:`, error);
      // Podrías lanzar una excepción aquí si la eliminación del archivo es crítica:
      // throw new InternalServerErrorException(`Error al eliminar el archivo físico para el documento ${documentId}.`);
    }

    // 2. Eliminar la entrada de la base de datos
    const result = await this.documentModel.deleteOne({ _id: documentId }).exec();
    if (result.deletedCount === 0) {
      // Esto no debería ocurrir si getDocumentById tuvo éxito, pero es una doble verificación.
      throw new NotFoundException(`Documento con ID "${documentId}" no encontrado para eliminar (posiblemente eliminado entre operaciones).`);
    }
  }

  async uploadForStudent(
    file: Express.Multer.File,
    createDocumentDto: CreateDocumentDto, // studentId en este DTO debe ser validado contra el studentId autenticado
    authenticatedStudentId: string, // ID del estudiante autenticado
  ): Promise<DocumentDocument> {
    if (!file) {
      throw new BadRequestException('Archivo no proporcionado.');
    }

    // Validar que el studentId en el DTO (si se permite) coincida con el autenticado
    // O mejor, ignorar el studentId del DTO y usar siempre el authenticatedStudentId.
    if (createDocumentDto.studentId !== authenticatedStudentId) {
        throw new BadRequestException('El ID de estudiante en la solicitud no coincide con el usuario autenticado.');
    }
    
    // Aquí también se podría validar la existencia del estudiante si fuera necesario,
    // pero si está autenticado, se asume que existe.

    const newDocument = new this.documentModel({
      ...createDocumentDto, // category, description
      studentId: new Types.ObjectId(authenticatedStudentId), // Usar el ID del estudiante autenticado
      fileNameOriginal: file.originalname,
      storageFileName: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedBy: authenticatedStudentId, // El estudiante se sube su propio documento
      uploadDate: new Date(),
    });

    try {
      return await newDocument.save();
    } catch (error) {
      console.error('Error saving document to DB by student:', error);
      throw new InternalServerErrorException('Error al guardar el documento.');
    }
  }
}
