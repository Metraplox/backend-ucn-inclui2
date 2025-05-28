import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student, StudentDocument } from './schemas/student.schema';

@Injectable()
export class StudentsService {
  // Inyectar el modelo de Mongoose para Student
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    // Crear el estudiante con la carrera asociada
    const createdStudent = new this.studentModel({
      ...createStudentDto,
      carreraId: new Types.ObjectId(createStudentDto.carreraId)
    });
    
    // Guardar el estudiante en la base de datos
    const savedStudent = await createdStudent.save();
    
    // Actualizar directamente la colección de carreras para agregar el estudiante
    // Esto evita la referencia circular entre módulos
    await this.updateCareerWithStudent(createStudentDto.carreraId, savedStudent._id.toString());
    
    return savedStudent;
  }
  
  /**
   * Método privado para actualizar la carrera con el ID del estudiante
   * Implementado directamente sobre la colección de MongoDB para evitar dependencias circulares
   */
  private async updateCareerWithStudent(careerId: string, studentId: string): Promise<void> {
    try {
      // Acceder directamente a la colección de carreras en MongoDB
      const studentObjectId = new Types.ObjectId(studentId);
      const careerObjectId = new Types.ObjectId(careerId);
      
      // Usando el modelo de mongoose directamente para actualizar
      await this.studentModel.db.collection('careers').updateOne(
        { _id: careerObjectId },
        { $addToSet: { studentIds: studentObjectId } }
      );
    } catch (error) {
      console.error('Error al actualizar la carrera con el estudiante:', error);
      // No lanzamos el error para no impedir la creación del estudiante
      // Se registra pero permite continuar con la operación
    }
  }

  /**
   * Obtiene todos los estudiantes, opcionalmente filtrados por semestre
   * @param semester Semestre académico para filtrar (formato YYYY-P donde P es el período)
   * @returns Lista de estudiantes que cumplen con los criterios de búsqueda
   */
  async findAll(semester?: string): Promise<Student[]> {
    const query: any = {};
    
    // Si se proporciona un semestre, filtramos por él
    if (semester) {
      query.semester = semester;
    }
    
    return this.studentModel.find(query).exec(); // .exec() devuelve una Promise
  }

  async findByEmail(email: string): Promise<Student> {
    const student = await this.studentModel.findOne({ email }).exec();
    if (!student) {
      throw new NotFoundException(
        `Estudiante con email "${email}" no encontrado.`,
      );
    }
    return student;
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException(`Estudiante con ID "${id}" no encontrado.`);
    }
    return student;
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const updatedStudent = await this.studentModel
      .findByIdAndUpdate(id, updateStudentDto, { new: true })
      .exec();
    if (!updatedStudent) {
      throw new NotFoundException(
        `Estudiante con ID "${id}" no encontrado para actualizar.`,
      );
    }
    return updatedStudent;
  }

  async remove(id: string): Promise<Student> {
    const deletedStudent = await this.studentModel.findByIdAndDelete(id).exec();
    if (!deletedStudent) {
      throw new NotFoundException(
        `Estudiante con ID "${id}" no encontrado para eliminar.`,
      );
    }
    return deletedStudent;
  }

  /**
   * Cuenta el número de estudiantes con NEE para un semestre específico
   * @param semester Semestre académico (formato YYYY-P)
   * @returns Cantidad de estudiantes con NEE en el semestre indicado
   */
  async countStudentsWithNEE(semester: string): Promise<number> {
    const query: any = {
      hasSpecialNeeds: true,
    };
    
    if (semester) {
      query.semester = semester;
    }
    
    return this.studentModel.countDocuments(query).exec();
  }

  /**
   * Encuentra todos los estudiantes con NEE para un semestre específico
   * @param semester Semestre académico (formato YYYY-P)
   * @returns Lista de estudiantes con NEE
   */
  async findAllWithNEE(semester: string): Promise<Student[]> {
    const query: any = {
      hasSpecialNeeds: true,
    };
    
    if (semester) {
      query.semester = semester;
    }
    
    return this.studentModel.find(query)
      .populate('carreraId', 'name department')
      .exec();
  }

  /**
   * Obtiene el conteo de estudiantes con NEE por carrera para un semestre específico
   * @param semester Semestre académico (formato YYYY-P)
   * @returns Array con el conteo de estudiantes por carrera
   */
  async getStudentCountByCareer(semester: string): Promise<any[]> {
    const pipeline: PipelineStage[] = [];
    
    // Filtrar por semestre y estudiantes con NEE
    const matchStage: any = { hasSpecialNeeds: true };
    if (semester) {
      matchStage.semester = semester;
    }
    pipeline.push({ $match: matchStage });
    
    // Agrupar por carrera y contar estudiantes
    pipeline.push({
      $group: {
        _id: '$carreraId',
        count: { $sum: 1 }
      }
    });
    
    // Lookup para obtener detalles de la carrera
    pipeline.push({
      $lookup: {
        from: 'careers',
        localField: '_id',
        foreignField: '_id',
        as: 'careerDetails'
      }
    });
    
    // Desenrollar los detalles de la carrera
    pipeline.push({
      $unwind: {
        path: '$careerDetails',
        preserveNullAndEmptyArrays: true
      }
    });
    
    // Proyecto para formatear la salida
    pipeline.push({
      $project: {
        _id: 0,
        careerId: '$_id',
        careerName: '$careerDetails.name',
        department: '$careerDetails.department',
        studentCount: '$count'
      }
    });
    
    // Ordenar por cantidad de estudiantes descendente
    pipeline.push({ $sort: { studentCount: -1 } });
    
    return this.studentModel.aggregate(pipeline).exec();
  }
}
