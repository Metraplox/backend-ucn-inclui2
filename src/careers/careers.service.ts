import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CareerHeadCareerDto } from './dto/career-head.dto';
import { AdjustmentStatus } from 'src/adjustments/schemas/adjustment.schema';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { Career, CareerDocument } from './schemas/career.schema';
import { CareerHeadStatsDto } from './dto/career-head.dto';

@Injectable()
export class CareersService {
  private readonly logger = new Logger(CareersService.name);
  constructor(
    @InjectModel(Career.name) private careerModel: Model<CareerDocument>,
  ) {}

  /**
   * Busca una carrera por nombre exacto
   * @param name Nombre exacto de la carrera
   * @returns Career o null
   */
  async findByName(name: string): Promise<CareerDocument | null> {
    return this.careerModel.findOne({ name }).exec();
  }

  async create(createCareerDto: CreateCareerDto): Promise<Career> {
    const createdCareer = new this.careerModel(createCareerDto);
    return createdCareer.save();
  }

  async findAll(/* Ya no espera el parámetro semester */): Promise<Career[]> {
    //const query: any = { isActive: true }; // Solo filtra por carreras activas
    return this.careerModel.find().exec();
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

  async addStudent(careerId: string, studentId: string): Promise<Career | null> {
    try {
      // Verificar que la carrera existe
      const career = await this.findOne(careerId);
      
      // Verificar si el estudiante ya está en la carrera
      const studentIdObj = new Types.ObjectId(studentId);
      if (!career.studentIds.some(id => id.equals(studentIdObj))) {
        // Actualizar con una operación de MongoDB directamente
        return await this.careerModel
          .findByIdAndUpdate(
            careerId,
            { $push: { studentIds: studentIdObj } },
            { new: true }
          )
          .exec();
      }
      
      // Devolver el objeto directamente, ya que lo hemos recuperado de la base de datos
      return career as unknown as Career;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(`La carrera no existe`);
      }
      throw error;
    }
  }

  async removeStudent(careerId: string, studentId: string): Promise<Career | null> {
    const career = await this.findOne(careerId);
    
    const studentIdObj = new Types.ObjectId(studentId);
    
    // Actualizar con una operación de MongoDB directamente
    return await this.careerModel
      .findByIdAndUpdate(
        careerId,
        { $pull: { studentIds: studentIdObj } },
        { new: true }
      )
      .exec();
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

  async getCareerHeadStatistics(careerId: string, semester?: string): Promise<CareerHeadStatsDto> {
    const career = await this.careerModel.findById(careerId).lean().exec();
    if (!career) {
      throw new NotFoundException(`Career with ID ${careerId} not found`);
    }
    
    // Obtener estudiantes de la carrera
    const students = await this.getStudents(careerId, semester);
    const totalStudents = students.length;
    
    // Obtener ajustes razonables de los estudiantes
    const studentIds = students.map(student => new Types.ObjectId(student._id));
    const matchStage: Record<string, any> = { 
      studentId: { $in: studentIds },
      ...(semester && { semester }) 
    };
    
    // Definir la interfaz para los ajustes
    interface AdjustmentDocument {
      studentId?: Types.ObjectId;
      status?: string;
      [key: string]: any;
    }

    // Consultar ajustes razonables
    const adjustments: AdjustmentDocument[] = await this.careerModel.db
      .collection('adjustments')
      .find(matchStage)
      .toArray();
    
    // Calcular estadísticas
    const studentsWithNEE = new Set(
      adjustments
        .map(adj => adj.studentId?.toString())
        .filter((id): id is string => !!id)
    ).size;
    
    const totalAdjustments = adjustments.length;
    const implementedAdjustments = adjustments.filter(
      adj => adj.status === AdjustmentStatus.IMPLEMENTED
    ).length;
    
    // Formatear respuesta
    const careerDto: CareerHeadCareerDto = {
      _id: career._id.toString(),
      code: career.code,
      name: career.name,
      faculty: 'faculty' in career ? String(career.faculty) : '',
      campus: 'campus' in career ? String(career.campus) : '',
      duration: 'duration' in career ? Number(career.duration) : 10,
      totalStudents,
    };
    
    return {
      careers: [careerDto],
      totalStudents,
      studentsWithNEE,
      totalAdjustments,
      implementedAdjustments,
      implementationRate: totalAdjustments > 0 
        ? Math.round((implementedAdjustments / totalAdjustments) * 100) 
        : 0,
    };
  }

  /**
   * Cuenta el número de carreras activas en un semestre específico
   */
  async countCareers(semester: string): Promise<number> {
    try {
      const query: any = { isActive: true };
      if (semester) {
        query.currentSemester = semester;
      }
      return await this.careerModel.countDocuments(query).exec();
    } catch (error) {
      this.logger.error(`Error al contar carreras: ${error.message}`);
      return 0;
    }
  }

  async getCareerAdjustments(
    careerId: string, 
    status?: string, 
    semester?: string
  ): Promise<any[]> {
    const career = await this.findOne(careerId);
    const students = await this.getStudents(careerId, semester);
    
    if (students.length === 0) {
      return [];
    }
    
    const studentIds = students.map(student => student._id);
    
    // Construir la consulta
    const matchStage: any = { studentId: { $in: studentIds } };
    
    if (status) {
      matchStage.status = status.toUpperCase();
    }
    
    if (semester) {
      matchStage.semester = semester;
    }
    
    // Consultar ajustes con información de estudiante
    const adjustments = await this.careerModel.db
      .collection('adjustments')
      .aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'students',
            localField: 'studentId',
            foreignField: '_id',
            as: 'student'
          }
        },
        { $unwind: '$student' },
        {
          $project: {
            _id: 1,
            type: 1,
            status: 1,
            semester: 1,
            createdAt: 1,
            updatedAt: 1,
            studentId: 1,
            studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
            studentRut: '$student.rut',
            studentEmail: '$student.email',
            courseId: 1,
            courseName: 1,
            details: 1,
            documents: 1,
            comments: 1,
          }
        },
        { $sort: { createdAt: -1 } }
      ])
      .toArray();
    
    return adjustments;
  }
}
