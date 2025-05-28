import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { Career, CareerDocument } from './schemas/career.schema';


@Injectable()
export class CareersService {
  constructor(
    @InjectModel(Career.name) private careerModel: Model<CareerDocument>,
  ) {}

  async create(createCareerDto: CreateCareerDto): Promise<Career> {
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

  async update(id: string, updateCareerDto: UpdateCareerDto): Promise<Career> {
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
    try {
      // Verificar que la carrera existe
      const career = await this.findOne(careerId);
      
      // Verificar si el estudiante ya está en la carrera
      const studentIdObj = new Types.ObjectId(studentId);
      if (!career.studentIds.some(id => id.equals(studentIdObj))) {
        career.studentIds.push(studentIdObj);
        return await career.save();
      }
      
      return career;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(`La carrera no existe`);
      }
      throw error;
    }
  }

  async removeStudent(careerId: string, studentId: string): Promise<Career> {
    const career = await this.findOne(careerId);
    
    const studentIdObj = new Types.ObjectId(studentId);
    career.studentIds = career.studentIds.filter(
      (id) => !id.equals(studentIdObj)
    );
    
    return await career.save();
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

  async getStudents(careerId: string, semester?: string): Promise<any[]> {
    const career = await this.findOne(careerId);
    
    if (career.studentIds.length === 0) {
      return [];
    }
    
    // Construir la consulta para MongoDB agregando filtro de semestre si es necesario
    const matchStage: any = { _id: { $in: career.studentIds } };
    if (semester) {
      matchStage.semester = semester;
    }
    
    // Consultar directamente la colección de estudiantes para obtener los datos completos
    const students = await this.careerModel.db.collection('students').find(matchStage).toArray();
    
    return students;
  }
}
