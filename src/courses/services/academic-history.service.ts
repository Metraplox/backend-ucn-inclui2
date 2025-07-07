import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AcademicHistory,
  AcademicHistoryDocument,
} from '../schemas/academic-history.schema';
import { CreateAcademicHistoryDto } from '../dto/create-academic-history.dto';
import { UpdateAcademicHistoryDto } from '../dto/update-academic-history.dto';

@Injectable()
export class AcademicHistoryService {
  constructor(
    @InjectModel(AcademicHistory.name)
    private academicHistoryModel: Model<AcademicHistoryDocument>,
  ) {}

  async create(
    createAcademicHistoryDto: CreateAcademicHistoryDto,
  ): Promise<AcademicHistory> {
    const createdAcademicHistory = new this.academicHistoryModel({
      ...createAcademicHistoryDto,
      studentId: new Types.ObjectId(createAcademicHistoryDto.studentId),
      courseId: new Types.ObjectId(createAcademicHistoryDto.courseId),
      adjustmentIds:
        createAcademicHistoryDto.adjustmentIds?.map(
          (id) => new Types.ObjectId(id),
        ) || [],
    });

    return createdAcademicHistory.save();
  }

  async findAll(semester?: string): Promise<AcademicHistory[]> {
    const query: any = {};

    if (semester) {
      query.semester = semester;
    }

    return this.academicHistoryModel.find(query).exec();
  }

  async findByStudent(
    studentId: string,
    semester?: string,
  ): Promise<AcademicHistory[]> {
    const query: any = {
      studentId: new Types.ObjectId(studentId),
    };

    if (semester) {
      query.semester = semester;
    }

    return this.academicHistoryModel
      .find(query)
      .populate('courseId', 'name code')
      .populate('adjustmentIds', 'name description')
      .exec();
  }

  async findByCourse(
    courseId: string,
    semester?: string,
  ): Promise<AcademicHistory[]> {
    const query: any = {
      courseId: new Types.ObjectId(courseId),
    };

    if (semester) {
      query.semester = semester;
    }

    return this.academicHistoryModel
      .find(query)
      .populate('studentId', 'rut nombres apellidos email')
      .populate('adjustmentIds', 'name description')
      .exec();
  }

  async findOne(id: string): Promise<AcademicHistory> {
    const academicHistory = await this.academicHistoryModel
      .findById(id)
      .populate('studentId', 'rut nombres apellidos email')
      .populate('courseId', 'name code')
      .populate('adjustmentIds', 'name description')
      .exec();

    if (!academicHistory) {
      throw new NotFoundException(
        `Registro de historial académico con ID "${id}" no encontrado`,
      );
    }

    return academicHistory;
  }

  async update(
    id: string,
    updateAcademicHistoryDto: UpdateAcademicHistoryDto,
  ): Promise<AcademicHistory> {
    const updateData: any = { ...updateAcademicHistoryDto };

    if (updateData.adjustmentIds) {
      updateData.adjustmentIds = updateData.adjustmentIds.map(
        (id) => new Types.ObjectId(id),
      );
    }

    const updatedAcademicHistory = await this.academicHistoryModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedAcademicHistory) {
      throw new NotFoundException(
        `Registro de historial académico con ID "${id}" no encontrado para actualizar`,
      );
    }

    return updatedAcademicHistory;
  }

  async remove(id: string): Promise<void> {
    const result = await this.academicHistoryModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(
        `Registro de historial académico con ID "${id}" no encontrado para eliminar`,
      );
    }
  }
}
