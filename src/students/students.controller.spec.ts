import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentDocument } from './schemas/student.schema'; // Usar StudentDocument para el mock
import { NotFoundException } from '@nestjs/common';

// Datos de ejemplo consistentes con students.service.spec.ts
const studentId = 'someMongoId';

const mockStudentResult: Partial<StudentDocument> = {
  // Tipo que incluye _id
  _id: studentId as any,
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

// Mock del servicio StudentsService
const mockStudentsService = {
  create: jest.fn().mockResolvedValue(mockStudentResult),
  findAll: jest.fn().mockResolvedValue([mockStudentResult]),
  findOne: jest.fn().mockImplementation((id: string) => {
    if (id === studentId) {
      return Promise.resolve(mockStudentResult);
    }
    return Promise.reject(
      new NotFoundException(`Estudiante con ID "${id}" no encontrado.`),
    );
  }),
  update: jest.fn().mockImplementation((id: string, dto: UpdateStudentDto) => {
    if (id === studentId) {
      return Promise.resolve({ ...mockStudentResult, ...dto });
    }
    return Promise.reject(
      new NotFoundException(
        `Estudiante con ID "${id}" no encontrado para actualizar.`,
      ),
    );
  }),
  remove: jest.fn().mockImplementation((id: string) => {
    if (id === studentId) {
      return Promise.resolve(undefined); // Simula void para éxito
    }
    return Promise.reject(
      new NotFoundException(
        `Estudiante con ID "${id}" no encontrado para eliminar.`,
      ),
    );
  }),
};

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: StudentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        {
          provide: StudentsService,
          useValue: mockStudentsService,
        },
      ],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    service = module.get<StudentsService>(StudentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return a student', async () => {
      const result = await controller.create(createStudentDto);
      expect(service.create).toHaveBeenCalledWith(createStudentDto);
      expect(result).toEqual(mockStudentResult);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return an array of students', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockStudentResult]);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne and return a student', async () => {
      const result = await controller.findOne(studentId);
      expect(service.findOne).toHaveBeenCalledWith(studentId);
      expect(result).toEqual(mockStudentResult);
    });

    it('should re-throw NotFoundException if service.findOne throws it', async () => {
      const nonExistentId = 'nonExistentId';
      // El mock de service.findOne ya está configurado para lanzar NotFoundException
      await expect(controller.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findOne).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('update', () => {
    it('should call service.update and return the updated student', async () => {
      const result = await controller.update(studentId, updateStudentDto);
      expect(service.update).toHaveBeenCalledWith(studentId, updateStudentDto);
      expect(result).toEqual({ ...mockStudentResult, ...updateStudentDto });
    });

    it('should re-throw NotFoundException if service.update throws it', async () => {
      const nonExistentId = 'nonExistentId';
      await expect(
        controller.update(nonExistentId, updateStudentDto),
      ).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(
        nonExistentId,
        updateStudentDto,
      );
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      await expect(controller.remove(studentId)).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(studentId);
    });

    it('should re-throw NotFoundException if service.remove throws it', async () => {
      const nonExistentId = 'nonExistentId';
      await expect(controller.remove(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.remove).toHaveBeenCalledWith(nonExistentId);
    });
  });
});
