import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Student } from '../students/schemas/student.schema';
import { Adjustment } from '../adjustments/schemas/adjustment.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(Adjustment.name) private adjustmentModel: Model<Adjustment>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const createdCourse = new this.courseModel(createCourseDto);
    return createdCourse.save();
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }

  async findBySemester(semester: string): Promise<Course[]> {
    return this.courseModel.find({ semestre: semester }).exec();
  }

  async findOne(id: string): Promise<Course> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new NotFoundException(`ID inválido: ${id}`);
    }
    
    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new NotFoundException(`Curso con ID ${id} no encontrado`);
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();
    
    if (!updatedCourse) {
      throw new NotFoundException(`Curso con ID ${id} no encontrado`);
    }
    return updatedCourse;
  }

  async remove(id: string): Promise<void> {
    const result = await this.courseModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Curso con ID ${id} no encontrado`);
    }
  }

  async findByStudent(studentId: string, semester?: string): Promise<Course[]> {
    const isValidId = Types.ObjectId.isValid(studentId);
    if (!isValidId) {
      throw new NotFoundException(`ID de estudiante inválido: ${studentId}`);
    }

    const query: any = { estudiantes: studentId };
    if (semester) {
      query.semestre = semester;
    }

    return this.courseModel.find(query).exec();
  }

  async findStudentsWithAdjustments(courseId: string): Promise<any[]> {
    const course = await this.findOne(courseId);
    
    // Encontrar todos los ajustes activos para el curso específico
    const adjustments = await this.adjustmentModel.find({
      'currentAdjustments.courseNrc': course.nrc,
      'currentAdjustments.estado': 'activo',
    }).exec();
    
    // Obtener los IDs de estudiantes únicos de los ajustes
    const studentIds = [...new Set(adjustments.map(adj => adj.studentId.toString()))];
    
    // Buscar la información de los estudiantes
    const students = await this.studentModel.find({
      _id: { $in: studentIds },
    }).exec();
    
    // Crear un mapa para asociar estudiantes con sus ajustes
    const result = students.map(student => {
      const studentAdjustments = adjustments
        .filter(adj => adj.studentId.toString() === student._id.toString())
        .flatMap(adj => adj.currentAdjustments)
        .filter(adj => adj.courseNrc === course.nrc && adj.estado === 'activo')
        .map((adj, index) => ({
          _id: index.toString(), // Usar un índice como identificador único
          tipo: adj.type,
          descripcion: adj.comentarios || `Ajuste tipo ${adj.type}`
        }));
      
      return {
        _id: student._id,
        nombres: student.nombres || 'N/A',
        apellidos: student.apellidos || 'N/A',
        rut: student.rut || 'N/A',
        email: student.email || 'N/A',
        ajustes: studentAdjustments
      };
    });
    
    return result;
  }
}
