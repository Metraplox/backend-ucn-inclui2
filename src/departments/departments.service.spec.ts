import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DepartmentsService } from './departments.service';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { User } from '../users/schemas/user.schema';
import { NotFoundException } from '@nestjs/common';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let departmentModel: Model<DepartmentDocument>;
  let userModel: Model<User>;

  const mockDepartment = {
    _id: new Types.ObjectId(),
    name: 'Ingeniería',
    code: 'ING',
    headId: new Types.ObjectId(),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    _id: new Types.ObjectId(),
    email: 'teacher@example.com',
    nombreCompleto: 'Teacher Name',
    roles: ['teacher'],
    isActive: true,
  };

  const mockDepartmentModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  const mockUserModel = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        {
          provide: getModelToken(Department.name),
          useValue: mockDepartmentModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
    departmentModel = module.get<Model<DepartmentDocument>>(
      getModelToken(Department.name),
    );
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
