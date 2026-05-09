import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { UpdateAdjustmentDto } from './dto/update-adjustment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Adjustment, AdjustmentDocument } from './schemas/adjustment.schema';
import { Model } from 'mongoose';

@Injectable()
export class AdjustmentsService {
constructor(@InjectModel(Adjustment.name) private adjustmentModel: Model<AdjustmentDocument>) {}

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
}
