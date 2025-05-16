import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { UpdateAdjustmentDto } from './dto/update-adjustment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Adjustment, AdjustmentDocument, AdjustmentStatus } from './schemas/adjustment.schema';
import { Model, Types } from 'mongoose';
import { DocumentEntity, DocumentDocument } from '../documents/schemas/document.schema';

@Injectable()
export class AdjustmentsService {
constructor(
    @InjectModel(Adjustment.name) private adjustmentModel: Model<AdjustmentDocument>,
    @InjectModel(DocumentEntity.name) private documentModel: Model<DocumentDocument>
  ) {}

  async create(createAdjustmentDto: CreateAdjustmentDto): Promise<Adjustment> {
    const createdAdjustment = new this.adjustmentModel(createAdjustmentDto);
    return createdAdjustment.save();
  }

  async findAll(): Promise<Adjustment[]> {
    return this.adjustmentModel.find().exec(); // .exec() devuelve una Promise
  }

  async findOne(id: string): Promise<Adjustment | null> {
    return this.adjustmentModel.findById(id).exec();
  }

  async update(id: string, updateAdjustmentDto: UpdateAdjustmentDto): Promise<Adjustment | null> {
    return this.adjustmentModel.findByIdAndUpdate(id, updateAdjustmentDto, { new: true }).exec();
  }

  async remove(id: string): Promise<{ deletedCount?: number }> {
    const result = await this.adjustmentModel.deleteOne({ _id: id }).exec();
    return result;
  }

  async findByStudentId(studentId: string, status?: AdjustmentStatus): Promise<Adjustment[]> {
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
    
    return this.adjustmentModel.find({
      'currentAdjustments.courseId': new Types.ObjectId(courseId)
    }).exec();
  }

  async associateDocument(adjustmentId: string, documentId: string): Promise<Adjustment> {
    if (!Types.ObjectId.isValid(adjustmentId) || !Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de ajuste o documento inválido');
    }
    
    // Verificar que el documento existe
    const document = await this.documentModel.findById(documentId).exec();
    if (!document) {
      throw new NotFoundException(`Documento con ID "${documentId}" no encontrado`);
    }
    
    // Verificar que el ajuste existe
    const adjustment = await this.adjustmentModel.findById(adjustmentId).exec();
    if (!adjustment) {
      throw new NotFoundException(`Ajuste con ID "${adjustmentId}" no encontrado`);
    }
    
    // Asociar el documento al ajuste
    const updatedAdjustment = await this.adjustmentModel.findByIdAndUpdate(
      adjustmentId,
      { $addToSet: { documentosAsociados: new Types.ObjectId(documentId) } },
      { new: true }
    ).exec();
    
    if (!updatedAdjustment) {
      throw new NotFoundException(`Error al actualizar el ajuste con ID "${adjustmentId}"`);
    }
    
    return updatedAdjustment;
  }

  async updateStatus(adjustmentId: string, status: AdjustmentStatus, updatedByUserId: string): Promise<Adjustment> {
    if (!Types.ObjectId.isValid(adjustmentId)) {
      throw new BadRequestException('ID de ajuste inválido');
    }
    
    // Verificar que el ajuste existe
    const adjustment = await this.adjustmentModel.findById(adjustmentId).exec();
    if (!adjustment) {
      throw new NotFoundException(`Ajuste con ID "${adjustmentId}" no encontrado`);
    }
    
    // Actualizar el estado del ajuste
    const updateData = {
      estado: status,
      ultimaActualizacion: new Date(),
      actualizadoPor: new Types.ObjectId(updatedByUserId),
    };
    
    const updatedAdjustment = await this.adjustmentModel.findByIdAndUpdate(
      adjustmentId,
      { $set: updateData },
      { new: true }
    ).exec();
    
    if (!updatedAdjustment) {
      throw new NotFoundException(`Error al actualizar el ajuste con ID "${adjustmentId}"`);
    }
    
    return updatedAdjustment;
  }
}
