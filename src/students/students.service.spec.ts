import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { StudentsService } from './students.service';
import { Student } from './schemas/student.schema';
import { Types, Model } from 'mongoose';

describe('StudentsService', () => {
  let service: StudentsService;
  let model: Model<Student>;

  const mockStudent = {
    _id: new Types.ObjectId(),
    rut: '12345678-9',
    nombres: 'Juan',
    apellidos: 'Pérez',
    email: 'juan.perez@example.com',
    carrera: 'Ingeniería Civil',
    hasDisability: false,
    semester: '2025-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getModelToken(Student.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockStudent),
            constructor: jest.fn().mockResolvedValue(mockStudent),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    model = module.get<Model<Student>>(getModelToken(Student.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new student', async () => {
      const createStudentDto = {
        rut: '12345678-9',
        nombres: 'Juan',
        apellidos: 'Pérez',
        email: 'juan.perez@example.com',
        carrera: 'Ingeniería Civil',
        hasDisability: false,
        semester: '2025-1',
      };

      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockStudent as any));

      const result = await service.create(createStudentDto);
      expect(result).toEqual(mockStudent);
    });
  });

  describe('findAll', () => {
    it('should return an array of students', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([mockStudent]),
      } as any);

      const students = await service.findAll();
      expect(students).toEqual([mockStudent]);
    });
  });

  describe('findOne', () => {
    it('should return a single student', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockStudent),
      } as any);

      const student = await service.findOne(mockStudent._id.toString());
      expect(student).toEqual(mockStudent);
    });

    it('should throw NotFoundException when student not found', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        'Estudiante con ID 507f1f77bcf86cd799439011 no encontrado',
      );
    });
  });

  describe('update', () => {
    it('should update a student', async () => {
      const updateDto = { nombres: 'Juan Carlos' };
      const updatedStudent = { ...mockStudent, ...updateDto };

      jest
        .spyOn(model, 'findByIdAndUpdate')
        .mockResolvedValueOnce(updatedStudent as any);

      const result = await service.update(
        mockStudent._id.toString(),
        updateDto,
      );
      expect(result).toEqual(updatedStudent);
    });
  });

  describe('remove', () => {
    it('should remove a student', async () => {
      jest
        .spyOn(model, 'findByIdAndDelete')
        .mockResolvedValueOnce(mockStudent as any);

      const result = await service.remove(mockStudent._id.toString());
      expect(result).toEqual(mockStudent);
    });
  });
});
