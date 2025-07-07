import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types, connect, connection } from 'mongoose';
import { Student } from '../src/students/schemas/student.schema';
import { Career } from '../src/careers/schemas/career.schema';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../src/users/schemas/user.schema';

describe('Estudiantes-Carreras Integration (e2e)', () => {
  let app: INestApplication;
  let studentModel: Model<Student>;
  let careerModel: Model<Career>;
  let jwtService: JwtService;
  let adminToken: string;
  let testCareer;

  beforeAll(async () => {
    // Crear una aplicación de prueba
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Obtener los modelos y servicios necesarios
    studentModel = app.get<Model<Student>>(getModelToken(Student.name));
    careerModel = app.get<Model<Career>>(getModelToken(Career.name));
    jwtService = app.get<JwtService>(JwtService);

    // Crear un token JWT para un usuario administrador
    adminToken = jwtService.sign({
      email: 'admin.test@ucn.cl',
      sub: new Types.ObjectId().toString(),
      roles: [UserRole.COORDINADOR],
    });

    // Crear una carrera de prueba
    testCareer = await careerModel.create({
      name: 'Carrera de Prueba E2E',
      code: 'CPE',
      departmentId: new Types.ObjectId(),
      faculty: 'Facultad de Prueba',
      campus: 'Campus Prueba',
      duration: 10,
      studentIds: [],
      isActive: true,
      currentSemester: '2025-1',
    });
  });

  afterAll(async () => {
    // Limpiar la base de datos después de las pruebas
    await studentModel.deleteMany({});
    await careerModel.deleteMany({});

    // Cerrar la aplicación y las conexiones
    await app.close();
  });

  describe('Creación de estudiantes y asociación con carreras', () => {
    it('debería crear un estudiante y asociarlo a una carrera', async () => {
      // Datos para el nuevo estudiante
      const newStudent = {
        rut: '19876543-2',
        nombres: 'Estudiante',
        apellidos: 'Prueba E2E',
        email: 'estudiante.prueba.e2e@alumnos.ucn.cl',
        carreraId: testCareer._id.toString(),
        semestre: '2025-1',
      };

      // Crear el estudiante a través de la API
      const response = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newStudent)
        .expect(201);

      // Verificar la respuesta
      expect(response.body).toHaveProperty('_id');
      expect(response.body.rut).toBe(newStudent.rut);

      // Verificar que el estudiante se haya asociado a la carrera
      const updatedCareer = await careerModel.findById(testCareer._id);
      expect(updatedCareer).toBeTruthy();
      expect(updatedCareer!.studentIds).toContainEqual(
        new Types.ObjectId(response.body._id),
      );
    });

    it('debería obtener estudiantes filtrados por semestre', async () => {
      // Obtener estudiantes del semestre 2025-1
      const response = await request(app.getHttpServer())
        .get('/students?semestre=2025-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verificar que todos los estudiantes devueltos sean del semestre correcto
      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((student) => {
        expect(student.semestre).toBe('2025-1');
      });
    });

    it('debería obtener los estudiantes de una carrera', async () => {
      // Obtener los estudiantes de la carrera de prueba
      const response = await request(app.getHttpServer())
        .get(`/careers/${testCareer._id}/students`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verificar que se devuelvan los estudiantes asociados a la carrera
      expect(response.body.length).toBeGreaterThan(0);

      // Verificar que cada estudiante tenga el ID esperado
      const studentIds = testCareer.studentIds.map((id) => id.toString());
      response.body.forEach((student) => {
        expect(studentIds).toContain(student._id);
      });
    });
  });
});
