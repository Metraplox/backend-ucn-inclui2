import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Student } from '../students/schemas/student.schema';
import { Adjustment } from '../adjustments/schemas/adjustment.schema';

@Injectable()
export class CoursesService {
  /**
   * Busca cursos por departamento y semestre
   * Implementa lógica real para consultar en base de datos
   */
  async findByDepartment(departmentId: string, semester: string): Promise<Course[]> {
    if (!Types.ObjectId.isValid(departmentId)) {
      throw new BadRequestException('ID de departamento inválido');
    }
    return this.courseModel.find({ 
      departmentId: new Types.ObjectId(departmentId), 
      semestre: semester 
    }).exec();
  }

  private readonly logger = new Logger(CoursesService.name);
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
  
  async findCoursesByTeacher(teacherId: string, semester: string): Promise<Course[]> {
    
    return this.courseModel.find({
      teacherId: teacherId,
      semestre: semester
    }).exec();
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

  async findByTeacher(teacherId: string, semester: string): Promise<Course[]> {
    return this.courseModel
      .find({
        teacherId: teacherId,
        semestre: semester,
      })
      .exec();
  }

  async findStudentsWithAdjustments(courseId: string): Promise<any[]> {
    const course = await this.findOne(courseId);
    // Encontrar todos los ajustes activos para el curso específico
    const adjustments = await this.adjustmentModel
      .find({
        'currentAdjustments.courseNrc': course.nrc,
        'currentAdjustments.estado': 'activo',
      })
      .exec();
    

    // Obtener los IDs de estudiantes únicos de los ajustes
    const studentIds = [
      ...new Set(adjustments.map((adj) => adj.studentId.toString())),
    ];

    // Buscar la información de los estudiantes
    const students = await this.studentModel
      .find({
        _id: { $in: studentIds },
      })
      .exec();
  
    // Crear un mapa para asociar estudiantes con sus ajustes
    const result = students.map((student) => {
      const studentAdjustments = adjustments
        .filter((adj) => adj.studentId.toString() === student._id.toString())
        .flatMap((adj) => adj.currentAdjustments)
        .filter(
          (adj) => adj.courseNrc === course.nrc && adj.estado === 'activo',
        )
        .map((adj, index) => ({
          _id: index.toString(), // Usar un índice como identificador único
          tipo: adj.type,
          descripcion: adj.comentarios || `Ajuste tipo ${adj.type}`,
        }));

      return {
        _id: student._id,
        nombres: student.nombres || 'N/A',
        apellidos: student.apellidos || 'N/A',
        rut: student.rut || 'N/A',
        email: student.email || 'N/A',
        ajustes: studentAdjustments,
      };
    });

    return result;
  }

  /**
   * Cuenta la cantidad total de cursos en un semestre específico
   */
  async countCourses(semester: string): Promise<number> {
    try {
      return await this.courseModel.countDocuments({ semestre: semester }).exec();
    } catch (error) {
      this.logger.error(`Error al contar cursos: ${error.message}`);
      return 0;
    }
  }

  /**
   * Obtiene los departamentos académicos para un semestre específico
   */
  async getDepartments(semester: string): Promise<{ name: string; count: number }[]> {
    try {
      const result = await this.courseModel.aggregate([
        { $match: { semestre: semester } },
        { $group: { _id: "$departamento", count: { $sum: 1 } } },
        { $project: { _id: 0, name: "$_id", count: 1 } },
        { $sort: { count: -1 } }
      ]).exec();

      return result;
    } catch (error) {
      this.logger.error(`Error al obtener departamentos: ${error.message}`);
      return [];
    }
  }

  /**
   * Obtiene los cursos con mayor cantidad de estudiantes con NEE
   */
  async getTopCoursesWithNEE(semester: string, limit: number = 10): Promise<CourseWithNEE[]> {
    try {
      // Primero encontramos los ajustes activos en el semestre actual
      const adjustments = await this.adjustmentModel
        .find({
          'currentAdjustments.semester': semester,
          'currentAdjustments.estado': 'activo',
        })
        .lean()
        .exec();

      // Creamos un mapa para contar estudiantes con NEE por curso
      const courseStudentCount = new Map<string, Set<string>>();
      const courseDetails = new Map<string, Omit<CourseWithNEE, 'studentsWithNEECount'>>();

      // Obtenemos todos los NRCs únicos primero para optimizar la consulta
      const uniqueNrcs = new Set<string>();
      for (const adjustment of adjustments) {
        for (const currentAdj of adjustment.currentAdjustments) {
          if (currentAdj.semester === semester && currentAdj.estado === 'activo') {
            uniqueNrcs.add(currentAdj.courseNrc);
          }
        }
      }

      // Obtenemos todos los cursos necesarios en una sola consulta
      const courses = await this.courseModel
        .find({ 
          nrc: { $in: Array.from(uniqueNrcs) },
          semestre: semester 
        })
        .lean()
        .exec();

      // Creamos un mapa de cursos por NRC para acceso rápido
      const coursesByNrc = new Map(courses.map(course => [course.nrc, {
        ...course,
        _id: course._id.toString() // Convertir ObjectId a string
      }]));

      // Procesamos los ajustes
      for (const adjustment of adjustments) {
        for (const currentAdj of adjustment.currentAdjustments) {
          if (currentAdj.semester === semester && currentAdj.estado === 'activo') {
            const nrc = currentAdj.courseNrc;
            const course = coursesByNrc.get(nrc);
            
            if (!course) continue;
            
            if (!courseStudentCount.has(nrc)) {
              courseStudentCount.set(nrc, new Set());
              
              courseDetails.set(nrc, {
                courseId: course._id,
                name: course.nombre,
                nrc: course.nrc,
                code: course.code,
                department: course.departamento
              });
            }
            
            // Registramos que este estudiante tiene NEE en este curso
            courseStudentCount.get(nrc)?.add(adjustment.studentId.toString());
          }
        }
      }

      // Convertimos el mapa a un arreglo para ordenar y limitar
      const result = Array.from(courseStudentCount.entries())
        .map(([nrc, students]) => ({
          ...courseDetails.get(nrc)!,
          studentsWithNEECount: students.size
        }))
        .filter((item): item is CourseWithNEE => !!item.name) // Filtramos items inválidos
        .sort((a, b) => b.studentsWithNEECount - a.studentsWithNEECount)
        .slice(0, limit);

      return result;
    } catch (error) {
      this.logger.error(
        `Error al obtener cursos con mayor cantidad de NEE: ${error.message}`,
        error.stack
      );
      return [];
    }
  }
}

/**
 * Interfaz para los cursos con mayor cantidad de estudiantes con NEE
 */
export interface CourseWithNEE {
  courseId: string;
  name: string;
  nrc: string;
  code: string;
  department: string;
  studentsWithNEECount: number;
}

