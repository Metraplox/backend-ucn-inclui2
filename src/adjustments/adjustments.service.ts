import {
  Injectable,
  NotFoundException,
  BadRequestException,
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

@Injectable()
export class AdjustmentsService {
  constructor(
    @InjectModel(Adjustment.name)
    private adjustmentModel: Model<AdjustmentDocument>,
    @InjectModel(DocumentEntity.name)
    private documentModel: Model<DocumentDocument>,
  ) {}

  async create(createAdjustmentDto: CreateAdjustmentDto): Promise<Adjustment> {
    const createdAdjustment = new this.adjustmentModel(createAdjustmentDto);
    return createdAdjustment.save();
  }

  async findAll(filter: any = {}): Promise<Adjustment[]> {
    return this.adjustmentModel.find(filter).exec();
  }

  async findOne(id: string): Promise<Adjustment | null> {
    return this.adjustmentModel.findById(id).exec();
  }

  async update(
    id: string,
    updateAdjustmentDto: UpdateAdjustmentDto,
  ): Promise<Adjustment | null> {
    return this.adjustmentModel
      .findByIdAndUpdate(id, updateAdjustmentDto, { new: true })
      .exec();
  }

  async findByIdAndUpdate(id: string, update: any): Promise<Adjustment | null> {
    return this.adjustmentModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
  }

  async remove(id: string): Promise<{ deletedCount?: number }> {
    const result = await this.adjustmentModel.deleteOne({ _id: id }).exec();
    return result;
  }

  async findByStudentId(
    studentId: string,
    status?: AdjustmentStatus,
  ): Promise<Adjustment[]> {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('ID de estudiante inválido');
    }

    const query: any = { studentId: new Types.ObjectId(studentId) };

    if (status) {
      query.status = status;
    }

    return this.adjustmentModel.find(query).exec();
  }

  async findByCourseId(courseId: string): Promise<Adjustment[]> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('ID de curso inválido');
    }

    return this.adjustmentModel
      .find({
        'currentAdjustments.courseId': new Types.ObjectId(courseId),
      })
      .exec();
  }

  async findByCourseNrc(
    courseNrc: string,
    semester?: string,
  ): Promise<Adjustment[]> {
    const query: any = { 'currentAdjustments.courseNrc': courseNrc };

    if (semester) {
      query.semester = semester;
    }

    return this.adjustmentModel.find(query).exec();
  }

  async associateDocument(
    adjustmentId: string,
    documentId: string,
  ): Promise<Adjustment> {
    if (
      !Types.ObjectId.isValid(adjustmentId) ||
      !Types.ObjectId.isValid(documentId)
    ) {
      throw new BadRequestException('ID de ajuste o documento inválido');
    }

    // Verificar que el documento existe
    const document = await this.documentModel.findById(documentId).exec();
    if (!document) {
      throw new NotFoundException(
        `Documento con ID "${documentId}" no encontrado`,
      );
    }

    // Verificar que el ajuste existe
    const adjustment = await this.adjustmentModel.findById(adjustmentId).exec();
    if (!adjustment) {
      throw new NotFoundException(
        `Ajuste con ID "${adjustmentId}" no encontrado`,
      );
    }

    // Asociar el documento al ajuste
    const updatedAdjustment = await this.adjustmentModel
      .findByIdAndUpdate(
        adjustmentId,
        { $addToSet: { documentosAsociados: new Types.ObjectId(documentId) } },
        { new: true },
      )
      .exec();

    if (!updatedAdjustment) {
      throw new NotFoundException(
        `Error al actualizar el ajuste con ID "${adjustmentId}"`,
      );
    }

    return updatedAdjustment;
  }

  async updateStatus(
    adjustmentId: string,
    status: AdjustmentStatus,
    updatedByUserId: string,
  ): Promise<Adjustment> {
    if (!Types.ObjectId.isValid(adjustmentId)) {
      throw new BadRequestException('ID de ajuste inválido');
    }

    // Verificar que el ajuste existe
    const adjustment = await this.adjustmentModel.findById(adjustmentId).exec();
    if (!adjustment) {
      throw new NotFoundException(
        `Ajuste con ID "${adjustmentId}" no encontrado`,
      );
    }

    // Actualizar el estado del ajuste
    const updateData = {
      estado: status,
      ultimaActualizacion: new Date(),
      actualizadoPor: new Types.ObjectId(updatedByUserId),
    };

    const updatedAdjustment = await this.adjustmentModel
      .findByIdAndUpdate(adjustmentId, { $set: updateData }, { new: true })
      .exec();

    if (!updatedAdjustment) {
      throw new NotFoundException(
        `Error al actualizar el ajuste con ID "${adjustmentId}"`,
      );
    }

    return updatedAdjustment;
  }

  async markAsRead(
    adjustmentId: string,
    currentAdjustmentIndex: number,
    userId: string,
    comments?: string,
  ): Promise<Adjustment> {
    if (
      !Types.ObjectId.isValid(adjustmentId) ||
      !Types.ObjectId.isValid(userId)
    ) {
      throw new BadRequestException('ID de ajuste o usuario inválido');
    }

    // Verificar que el ajuste existe
    const adjustment = await this.adjustmentModel.findById(adjustmentId).exec();
    if (!adjustment) {
      throw new NotFoundException(
        `Ajuste con ID "${adjustmentId}" no encontrado`,
      );
    }

    // Verificar que el índice del ajuste actual es válido
    if (
      currentAdjustmentIndex < 0 ||
      currentAdjustmentIndex >= adjustment.currentAdjustments.length
    ) {
      throw new BadRequestException(
        `Índice de ajuste ${currentAdjustmentIndex} fuera de rango`,
      );
    }

    // Crear el objeto de lectura
    const readRecord = {
      userId: new Types.ObjectId(userId),
      readDate: new Date(),
      comments,
    };

    // Actualizar el ajuste para marcar como leído
    const updatePath = `currentAdjustments.${currentAdjustmentIndex}.readBy`;

    // Verificar si el usuario ya ha marcado como leído este ajuste
    const existingReadIndex = adjustment.currentAdjustments[
      currentAdjustmentIndex
    ].readBy?.findIndex((record) => record.userId.toString() === userId);

    let updateOperation;
    if (existingReadIndex !== undefined && existingReadIndex >= 0) {
      // Actualizar el registro existente
      updateOperation = {
        $set: { [`${updatePath}.${existingReadIndex}`]: readRecord },
      };
    } else {
      // Agregar un nuevo registro
      updateOperation = {
        $push: { [updatePath]: readRecord },
      };
    }

    const updatedAdjustment = await this.adjustmentModel
      .findByIdAndUpdate(adjustmentId, updateOperation, { new: true })
      .exec();

    if (!updatedAdjustment) {
      throw new NotFoundException(
        `Error al marcar como leído el ajuste con ID "${adjustmentId}"`,
      );
    }

    return updatedAdjustment;
  }

  async requestHelp(
    adjustmentId: string,
    currentAdjustmentIndex: number,
    userId: string,
    description: string,
  ): Promise<Adjustment> {
    if (
      !Types.ObjectId.isValid(adjustmentId) ||
      !Types.ObjectId.isValid(userId)
    ) {
      throw new BadRequestException('ID de ajuste o usuario inválido');
    }

    // Verificar que el ajuste existe
    const adjustment = await this.adjustmentModel.findById(adjustmentId).exec();
    if (!adjustment) {
      throw new NotFoundException(
        `Ajuste con ID "${adjustmentId}" no encontrado`,
      );
    }

    // Verificar que el índice del ajuste actual es válido
    if (
      currentAdjustmentIndex < 0 ||
      currentAdjustmentIndex >= adjustment.currentAdjustments.length
    ) {
      throw new BadRequestException(
        `Índice de ajuste ${currentAdjustmentIndex} fuera de rango`,
      );
    }

    // Crear el objeto de solicitud de ayuda
    const helpRequest = {
      userId: new Types.ObjectId(userId),
      requestDate: new Date(),
      description,
      status: 'pendiente',
    };

    // Actualizar el ajuste para agregar la solicitud de ayuda
    const updatePath = `currentAdjustments.${currentAdjustmentIndex}.helpRequests`;

    const updatedAdjustment = await this.adjustmentModel
      .findByIdAndUpdate(
        adjustmentId,
        { $push: { [updatePath]: helpRequest } },
        { new: true },
      )
      .exec();

    if (!updatedAdjustment) {
      throw new NotFoundException(
        `Error al solicitar ayuda para el ajuste con ID "${adjustmentId}"`,
      );
    }

    return updatedAdjustment;
  }

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

  async getAdjustmentReadStatusByNrc(
    courseNrc: string,
    semester?: string,
  ): Promise<any[]> {
    return this.getAdjustmentReadStatus(undefined, courseNrc, semester);
  }
}
