import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserResponsibilitiesService } from './user-responsibilities.service';
import { User, UserDocument } from '../schemas/user.schema';
import { NotFoundException } from '@nestjs/common';

describe('UserResponsibilitiesService', () => {
  let service: UserResponsibilitiesService;
  let userModel: Model<UserDocument>;

  const mockUserBase = {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    nombreCompleto: 'Test User',
    roles: ['teacher'],
    additionalResponsibilities: {
      isDepartmentHead: false,
      isCareerHead: false,
      isDIDDECStaff: false,
      departmentIds: [],
      careerIds: [],
    },
  };

  const mockUserModel = {
    findById: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResponsibilitiesService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserResponsibilitiesService>(
      UserResponsibilitiesService,
    );
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignDepartmentHead', () => {
    it('should assign department head role successfully', async () => {
      const userId = mockUserBase._id.toString();
      const departmentIds = ['dept1', 'dept2'];
      const mockUser = {
        ...mockUserBase,
        save: jest.fn(),
      };
      const updatedUser = {
        ...mockUserBase,
        additionalResponsibilities: {
          ...mockUserBase.additionalResponsibilities,
          isDepartmentHead: true,
          departmentIds: departmentIds.map((id) => new Types.ObjectId(id)),
        },
      };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUser.save.mockResolvedValue(updatedUser);

      const result = await service.assignDepartmentHead(userId, departmentIds);

      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = new Types.ObjectId().toString();
      mockUserModel.findById.mockResolvedValue(null);

      await expect(
        service.assignDepartmentHead(userId, ['dept1']),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignCareerHead', () => {
    it('should assign career head role successfully', async () => {
      const userId = mockUserBase._id.toString();
      const careerIds = ['career1', 'career2'];
      const mockUser = {
        ...mockUserBase,
        save: jest.fn(),
      };
      const updatedUser = {
        ...mockUserBase,
        additionalResponsibilities: {
          ...mockUserBase.additionalResponsibilities,
          isCareerHead: true,
          careerIds: careerIds.map((id) => new Types.ObjectId(id)),
        },
      };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUser.save.mockResolvedValue(updatedUser);

      const result = await service.assignCareerHead(userId, careerIds);

      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('assignDIDDECStaff', () => {
    it('should assign DIDDEC staff role successfully', async () => {
      const userId = mockUserBase._id.toString();
      const mockUser = {
        ...mockUserBase,
        save: jest.fn(),
      };
      const updatedUser = {
        ...mockUserBase,
        additionalResponsibilities: {
          ...mockUserBase.additionalResponsibilities,
          isDIDDECStaff: true,
        },
      };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUser.save.mockResolvedValue(updatedUser);

      const result = await service.assignDIDDECStaff(userId);

      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('removeResponsibility', () => {
    it('should remove department responsibilities', async () => {
      const userId = mockUserBase._id.toString();
      const userWithResponsibilities = {
        ...mockUserBase,
        additionalResponsibilities: {
          isDepartmentHead: true,
          isCareerHead: false,
          isDIDDECStaff: false,
          departmentIds: [new Types.ObjectId()],
          careerIds: [],
        },
        save: jest.fn(),
      };

      const clearedUser = {
        ...mockUserBase,
        additionalResponsibilities: {
          isDepartmentHead: false,
          isCareerHead: false,
          isDIDDECStaff: false,
          departmentIds: [],
          careerIds: [],
        },
      };

      mockUserModel.findById.mockResolvedValue(userWithResponsibilities);
      userWithResponsibilities.save.mockResolvedValue(clearedUser);

      const result = await service.removeResponsibility(userId, 'department');

      expect(result).toEqual(clearedUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(userWithResponsibilities.save).toHaveBeenCalled();
    });

    it('should remove all additional responsibilities from a user', async () => {
      const userId = '60d21b4967d0d8992e610c85';
      const mockUser = {
        ...mockUserBase,
        additionalResponsibilities: {
          isDepartmentHead: true,
          isCareerHead: true,
          isDIDDECStaff: true,
          departmentIds: ['dept1'],
          careerIds: ['career1'],
        },
        save: jest.fn(),
      };

      userModel.findById = jest.fn().mockResolvedValue(mockUser);

      const result = await service.removeResponsibility(userId, 'department');

      expect(result).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('getUserResponsibilities', () => {
    it('should return user responsibilities', async () => {
      const userId = mockUserBase._id.toString();
      const query = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUserBase),
      };

      mockUserModel.findById.mockReturnValue(query);

      const result = await service.getUserResponsibilities(userId);

      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('additionalResponsibilities');
      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('addDepartmentToHead', () => {
    it('should add multiple departments to user', async () => {
      const userId = '60d21b4967d0d8992e610c85';
      const departmentIds = ['dept1', 'dept2'];
      const mockUser = {
        ...mockUserBase,
        additionalResponsibilities: {
          isDepartmentHead: true,
          isCareerHead: false,
          isDIDDECStaff: false,
          departmentIds: [],
          careerIds: [],
        },
        save: jest.fn(),
      };

      userModel.findById = jest.fn().mockResolvedValue(mockUser);

      for (const deptId of departmentIds) {
        await service.addDepartmentToHead(userId, deptId);
      }

      expect(mockUser.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('removeDepartmentFromHead', () => {
    it('should remove multiple departments from user', async () => {
      const userId = '60d21b4967d0d8992e610c85';
      const departmentIds = ['dept1', 'dept2'];
      const mockUser = {
        ...mockUserBase,
        additionalResponsibilities: {
          isDepartmentHead: true,
          isCareerHead: false,
          isDIDDECStaff: false,
          departmentIds: ['dept1', 'dept2', 'dept3'],
          careerIds: [],
        },
        save: jest.fn(),
      };

      userModel.findById = jest.fn().mockResolvedValue(mockUser);

      for (const deptId of departmentIds) {
        await service.removeDepartmentFromHead(userId, deptId);
      }

      expect(mockUser.save).toHaveBeenCalledTimes(2);
    });
  });
});
