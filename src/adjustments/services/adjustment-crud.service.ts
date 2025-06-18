import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Adjustment,
  AdjustmentDocument,
  AdjustmentStatus,
} from '../schemas/adjustment.schema';
import { CreateAdjustmentDto } from '../dto/create-adjustment.dto';
import { UpdateAdjustmentDto } from '../dto/update-adjustment.dto';

@Injectable()
export class AdjustmentCrudService {
  private readonly logger = new Logger(AdjustmentCrudService.name);

  constructor(
    @InjectModel(Adjustment.name)
    private adjustmentModel: Model<AdjustmentDocument>,
  ) {}

  /**
   * Crear un nuevo ajuste razonable
   */
  async create(createAdjustmentDto: CreateAdjustmentDto): Promise<Adjustment> {
    if (!createAdjustmentDto.createdAt) {
      createAdjustmentDto.createdAt = new Date().toISOString();
    }

    if (!createAdjustmentDto.updatedAt) {
      createAdjustmentDto.updatedAt = new Date().toISOString();
    }

    const createdAdjustment = new this.adjustmentModel(createAdjustmentDto);
    return createdAdjustment.save();
  }

  /**
   * Buscar todos los ajustes con filtros opcionales
   */
  async findAll(filter: any = {}): Promise<Adjustment[]> {
    return this.adjustmentModel.find(filter).exec();
  }

  /**
   * Buscar un ajuste por ID
   */
  async findOne(id: string): Promise<Adjustment | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de ajuste inválido');
    }
    return this.adjustmentModel.findById(id).exec();
  }

  /**
   * Actualizar un ajuste por ID
   */
  async update(
    id: string,
    updateAdjustmentDto: UpdateAdjustmentDto,
  ): Promise<Adjustment | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de ajuste inválido');
    }

    return this.adjustmentModel
      .findByIdAndUpdate(id, updateAdjustmentDto, { new: true })
      .exec();
  }

  /**
   * Actualizar un ajuste usando filtro flexible
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
   * Actualizar por ID con validaciones mejoradas
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
   * Eliminar un ajuste por ID
   */
  async remove(id: string): Promise<{ deletedCount?: number }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de ajuste inválido');
    }

    const result = await this.adjustmentModel.deleteOne({ _id: id }).exec();
    return result;
  }
} 