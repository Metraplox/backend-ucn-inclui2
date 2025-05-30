import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DepartmentHeadGuard } from '../../../src/auth/guards/department-head.guard';
import { Role } from '../../../src/users/enums/role.enum';

describe('DepartmentHeadGuard', () => {
  let guard: DepartmentHeadGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        user: null,
      }),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentHeadGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<DepartmentHeadGuard>(DepartmentHeadGuard);
    reflector = module.get<Reflector>(Reflector);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(guard).toBeDefined();
  });

  it('debería denegar acceso si no hay usuario autenticado', async () => {
    const context = {
      ...mockContext,
      switchToHttp: () => ({
        getRequest: () => ({
          user: null,
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(false);
  });

  it('debería permitir acceso a administradores', async () => {
    const context = {
      ...mockContext,
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            userId: 'admin1',
            roles: [Role.ADMIN],
          },
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('debería permitir acceso a jefes de departamento con departamento asignado', async () => {
    const context = {
      ...mockContext,
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            userId: 'deptHead1',
            roles: [Role.DEPARTMENT_HEAD],
            departmentId: 'dept1',
          },
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('debería denegar acceso a jefes de departamento sin departamento asignado', async () => {
    const context = {
      ...mockContext,
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            userId: 'deptHead1',
            roles: [Role.DEPARTMENT_HEAD],
            // Sin departmentId
          },
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(false);
  });

  it('debería denegar acceso a usuarios sin roles', async () => {
    const context = {
      ...mockContext,
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            userId: 'user1',
            // Sin roles
          },
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(false);
  });
});
