import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Consent, ConsentDocument } from './schemas/consent.schema';
import { CreateConsentDto } from './dto/create-consent.dto';
import {
  DocumentEntity,
  DocumentDocument,
} from '../documents/schemas/document.schema';
import { Student, StudentDocument } from '../students/schemas/student.schema'; // Para verificar existencia

@Injectable()
export class ConsentService {
  constructor(
    @InjectModel(Consent.name) private consentModel: Model<ConsentDocument>,
    @InjectModel(DocumentEntity.name)
    private documentModel: Model<DocumentDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>, // Para verificar que el estudiante existe
  ) {}

  async giveOrUpdateConsent(
    authenticatedStudentId: string,
    createConsentDto: CreateConsentDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ConsentDocument> {
    const { documentId, isConsentGiven } = createConsentDto;

    if (
      !Types.ObjectId.isValid(authenticatedStudentId) ||
      !Types.ObjectId.isValid(documentId)
    ) {
      throw new BadRequestException('ID de estudiante o documento inválido.');
    }

    // 1. Verificar que el estudiante exista (aunque si está autenticado, debería existir)
    const student = await this.studentModel
      .findById(authenticatedStudentId)
      .exec();
    if (!student) {
      throw new NotFoundException(
        `Estudiante con ID "${authenticatedStudentId}" no encontrado.`,
      );
    }

    // 2. Verificar que el documento exista y pertenezca al estudiante
    const document = await this.documentModel.findById(documentId).exec();
    if (!document) {
      throw new NotFoundException(
        `Documento con ID "${documentId}" no encontrado.`,
      );
    }

    // Asegurarse que el documento pertenece al estudiante que da el consentimiento
    // La propiedad `studentId` en `DocumentEntity` es Types.ObjectId
    if (document.studentId.toString() !== authenticatedStudentId) {
      throw new ForbiddenException(
        'No tienes permiso para dar consentimiento sobre este documento.',
      );
    }

    // 3. Crear o actualizar el consentimiento (Upsert)
    const consent = await this.consentModel
      .findOneAndUpdate(
        {
          studentId: new Types.ObjectId(authenticatedStudentId),
          documentId: new Types.ObjectId(documentId),
        },
        {
          $set: {
            isConsentGiven,
            consentDate: new Date(),
            ipAddress: ipAddress, // Opcional
            userAgent: userAgent, // Opcional
          },
        },
        { new: true, upsert: true, runValidators: true },
      )
      .exec();

    return consent;
  }

  async getConsentForDocumentByStudent(
    authenticatedStudentId: string,
    documentId: string,
  ): Promise<ConsentDocument | null> {
    if (
      !Types.ObjectId.isValid(authenticatedStudentId) ||
      !Types.ObjectId.isValid(documentId)
    ) {
      throw new BadRequestException('ID de estudiante o documento inválido.');
    }

    // Opcional: verificar existencia de estudiante y documento como en giveOrUpdateConsent si se quiere ser extra seguro.
    // Por ahora, se asume que si se busca un consentimiento, las entidades relacionadas deberían existir.

    return this.consentModel
      .findOne({
        studentId: new Types.ObjectId(authenticatedStudentId),
        documentId: new Types.ObjectId(documentId),
      })
      .exec();
  }

  async getConsentsByStudent(
    authenticatedStudentId: string,
  ): Promise<ConsentDocument[]> {
    if (!Types.ObjectId.isValid(authenticatedStudentId)) {
      throw new BadRequestException('ID de estudiante inválido.');
    }
    return this.consentModel
      .find({ studentId: new Types.ObjectId(authenticatedStudentId) })
      .exec();
  }
}
