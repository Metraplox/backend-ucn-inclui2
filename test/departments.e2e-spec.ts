import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../src/users/schemas/user.schema';
import { AuthService } from '../src/auth/auth.service';
import * as bcrypt from 'bcrypt';

describe('DepartmentsController (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<UserDocument>;
  let authService: AuthService;
  let coordinatorToken: string;
  let teacherToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userModel = moduleFixture.get<Model<UserDocument>>(getModelToken(User.name));
    authService = moduleFixture.get<AuthService>(AuthService);

    // Limpiar usuarios y crear usuarios de prueba
    await userModel.deleteMany({});
    
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('password123', salt);

    const coordinator = await new userModel({
      email: 'coordinator.e2e@test.com',
      password: hashedPassword,
      nombreCompleto: 'Coordinator E2E',
      roles: [UserRole.COORDINADOR],
      isActive: true,
    }).save();

    const teacher = await new userModel({
      email: 'teacher.e2e@test.com',
      password: hashedPassword,
      nombreCompleto: 'Teacher E2E',
      roles: [UserRole.DOCENTE],
      isActive: true,
    }).save();

    // Generar tokens
    coordinatorToken = (await authService.login(coordinator)).access_token;
    teacherToken = (await authService.login(teacher)).access_token;
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await app.close();
  });

  describe('/departments (POST)', () => {
    it('debería retornar 403 Forbidden para un usuario sin el rol requerido (DOCENTE)', () => {
      return request(app.getHttpServer())
        .post('/departments')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          name: 'Departamento de Prueba',
          code: 'DP-TEST-FORBIDDEN',
          faculty: 'Facultad de Prueba',
          campus: 'Campus Prueba',
          currentSemester: '2025-1'
        })
        .expect(403);
    });

    it('debería retornar 201 Created para un usuario con el rol requerido (COORDINADOR)', async () => {
      const createDepartmentDto = {
        name: 'Departamento de Ingeniería de Sistemas',
        code: 'DIS-001',
        faculty: 'Ingeniería',
        campus: 'Antofagasta',
        currentSemester: '2025-1'
      };

      const response = await request(app.getHttpServer())
        .post('/departments')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(createDepartmentDto)
        .expect(201);
      
      expect(response.body).toBeDefined();
      expect(response.body.name).toEqual(createDepartmentDto.name);
      expect(response.body.code).toEqual(createDepartmentDto.code);
    });
  });
}); 