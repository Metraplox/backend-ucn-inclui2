import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReportsService } from '../../../src/reports/reports.service';
import { StudentsService } from '../../../src/students/students.service';
import { AdjustmentsService } from '../../../src/adjustments/adjustments.service';
import { DocumentsService } from '../../../src/documents/documents.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let mockReportModel: any;
  let mockStudentsService: Partial<StudentsService>;
  let mockAdjustmentsService: Partial<AdjustmentsService>;
  let mockDocumentsService: Partial<DocumentsService>;

  beforeEach(async () => {
    // Mocks para las dependencias
    mockReportModel = {
      save: jest.fn(),
      find: jest.fn(),
      exec: jest.fn(),
      constructor: jest.fn(),
    };

    mockStudentsService = {
      findOne: jest.fn(),
      findAllWithNEE: jest.fn(),
    };

    mockAdjustmentsService = {
      findByStudentId: jest.fn(),
    };

    mockDocumentsService = {
      // Mock methods as needed
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getModelToken('Report'),
          useValue: mockReportModel,
        },
        {
          provide: StudentsService,
          useValue: mockStudentsService,
        },
        {
          provide: AdjustmentsService,
          useValue: mockAdjustmentsService,
        },
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStudentsWithNEE', () => {
    it('should return students with NEE when valid filters are provided', async () => {
      // Arrange
      const mockStudents = [
        {
          _id: '507f1f77bcf86cd799439011',
          rut: '12.345.678-9',
          name: 'Juan Pérez',
          email: 'juan.perez@ucn.cl',
          isActive: true,
        },
      ];

      const mockUser = { role: 'COORDINADOR', id: 'user123' };
      const filter = { semester: '2025-1', active: true };

      mockStudentsService.findAllWithNEE = jest.fn().mockResolvedValue(mockStudents);

      // Act
      const result = await service.getStudentsWithNEE(
        filter.semester,
        undefined,
        filter.active,
        mockUser,
      );

      // Assert
      expect(result).toEqual(mockStudents);
      expect(mockStudentsService.findAllWithNEE).toHaveBeenCalledWith(
        {
          semester: '2025-1',
          isActive: true,
        },
        mockUser,
      );
    });

    it('should handle empty results gracefully', async () => {
      // Arrange
      mockStudentsService.findAllWithNEE = jest.fn().mockResolvedValue([]);
      const mockUser = { role: 'COORDINADOR', id: 'user123' };

      // Act
      const result = await service.getStudentsWithNEE('2025-1', undefined, true, mockUser);

      // Assert
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('generateStudentReport', () => {
    it('should generate a complete student report', async () => {
      // Arrange
      const studentId = '507f1f77bcf86cd799439011';
      const semester = '2025-1';
      
      const mockStudent = {
        _id: studentId,
        rut: '12.345.678-9',
        name: 'Juan Pérez',
        email: 'juan.perez@ucn.cl',
      };

      const mockAdjustments = [
        {
          _id: 'adj1',
          categoryName: 'Tiempo adicional',
          description: '50% tiempo extra',
          isActive: true,
        },
      ];

      const mockReport = {
        _id: 'report1',
        userId: studentId,
        role: 'ESTUDIANTE',
        type: 'StudentProgress',
        data: {
          studentInfo: mockStudent,
          adjustments: mockAdjustments,
          documents: [],
          semester,
        },
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(this),
      };

      mockStudentsService.findOne = jest.fn().mockResolvedValue(mockStudent);
      mockAdjustmentsService.findByStudentId = jest.fn().mockResolvedValue(mockAdjustments);
      mockReportModel.constructor = jest.fn().mockReturnValue(mockReport);

      // Act
      const result = await service.generateStudentReport(studentId, semester);

      // Assert
      expect(result).toBeDefined();
      expect(mockStudentsService.findOne).toHaveBeenCalledWith(studentId);
      expect(mockAdjustmentsService.findByStudentId).toHaveBeenCalledWith(studentId);
    });
  });

  describe('create', () => {
    it('should create a new report successfully', async () => {
      // Arrange
      const createReportDto = {
        userId: '507f1f77bcf86cd799439011',
        role: 'ESTUDIANTE',
        type: 'StudentProgress',
        data: { test: 'data' },
      };

      const mockCreatedReport = {
        ...createReportDto,
        _id: 'report123',
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(this),
      };

      mockReportModel.constructor = jest.fn().mockReturnValue(mockCreatedReport);

      // Act
      const result = await service.create(createReportDto);

      // Assert
      expect(result).toBeDefined();
      expect(mockReportModel.constructor).toHaveBeenCalledWith(createReportDto);
      expect(mockCreatedReport.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all reports for a user and role', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const role = 'ESTUDIANTE';
      const mockReports = [
        { _id: 'report1', userId, role, type: 'Progress' },
        { _id: 'report2', userId, role, type: 'Summary' },
      ];

      const mockExec = jest.fn().mockResolvedValue(mockReports);
      mockReportModel.find = jest.fn().mockReturnValue({ exec: mockExec });

      // Act
      const result = await service.findAll(userId, role);

      // Assert
      expect(result).toEqual(mockReports);
      expect(mockReportModel.find).toHaveBeenCalledWith({ userId, role });
      expect(mockExec).toHaveBeenCalled();
    });
  });
});
