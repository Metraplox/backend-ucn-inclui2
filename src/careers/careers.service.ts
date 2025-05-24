import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Career, CareerDocument } from './schemas/career.schema';

@Injectable()
export class CareersService {
  constructor(
    @InjectModel(Career.name) private careerModel: Model<CareerDocument>,
  ) {}

  async create(createCareerDto: any): Promise<Career> {
    const createdCareer = new this.careerModel(createCareerDto);
    return createdCareer.save();
  }

  async findAll(semester?: string): Promise<Career[]> {
    const query: any = { isActive: true };
    if (semester) {
      query.currentSemester = semester;
    }
    return this.careerModel.find(query).exec();
  }

  async findOne(id: string): Promise<Career> {
    const career = await this.careerModel.findById(id).exec();
    if (!career) {
      throw new NotFoundException(`Carrera con ID ${id} no encontrada`);
    }
    return career;
  }

  async findByCode(code: string): Promise<Career> {
    const career = await this.careerModel.findOne({ code }).exec();
    if (!career) {
      throw new NotFoundException(`Carrera con código ${code} no encontrada`);
    }
    return career;
  }

  async findByHead(headId: string): Promise<Career[]> {
    return this.careerModel.find({ headId }).exec();
  }

  async findByDepartment(departmentId: string): Promise<Career[]> {
    return this.careerModel.find({ departmentId }).exec();
  }

  async update(id: string, updateCareerDto: any): Promise<Career> {
    const updatedCareer = await this.careerModel
      .findByIdAndUpdate(id, updateCareerDto, { new: true })
      .exec();

    if (!updatedCareer) {
      throw new NotFoundException(`Carrera con ID ${id} no encontrada`);
    }

    return updatedCareer;
  }

  async remove(id: string): Promise<void> {
    const result = await this.careerModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!result) {
      throw new NotFoundException(`Carrera con ID ${id} no encontrada`);
    }
  }

  async addStudent(careerId: string, studentId: string): Promise<Career> {
    const career = await this.findOne(careerId);

    if (!career.studentIds.includes(studentId as any)) {
      career.studentIds.push(studentId as any);
      return career.save();
    }

    return career;
  }

  async removeStudent(careerId: string, studentId: string): Promise<Career> {
    const career = await this.findOne(careerId);

    career.studentIds = career.studentIds.filter(
      (id) => id.toString() !== studentId,
    );

    return career.save();
  }

  async assignHead(careerId: string, headId: string): Promise<Career> {
    return this.update(careerId, { headId });
  }

  async getStudentsCount(careerId: string): Promise<number> {
    const career = await this.findOne(careerId);
    return career.studentIds.length;
  }

  async getStatistics(careerId: string, semester: string): Promise<any> {
    const career = await this.findOne(careerId);

    // Aquí podrías agregar más estadísticas específicas de la carrera
    return {
      careerName: career.name,
      careerCode: career.code,
      semester: semester,
      totalStudents: career.studentIds.length,
      faculty: career.faculty,
      campus: career.campus,
      duration: career.duration,
      isActive: career.isActive,
    };
  }
}
