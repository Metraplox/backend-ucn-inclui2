import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student, StudentDocument } from './schemas/student.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

// Mock del modelo Student
const mockStudentModel = {
  new: jest.fn().mockImplementation(dto => ({ ...dto, save: jest.fn().mockResolvedValue({ _id: 'someId', ...dto }) })),
  constructor: jest.fn().mockImplementation(dto => ({ ...dto, save: jest.fn().mockResolvedValue({ _id: 'someId', ...dto }) })),
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockReturnThis(),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  deleteOne: jest.fn().mockReturnThis(),
  exec: jest.fn(),
  save: jest.fn(),
};

// Datos de ejemplo
const studentId = 'someMongoId';
const mockStudent: Partial<StudentDocument> = { // Cambiado de Partial<Student> a Partial<StudentDocument>
  _id: studentId as any, // Mongoose _id es ObjectId, pero para mocks un string suele ser suficiente. 'as any' para simplificar.
  rut: '12345678-9',
  nombres: 'Juan',
  apellidos: 'Perez',
  email: 'juan.perez@example.com',
  carrera: 'Ingeniería Informática',
};

const createStudentDto: CreateStudentDto = {
  rut: '12345678-9',
  nombres: 'Juan',
  apellidos: 'Perez',
  email: 'juan.perez@example.com',
  carrera: 'Ingeniería Informática',
};

const updateStudentDto: UpdateStudentDto = {
  carrera: 'Ingeniería Civil Informática',
};


describe('StudentsService', () => {
  let service: StudentsService;
  let model: Model<StudentDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getModelToken(Student.name),
          useValue: mockStudentModel,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    model = module.get<Model<StudentDocument>>(getModelToken(Student.name));
    jest.clearAllMocks(); // Limpiar mocks entre pruebas
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a student', async () => {
      // El mock de 'new' y 'save' ya está configurado para devolver el DTO con un _id
      const result = await service.create(createStudentDto);
      expect(mockStudentModel.new).toHaveBeenCalledWith(createStudentDto);
      expect(result.rut).toEqual(createStudentDto.rut);
      // Nota: el mock de save() debe ser llamado en la instancia creada por 'new this.studentModel()'
      // Esto se maneja en la implementación del mockStudentModel.new
    });
  });

  describe('findAll', () => {
    it('should return an array of students', async () => {
      const studentsArray = [mockStudent];
      mockStudentModel.exec.mockResolvedValueOnce(studentsArray);
      const result = await service.findAll();
      expect(model.find).toHaveBeenCalled();
      expect(result).toEqual(studentsArray);
    });
  });

  describe('findOne', () => {
    it('should find and return a student by ID', async () => {
      mockStudentModel.exec.mockResolvedValueOnce(mockStudent);
      const result = await service.findOne(studentId);
      expect(model.findById).toHaveBeenCalledWith(studentId);
      expect(result).toEqual(mockStudent);
    });

    it('should throw NotFoundException if student not found', async () => {
      mockStudentModel.exec.mockResolvedValueOnce(null);
      await expect(service.findOne(studentId)).rejects.toThrow(NotFoundException);
      expect(model.findById).toHaveBeenCalledWith(studentId);
    });
  });

  describe('update', () => {
    it('should update and return a student', async () => {
      const updatedStudent = { ...mockStudent, ...updateStudentDto };
      mockStudentModel.exec.mockResolvedValueOnce(updatedStudent);
      const result = await service.update(studentId, updateStudentDto);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(studentId, updateStudentDto, { new: true });
      expect(result).toEqual(updatedStudent);
    });

    it('should throw NotFoundException if student to update not found', async () => {
      mockStudentModel.exec.mockResolvedValueOnce(null);
      await expect(service.update(studentId, updateStudentDto)).rejects.toThrow(NotFoundException);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(studentId, updateStudentDto, { new: true });
    });
  });

  describe('remove', () => {
    it('should remove a student', async () => {
      mockStudentModel.exec.mockResolvedValueOnce({ deletedCount: 1 });
      await expect(service.remove(studentId)).resolves.toBeUndefined(); // remove ahora devuelve void
      expect(model.deleteOne).toHaveBeenCalledWith({ _id: studentId });
    });

    it('should throw NotFoundException if student to remove not found', async () => {
      mockStudentModel.exec.mockResolvedValueOnce({ deletedCount: 0 });
      await expect(service.remove(studentId)).rejects.toThrow(NotFoundException);
      expect(model.deleteOne).toHaveBeenCalledWith({ _id: studentId });
    });
  });
});
