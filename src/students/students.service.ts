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

  async findOne(id: string): Promise<Student> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException(`Estudiante con ID "${id}" no encontrado.`);
    }
    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const updatedStudent = await this.studentModel.findByIdAndUpdate(id, updateStudentDto, { new: true }).exec();
    if (!updatedStudent) {
      throw new NotFoundException(`Estudiante con ID "${id}" no encontrado para actualizar.`);
    }
    return updatedStudent;
  }

  async remove(id: string): Promise<void> {
    const result = await this.studentModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Estudiante con ID "${id}" no encontrado para eliminar.`);
    }
    // No es necesario devolver nada si la eliminación fue exitosa y no hay error.
    // Si se necesita el resultado, se puede cambiar el tipo de retorno a: Promise<{ deletedCount: number }>
    // y devolver { deletedCount: result.deletedCount }
  }
}
