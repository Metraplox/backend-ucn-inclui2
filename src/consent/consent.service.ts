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
import { Student, StudentDocument } from '../students/schemas/student.schema';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class ConsentService {
  constructor(
    @InjectModel(Consent.name) private consentModel: Model<ConsentDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  /**
   * Crear o actualizar el consentimiento general de un estudiante
   */
  async createOrUpdateConsent(
    authenticatedUserId: string,
    createConsentDto: CreateConsentDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ConsentDocument> {
    const { allowsDataSharing, comments } = createConsentDto;

    if (!Types.ObjectId.isValid(authenticatedUserId)) {
      throw new BadRequestException('ID de usuario inválido.');
    }

    // 1. Buscar el estudiante asociado al usuario autenticado
    const student = await this.studentModel
      .findOne({ userId: new Types.ObjectId(authenticatedUserId) })
      .populate('carreraId', 'name')
      .exec();

    if (!student) {
      throw new NotFoundException(
        'No se encontró un estudiante asociado a este usuario.',
      );
    }

    // 2. Preparar datos del consentimiento
    const consentData = {
      studentId: student._id,
      allowsDataSharing,
      consentDate: new Date(),
      studentRut: student.rut,
      studentName: `${student.nombres} ${student.apellidos}`,
      studentCareer: (student.carreraId as any)?.name || 'Carrera no especificada',
      comments,
      registeredBy: new Types.ObjectId(authenticatedUserId),
      ipAddress,
      userAgent,
      isActive: true,
    };

    // 3. Upsert: actualizar existente o crear nuevo
    const consent = await this.consentModel
      .findOneAndUpdate(
        { studentId: student._id },
        { $set: consentData },
        { new: true, upsert: true, runValidators: true },
      )
      .exec();

    return consent;
  }

  /**
   * Obtener el consentimiento activo de un estudiante por su ID de usuario
   */
  async getConsentByUserId(userId: string): Promise<ConsentDocument | null> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID de usuario inválido.');
    }

    const student = await this.studentModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!student) {
      return null;
    }

    return this.consentModel
      .findOne({ studentId: student._id, isActive: true })
      .exec();
  }

  /**
   * Obtener el consentimiento activo de un estudiante por su Student ID
   */
  async getConsentByStudentId(studentId: string): Promise<ConsentDocument | null> {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('ID de estudiante inválido.');
    }

    return this.consentModel
      .findOne({ studentId: new Types.ObjectId(studentId), isActive: true })
      .exec();
  }

  /**
   * Verificar si un usuario puede ver información sensible de un estudiante
   */
  async canViewSensitiveData(
    studentId: string,
    viewerRole: UserRole,
    viewerUserId?: string
  ): Promise<boolean> {
    // Coordinadora y Educadora Social: SIEMPRE pueden ver información sensible
    if (viewerRole === UserRole.COORDINADOR || viewerRole === UserRole.EDUCADORA_SOCIAL) {
      return true;
    }

    // El propio estudiante siempre puede ver su información
    if (viewerRole === UserRole.ESTUDIANTE && viewerUserId) {
      const student = await this.studentModel
        .findOne({ userId: new Types.ObjectId(viewerUserId) })
        .exec();
      if (student && student._id.toString() === studentId) {
        return true;
      }
    }

    // Para otros roles (docentes, jefes, etc.): verificar consentimiento
    const consent = await this.getConsentByStudentId(studentId);
    return consent?.allowsDataSharing || false;
  }

  /**
   * Verificar si un usuario puede ver documentos de un estudiante
   */
  async canViewDocuments(
    studentId: string,
    viewerRole: UserRole,
    viewerUserId?: string
  ): Promise<boolean> {
    // Solo Coordinadora y Educadora Social pueden ver documentos
    // Y solo si el estudiante tiene consentimiento activo
    if (viewerRole === UserRole.COORDINADOR || viewerRole === UserRole.EDUCADORA_SOCIAL) {
      const consent = await this.getConsentByStudentId(studentId);
      return consent?.allowsDataSharing || false;
    }

    // El propio estudiante siempre puede ver sus documentos
    if (viewerRole === UserRole.ESTUDIANTE && viewerUserId) {
      const student = await this.studentModel
        .findOne({ userId: new Types.ObjectId(viewerUserId) })
        .exec();
      return student && student._id.toString() === studentId;
    }

    return false;
  }

  /**
   * Verificar si un usuario puede ver ajustes académicos de un estudiante
   */
  async canViewAdjustments(
    studentId: string,
    viewerRole: UserRole,
    viewerUserId?: string
  ): Promise<boolean> {
    // Coordinadora y Educadora Social: SIEMPRE pueden ver ajustes
    if (viewerRole === UserRole.COORDINADOR || viewerRole === UserRole.EDUCADORA_SOCIAL) {
      return true;
    }

    // Docentes: SIEMPRE pueden ver ajustes (sin necesidad de consentimiento)
    // Pero solo pueden ver diagnóstico si hay consentimiento
    if (viewerRole === UserRole.DOCENTE) {
      return true;
    }

    // Jefes de carrera y departamento: pueden ver ajustes
    if (viewerRole === UserRole.JEFE_CARRERA || viewerRole === UserRole.JEFE_DEPARTAMENTO) {
      return true;
    }

    // El propio estudiante siempre puede ver sus ajustes
    if (viewerRole === UserRole.ESTUDIANTE && viewerUserId) {
      const student = await this.studentModel
        .findOne({ userId: new Types.ObjectId(viewerUserId) })
        .exec();
      return student && student._id.toString() === studentId;
    }

    return false;
  }

  /**
   * Revocar el consentimiento de un estudiante
   */
  async revokeConsent(
    authenticatedUserId: string,
    reason?: string,
  ): Promise<ConsentDocument> {
    const consent = await this.getConsentByUserId(authenticatedUserId);
    
    if (!consent) {
      throw new NotFoundException('No se encontró un consentimiento activo.');
    }

    consent.allowsDataSharing = false;
    consent.revokedAt = new Date();
    consent.revocationReason = reason;
    
    return consent.save();
  }

  /**
   * Obtener estadísticas de consentimientos (para reportes administrativos)
   */
  async getConsentStats(): Promise<{
    total: number;
    withConsent: number;
    withoutConsent: number;
    percentageWithConsent: number;
  }> {
    const total = await this.consentModel.countDocuments({ isActive: true });
    const withConsent = await this.consentModel.countDocuments({ 
      isActive: true, 
      allowsDataSharing: true 
    });
    const withoutConsent = total - withConsent;
    const percentageWithConsent = total > 0 ? (withConsent / total) * 100 : 0;

    return {
      total,
      withConsent,
      withoutConsent,
      percentageWithConsent: Math.round(percentageWithConsent * 100) / 100,
    };
  }

  /**
   * Listar todos los consentimientos (para administradores)
   */
  async findAll(): Promise<ConsentDocument[]> {
    return this.consentModel
      .find({ isActive: true })
      .sort({ consentDate: -1 })
      .exec();
  }
}
