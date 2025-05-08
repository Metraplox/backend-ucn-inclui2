import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student, StudentDocument } from './schemas/student.schema';

@Injectable()
export class StudentsService {
  // Inyectar el modelo de Mongoose para Student
  constructor(@InjectModel(Student.name) private studentModel: Model<StudentDocument>) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const createdStudent = new this.studentModel(createStudentDto);
    return createdStudent.save();
  }

  async findAll(): Promise<Student[]> {
    return this.studentModel.find().exec(); // .exec() devuelve una Promise
  }

  async findOne(id: string): Promise<Student | null> {
    // Validar que el ID sea un ObjectId válido de Mongo
    return this.studentModel.findById(id).exec();
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student | null> {
    // findByIdAndUpdate devuelve el documento *antes* de la actualización por defecto.
    // { new: true } hace que devuelva el documento modificado.
    return this.studentModel.findByIdAndUpdate(id, updateStudentDto, { new: true }).exec();
  }

  async remove(id: string): Promise<{ deletedCount?: number }> {
    // deleteOne devuelve un objeto con { acknowledged: boolean, deletedCount: number }
    const result = await this.studentModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
        // Opcional: Podrías lanzar NotFoundException aquí si prefieres manejarlo en el servicio
        // throw new NotFoundException(`Student with ID "${id}" not found`);
    }
    return result; // Devolver el objeto resultado completo
  }
}
