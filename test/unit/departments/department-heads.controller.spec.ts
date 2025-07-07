import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentHeadsController } from '../../../src/departments/controllers/department-heads.controller';
import { DepartmentStatsService } from '../../../src/departments/services/department-stats.service';
import { Department } from '../../../src/departments/schemas/department.schema';
import { DepartmentStatsResponseDto } from '../../../src/departments/dto/department-stats-response.dto';
import { DepartmentStudentsNeeResponseDto } from '../../../src/departments/dto/department-student-nee-response.dto';
import { DepartmentTeachersResponseDto } from '../../../src/departments/dto/department-teachers-response.dto';
import { Types } from 'mongoose';

describe('DepartmentHeadsController', () => {
  let controller: DepartmentHeadsController;
  let departmentStatsService: jest.Mocked<DepartmentStatsService>;

  const mockDepartment: Partial<Department> = {
    _id: 'dept1',
    name: 'Departamento de Ingeniería',
    currentSemester: '2023-1',
    headId: new Types.ObjectId('507f1f77bcf86cd799439011'),
    code: 'ING01',
    faculty: 'Ingeniería',
    campus: 'Antofagasta',
  };

  const mockStatsResponse: DepartmentStatsResponseDto = {
    totalTeachers: 15,
    totalStudentsWithNEE: 10,
    totalAdjustments: 25,
    implementedAdjustments: 20,
    pendingAdjustments: 5,
    totalCourses: 30,
    implementationRate: 80,
    generatedAt: new Date(),
    semester: '2023-1',
  };

  const mockStudentsNeeResponse: DepartmentStudentsNeeResponseDto = {
    departmentId: 'dept1',
    departmentName: 'Departamento de Ingeniería',
    totalStudents: 10,
    students: [
      {
        _id: new Types.ObjectId(),
        fullName: 'Estudiante Ejemplo',
        rut: '12345678-9',
        email: 'estudiante@alumnos.ucn.cl',
        career: 'Ingeniería Civil Informática',
        adjustmentsCount: 3,
        implementedAdjustments: 2,
        implementationRate: 66.7,
        semester: '2023-1',
      },
    ],
    generatedAt: new Date(),
    semester: '2023-1',
  };

  const mockTeachersResponse: DepartmentTeachersResponseDto = {
    departmentId: 'dept1',
    departmentName: 'Departamento de Ingeniería',
    totalTeachers: 15,
    teachers: [
      {
        _id: 'teacher1',
        fullName: 'Profesor Ejemplo',
        email: 'profesor@ucn.cl',
        coursesCount: 3,
        studentsWithNeeCount: 5,
        adjustmentsCount: 8,
        implementedAdjustments: 6,
        implementationRate: 75,
      },
    ],
    generatedAt: new Date(),
    semester: '2023-1',
  };

  beforeEach(async () => {
    const mockDepartmentStatsService = {
      getDepartmentByHead: jest.fn(),
      getDepartmentStats: jest.fn(),
      getDepartmentStudentsWithNEE: jest.fn(),
      getTeachersByDepartment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentHeadsController],
      providers: [
        {
          provide: DepartmentStatsService,
          useValue: mockDepartmentStatsService,
        },
      ],
    }).compile();

    controller = module.get<DepartmentHeadsController>(
      DepartmentHeadsController,
    );
    departmentStatsService = module.get(DepartmentStatsService);

    // Configurar mocks por defecto
    departmentStatsService.getDepartmentByHead.mockResolvedValue(
      mockDepartment as Department,
    );
    departmentStatsService.getDepartmentStats.mockResolvedValue(
      mockStatsResponse,
    );
    departmentStatsService.getDepartmentStudentsWithNEE.mockResolvedValue(
      mockStudentsNeeResponse,
    );
    departmentStatsService.getTeachersByDepartment.mockResolvedValue(
      mockTeachersResponse,
    );
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyDepartment', () => {
    it('debería retornar el departamento del jefe actual', async () => {
      const req = { user: { userId: 'user1' } };
      const result = await controller.getMyDepartment(req as any);
      expect(result).toEqual(mockDepartment);
      expect(departmentStatsService.getDepartmentByHead).toHaveBeenCalledWith(
        'user1',
      );
    });

    it('debería lanzar NotFoundException si no se encuentra el departamento', async () => {
      departmentStatsService.getDepartmentByHead.mockResolvedValueOnce(null);
      const req = { user: { userId: 'user1' } };

      await expect(controller.getMyDepartment(req as any)).rejects.toThrow(
        'No se encontró el departamento para el jefe especificado',
      );
    });
  });

  describe('getDepartmentStatistics', () => {
    it('debería retornar estadísticas del departamento', async () => {
      const req = { user: { userId: 'user1' } };
      const result = await controller.getDepartmentStatistics(
        req as any,
        '2023-1',
      );

      expect(result).toEqual(mockStatsResponse);
      expect(departmentStatsService.getDepartmentStats).toHaveBeenCalledWith(
        'dept1',
        '2023-1',
      );
    });

    it('debería usar el semestre actual si no se especifica', async () => {
      const req = { user: { userId: 'user1' } };
      await controller.getDepartmentStatistics(req as any, undefined);

      expect(departmentStatsService.getDepartmentStats).toHaveBeenCalledWith(
        'dept1',
        '2023-1',
      );
    });
  });

  describe('getDepartmentStudentsWithNEE', () => {
    it('debería retornar estudiantes con NEE del departamento', async () => {
      const req = { user: { userId: 'user1' } };
      const result = await controller.getDepartmentStudentsWithNEE(
        req as any,
        '2023-1',
      );

      expect(result).toEqual(mockStudentsNeeResponse);
      expect(
        departmentStatsService.getDepartmentStudentsWithNEE,
      ).toHaveBeenCalledWith('dept1', '2023-1');
    });
  });

  describe('getDepartmentTeachers', () => {
    it('debería retornar docentes del departamento', async () => {
      const req = { user: { userId: 'user1' } };
      const result = await controller.getDepartmentTeachers(
        req as any,
        '2023-1',
      );

      expect(result).toEqual(mockTeachersResponse);
      expect(
        departmentStatsService.getTeachersByDepartment,
      ).toHaveBeenCalledWith('dept1', '2023-1');
    });
  });

  describe('getDepartmentStatsById', () => {
    it('debería retornar estadísticas de un departamento específico', async () => {
      const result = await controller.getDepartmentStatsById('dept1', '2023-1');

      expect(result).toEqual(mockStatsResponse);
      expect(departmentStatsService.getDepartmentStats).toHaveBeenCalledWith(
        'dept1',
        '2023-1',
      );
    });

    it('debería validar el formato del semestre', async () => {
      await expect(
        controller.getDepartmentStatsById('dept1', 'formato-invalido'),
      ).rejects.toThrow('El formato del semestre debe ser YYYY-S (ej: 2023-1)');
    });
  });
});
