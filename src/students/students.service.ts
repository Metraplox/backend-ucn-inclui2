import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student, StudentDocument } from './schemas/student.schema';
import { User, UserRole } from '../users/schemas/user.schema';

@Injectable()
export class StudentsService {
  /**
   * Método mínimo para evitar error en departamentos.service.ts
   * No debe usarse en producción sin validación adecuada
   */
  async findByDepartmentWithNEE(departmentId: string, semester: string): Promise<any[]> {
    // Implementación mínima: buscar estudiantes con NEE por departamento y semestre
    // Reemplazar por lógica real según el modelo de datos
    return [];
  }

  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    // Iniciar una sesión de transacción
    const session = await this.studentModel.db.startSession();
    session.startTransaction();

    try {
      // 1. Crear el usuario primero
      const user = new this.userModel({
        email: createStudentDto.email.toLowerCase(),
        nombreCompleto: `${createStudentDto.nombres} ${createStudentDto.apellidos}`.trim(),
        roles: [UserRole.STUDENT],
        isActive: true,
        isProfileComplete: false, // El perfil se completará con la autenticación de Google
        password_hash: null, // Se establecerá con Google Auth
      });

      const savedUser = await user.save({ session });

      // 2. Crear el estudiante con referencia al usuario
      const createdStudent = new this.studentModel({
        ...createStudentDto,
        userId: savedUser._id,
        carreraId: new Types.ObjectId(createStudentDto.carreraId)
      });

      const savedStudent = await createdStudent.save({ session });

      // 3. Actualizar el usuario con la referencia al estudiante
      await this.userModel.findByIdAndUpdate(
        savedUser._id,
        { $set: { studentId: savedStudent._id, isProfileComplete: true } },
        { session }
      );

      // 4. Actualizar la carrera con el nuevo estudiante
      await this.updateCareerWithStudent(createStudentDto.carreraId, savedStudent._id.toString(), session);

      // Confirmar la transacción
      await session.commitTransaction();
      
      return savedStudent;
    } catch (error) {
      // Si hay un error, deshacer la transacción
      await session.abortTransaction();
      
      // Manejar errores de duplicado

      if (error.code === 11000) {
        throw new ConflictException('El correo electrónico ya está en uso');
      }
      
      throw new InternalServerErrorException('Error al crear el estudiante: ' + error.message);
    } finally {
      // Finalizar la sesión
      await session.endSession();
    }
  }
  
  /**
   * Método privado para actualizar la carrera con el ID del estudiante
   * Implementado directamente sobre la colección de MongoDB para evitar dependencias circulares
   */
  private async updateCareerWithStudent(
    careerId: string, 
    studentId: string, 
    session?: any
  ): Promise<void> {
    try {
      const studentObjectId = new Types.ObjectId(studentId);
      const careerObjectId = new Types.ObjectId(careerId);
      
      const updateOperation = {
        $addToSet: { studentIds: studentObjectId }
      };
      
      const options = session ? { session } : {};
      
      await this.studentModel.db.collection('careers').updateOne(
        { _id: careerObjectId },
        updateOperation,
        options
      );
    } catch (error) {
      console.error('Error al actualizar la carrera con el estudiante:', error);
      // En este caso, como estamos en una transacción, es mejor lanzar el error
      throw error;
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
    const student = await this.studentModel
      .findOne({ email: email.toLowerCase().trim() })
      .populate('userId', 'email isActive roles')
      .exec();
      
    if (!student) {
      throw new NotFoundException(
        `Estudiante con email "${email}" no encontrado.`,
      );
    }
    return student;
  }
  
  /**
   * Encuentra un estudiante basado en el ID de usuario asociado
   * @param userId ID del usuario en la colección de usuarios
   * @returns El perfil de estudiante completo
   */
  async findByUserId(userId: string): Promise<Student> {
    // Convertir el string ID a ObjectId para la búsqueda
    const objectId = new Types.ObjectId(userId);
    
    const student = await this.studentModel
      .findOne({ userId: objectId })
      .populate('userId', 'email isActive roles nombreCompleto')
      .populate('carreraId', 'name code')
      .exec();
    
    if (!student) {
      throw new NotFoundException(
        `Perfil de estudiante no encontrado para el usuario con ID "${userId}".`,
      );
    }
    
    return student;
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentModel
      .findById(id)
      .populate('userId', 'email isActive roles')
      .populate('carreraId', 'name code')
      .exec();
      
    if (!student) {
      throw new NotFoundException(`Estudiante con ID "${id}" no encontrado.`);
    }
    return student;
  }

  /**
   * Encuentra un estudiante por su ID sin lanzar excepciones
   * Optimizado para consultas ligeras donde solo se necesitan datos básicos del estudiante
   * @param id ID del estudiante
   * @returns El estudiante o null si no existe
   */
  async findById(id: string): Promise<Student | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    return this.studentModel
      .findById(id)
      .select('_id name rut email userId carreraId')
      .lean()
      .exec();
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const updatedStudent = await this.studentModel
      .findByIdAndUpdate(
        id, 
        { 
          ...updateStudentDto,
          // Si se actualiza la carrera, convertir el ID
          ...(updateStudentDto.carreraId && { 
            carreraId: new Types.ObjectId(updateStudentDto.carreraId) 
          })
        }, 
        { 
          new: true,
          runValidators: true 
        }
      )
      .populate('userId', 'email isActive roles')
      .populate('carreraId', 'name code')
      .exec();
      
    if (!updatedStudent) {
      throw new NotFoundException(
        `Estudiante con ID "${id}" no encontrado para actualizar.`,
      );
    }
    
    // Si se actualizó el email, actualizar también en el usuario
    if (updateStudentDto.email) {
      await this.userModel.findByIdAndUpdate(
        updatedStudent.userId,
        { email: updateStudentDto.email.toLowerCase().trim() }
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
