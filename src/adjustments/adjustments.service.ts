import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { UpdateAdjustmentDto } from './dto/update-adjustment.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Adjustment,
  AdjustmentDocument,
  AdjustmentStatus,
} from './schemas/adjustment.schema';
import { Model, Types } from 'mongoose';
import {
  DocumentEntity,
  DocumentDocument,
} from '../documents/schemas/document.schema';
import { AdjustmentNotificationsService } from '../notifications/services/adjustment-notifications.service';

// ✅ Importar servicios especializados para composición
import { AdjustmentCrudService } from './services/adjustment-crud.service';
import { AdjustmentQueryService } from './services/adjustment-query.service';
import { AdjustmentWorkflowService } from './services/adjustment-workflow.service';
import { AdjustmentStatsService } from './services/adjustment-stats.service';

@Injectable()
export class AdjustmentsService {
  private readonly logger = new Logger(AdjustmentsService.name);

  constructor(
    @InjectModel(Adjustment.name)
    private adjustmentModel: Model<AdjustmentDocument>,
    private readonly adjustmentNotificationsService: AdjustmentNotificationsService,
    @InjectModel(DocumentEntity.name)
    private documentModel: Model<DocumentDocument>,
    
    // ✅ Inyección de servicios especializados (composición)
    private readonly adjustmentCrudService: AdjustmentCrudService,
    private readonly adjustmentQueryService: AdjustmentQueryService,
    private readonly adjustmentWorkflowService: AdjustmentWorkflowService,
    private readonly adjustmentStatsService: AdjustmentStatsService,
  ) {}

  // ✅ DELEGACIÓN A SERVICIOS ESPECIALIZADOS (DRY Principle)

  // === CRUD Operations (delegado a AdjustmentCrudService) ===
  async create(createAdjustmentDto: CreateAdjustmentDto): Promise<Adjustment> {
    return this.adjustmentCrudService.create(createAdjustmentDto);
  }

  async findAll(filter: any = {}): Promise<Adjustment[]> {
    return this.adjustmentCrudService.findAll(filter);
  }

  async findOne(id: string): Promise<Adjustment | null> {
    return this.adjustmentCrudService.findOne(id);
  }

  async update(
    id: string,
    updateAdjustmentDto: UpdateAdjustmentDto,
  ): Promise<Adjustment | null> {
    return this.adjustmentCrudService.update(id, updateAdjustmentDto);
  }

  async remove(id: string): Promise<{ deletedCount?: number }> {
    return this.adjustmentCrudService.remove(id);
  }

  // === Query Operations (delegado a AdjustmentQueryService) ===
  async findByStudentId(
    studentId: string,
    status?: AdjustmentStatus,
  ): Promise<Adjustment[]> {
    return this.adjustmentQueryService.findByStudentId(studentId, status);
  }

  async findByCourseId(courseId: string): Promise<Adjustment[]> {
    return this.adjustmentQueryService.findByCourseId(courseId);
  }

  async findByCourseNrc(courseNrc: string, semester?: string): Promise<Adjustment[]> {
    return this.adjustmentQueryService.findByCourseNrc(courseNrc, semester);
  }

  async findByDepartment(departmentId: string, semester: string): Promise<Adjustment[]> {
    return this.adjustmentQueryService.findByDepartment(departmentId, semester);
  }

  // === Workflow Operations (delegado a AdjustmentWorkflowService) ===
  async updateStatus(
    adjustmentId: string,
    adjustmentIndex: number,
    newStatus: AdjustmentStatus,
    updatedByUserId: string,
    comments?: string,
  ): Promise<Adjustment> {
    return this.adjustmentWorkflowService.updateStatus(
      adjustmentId,
      adjustmentIndex,
      newStatus,
      updatedByUserId,
      comments,
    );
  }

  async markAsRead(
    adjustmentId: string,
    currentAdjustmentIndex: number,
    userId: string,
    comments?: string,
  ): Promise<Adjustment> {
    return this.adjustmentWorkflowService.markAsRead(
      adjustmentId,
      currentAdjustmentIndex,
      userId,
      comments,
    );
  }

  async requestHelp(
    adjustmentId: string,
    currentAdjustmentIndex: number,
    userId: string,
    description: string,
  ): Promise<Adjustment> {
    return this.adjustmentWorkflowService.requestHelp(
      adjustmentId,
      currentAdjustmentIndex,
      userId,
      description,
    );
  }

  // === Statistics Operations (delegado a AdjustmentStatsService) ===
  async countAcknowledgedAdjustments(semester: string): Promise<number> {
    return this.adjustmentStatsService.countAcknowledgedAdjustments(semester);
  }

  async countPendingAdjustments(semester: string): Promise<number> {
    return this.adjustmentStatsService.countPendingAdjustments(semester);
  }

  async countAdjustmentsByDepartment(departmentName: string, semester: string): Promise<number> {
    return this.adjustmentStatsService.countAdjustmentsByDepartment(departmentName, semester);
  }

  async countAcknowledgedAdjustmentsByDepartment(
    departmentName: string,
    semester: string,
  ): Promise<number> {
    return this.adjustmentStatsService.countAcknowledgedAdjustmentsByDepartment(
      departmentName,
      semester,
    );
  }

  async countAdjustments(semester: string): Promise<number> {
    return this.adjustmentStatsService.countAdjustments(semester);
  }

  async getAdjustmentCountByType(semester: string): Promise<any[]> {
    return this.adjustmentStatsService.getAdjustmentCountByType(semester);
  }

  // ✅ MÉTODOS ESPECÍFICOS QUE PERMANECEN EN EL SERVICIO PRINCIPAL
  // (Funcionalidades que requieren múltiples servicios o lógica específica)

  /**
   * Actualización flexible usando filtro y update
   */
  async findOneAndUpdate(
    filter: any,
    update: any,
    options: any = { new: true },
  ): Promise<Adjustment | null> {
    try {
      const result = await this.adjustmentModel
        .findOneAndUpdate(filter, update, { ...options, lean: true })
        .exec();
      
      return result as unknown as Adjustment | null;
    } catch (error) {
      this.logger.error(`Error al actualizar ajuste: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Actualización por ID con validaciones
   */
  async findByIdAndUpdate(id: string, update: any): Promise<Adjustment | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de ajuste no válido');
    }

    try {
      const updatedDoc = await this.adjustmentModel
        .findByIdAndUpdate(id, update, { new: true, lean: true })
        .lean<Adjustment>()
        .exec();
      
      if (!updatedDoc) {
        return null;
      }
      
      const adjustment: Adjustment = {
        ...updatedDoc,
        _id: updatedDoc._id,
        studentId: updatedDoc.studentId,
        currentAdjustments: updatedDoc.currentAdjustments || [],
        history: updatedDoc.history || [],
      };
      
      return adjustment;
    } catch (error) {
      this.logger.error(`Error al actualizar ajuste ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('No se pudo actualizar el ajuste');
    }
  }

  /**
   * Asociar documento a ajuste (usando documentosAsociados del CurrentAdjustment)
   */
  async associateDocument(
    adjustmentId: string,
    documentId: string,
  ): Promise<Adjustment> {
    if (!Types.ObjectId.isValid(adjustmentId)) {
      throw new BadRequestException('ID de ajuste inválido');
    }

    if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido');
    }

    const document = await this.documentModel.findById(documentId).exec();
    if (!document) {
      throw new NotFoundException(`Documento con ID "${documentId}" no encontrado`);
    }

    const adjustment = await this.adjustmentModel.findById(adjustmentId).exec();
    if (!adjustment) {
      throw new NotFoundException(`Ajuste con ID "${adjustmentId}" no encontrado`);
    }

    // Asociar documento al primer ajuste actual (simplificación)
    if (adjustment.currentAdjustments.length > 0) {
      const currentAdjustment = adjustment.currentAdjustments[0];
      
      if (!currentAdjustment.documentosAsociados) {
        currentAdjustment.documentosAsociados = [];
      }

      const documentObjectId = new Types.ObjectId(documentId);
      const isAlreadyAssociated = currentAdjustment.documentosAsociados.some(doc =>
        doc.equals(documentObjectId)
      );

      if (isAlreadyAssociated) {
        throw new BadRequestException('El documento ya está asociado a este ajuste');
      }

      currentAdjustment.documentosAsociados.push(documentObjectId);
    } else {
      throw new BadRequestException('No hay ajustes actuales para asociar el documento');
    }

    const savedAdjustment = await adjustment.save();

    this.logger.log(`Documento ${documentId} asociado al ajuste ${adjustmentId}`);

    return savedAdjustment;
  }

  /**
   * Estado de lectura de ajustes (funcionalidad compleja que combina queries)
   */
  async getAdjustmentReadStatus(
    courseId?: string,
    courseNrc?: string,
    semester?: string,
  ): Promise<any[]> {
    const query: any = {};
    
    if (courseId) {
      query.courseId = courseId;
    }
    if (courseNrc) {
      query.courseNrc = courseNrc;
    }
    if (semester) {
      query.semester = semester;
    }

    const adjustments = await this.adjustmentModel
      .find(query)
      .populate('studentId');

    const statusReport: any[] = [];

    for (const adjustment of adjustments) {
      for (let i = 0; i < adjustment.currentAdjustments.length; i++) {
        const currentAdj = adjustment.currentAdjustments[i];

        statusReport.push({
          studentId: adjustment.studentId,
          studentRut: adjustment.studentRut,
          courseNrc: currentAdj.courseNrc,
          adjustmentType: currentAdj.type,
          adjustmentIndex: i,
          isRead: currentAdj.readBy && currentAdj.readBy.length > 0,
          readByCount: currentAdj.readBy ? currentAdj.readBy.length : 0,
          readBy: currentAdj.readBy || [],
        });
      }
    }

    return statusReport;
  }

  /**
   * Estado de lectura por NRC (wrapper convenience method)
   */
  async getAdjustmentReadStatusByNrc(
    courseNrc: string,
    semester?: string,
  ): Promise<any[]> {
    return this.getAdjustmentReadStatus(undefined, courseNrc, semester);
  }
} 