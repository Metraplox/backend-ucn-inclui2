import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Student } from '../students/schemas/student.schema';
import { Course } from '../courses/schemas/course.schema';
import { Enrollment } from '../enrollments/schemas/enrollment.schema';
import { 
  HawaiiService, 
  HawaiiStudentDto, 
  HawaiiCourseDto, 
  HawaiiEnrollmentDto 
} from './';
import { HawaiiCacheService } from './hawaii-cache.service';

@Injectable()
export class HawaiiSyncService {
  private readonly logger = new Logger(HawaiiSyncService.name);
  private neeRuts: string[] = [];
  private processedStudents: Array<{ rut: string; [key: string]: any }> = [];
  private processedCourses: Array<{ nrc: string; [key: string]: any }> = [];
  private processedEnrollments: Array<{ rut: string; nrc: string; [key: string]: any }> = [];
  private errors: Array<{ rut?: string; nrc?: string; error: any }> = [];

  constructor(
    private readonly hawaiiService: HawaiiService,
    private readonly hawaiiCacheService: HawaiiCacheService,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>,
    private httpService: HttpService
  ) {
    this.loadNeeStudentsList();
  }

  /**
   * Carga la lista de estudiantes NEE desde el archivo
   */
  private loadNeeStudentsList(): void {
    try {
      // Cambiado para leer el archivo correcto solicitado por el usuario
      const neeFilePath = join(process.cwd(), 'docs', 'assets', 'ESTUDIANTES_NEE_CSV.txt');
      const content = readFileSync(neeFilePath, 'utf-8');
      this.neeRuts = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          const parts = line.split(',');
          return parts[0] ? parts[0].trim() : '';
        })
        .filter(rut => rut.length > 0);
      this.logger.log(`📋 Lista NEE cargada: ${this.neeRuts.length} estudiantes`);
    } catch (error) {
      this.logger.error('❌ Error cargando lista de estudiantes NEE:', error);
      this.neeRuts = [];
    }
  }

  /**
   * Sincroniza estudiantes NEE con Hawaii usando caché inteligente
   * @param semester Semestre actual (formato YYYYPP)
   */
  async syncNeeStudents(semester: string): Promise<{ 
    success: boolean; 
    synchronized: number; 
    notFound: string[];
    errors: any[];
    cacheUsed: boolean;
  }> {
    try {
      this.logger.log(`🔄 Sincronizando estudiantes NEE para semestre ${semester}...`);
      
      const result: {
        success: boolean;
        synchronized: number;
        notFound: string[];
        errors: Array<{ rut: string; error: any }>;
        cacheUsed: boolean;
      } = {
        success: false,
        synchronized: 0,
        notFound: [],
        errors: [],
        cacheUsed: false
      };

      // ✅ Usar caché inteligente en lugar de llamada directa
      const allStudents: HawaiiStudentDto[] = await this.hawaiiCacheService.getEstudiantesWithCache();
      result.cacheUsed = true; // El servicio de caché maneja esto internamente
      
      // Filter only NEE students
      const neeStudents = allStudents.filter(student => 
        this.neeRuts.includes(student.rut));
      
      // Track not found students
      const foundRuts = neeStudents.map(student => student.rut);
      result.notFound = this.neeRuts.filter(rut => !foundRuts.includes(rut));
      
      this.logger.log(`📊 Estudiantes encontrados: ${neeStudents.length}/${this.neeRuts.length} NEE`);
      
      // Sync each NEE student
      for (const student of neeStudents) {
        try {
          await this.studentModel.findOneAndUpdate(
            { rut: student.rut },
            {
              rut: student.rut,
              firstName: student.nombres,
              lastName: student.apellidos,
              email: student.email_ucn,
              fullName: `${student.nombres} ${student.apellidos}`.trim(),
              semester: semester,
              hasNee: true,
              updatedAt: new Date(),
            },
            { upsert: true, new: true }
          );
          
          result.synchronized++;
        } catch (error) {
          result.errors.push({
            rut: student.rut,
            error: error.message
          });
        }
      }
      
      result.success = result.errors.length === 0;
      
      this.logger.log(`✅ Sincronización estudiantes completada: ${result.synchronized} exitosos, ${result.errors.length} errores`);
      
      return result;
    } catch (error) {
      this.logger.error('❌ Error syncing NEE students', error);
      throw error;
    }
  }

  /**
   * Sincroniza cursos e inscripciones de estudiantes NEE usando caché inteligente
   * @param semester Semestre actual (formato YYYYPP)
   */
  async syncNeeCoursesAndEnrollments(semester: string): Promise<{
    success: boolean;
    courses: number;
    enrollments: number;
    errors: any[];
    cacheUsed: boolean;
  }> {
    try {
      this.logger.log(`🔄 Sincronizando cursos e inscripciones NEE para semestre ${semester}...`);
      
      const result: {
        success: boolean;
        courses: number;
        enrollments: number;
        errors: Array<{ nrc?: string; rut?: string; error: any }>;
        cacheUsed: boolean;
      } = {
        success: false,
        courses: 0,
        enrollments: 0,
        errors: [],
        cacheUsed: true
      };

      // ✅ Usar caché inteligente para obtener datos en paralelo
      const [allCourses, allEnrollments] = await Promise.all([
        this.hawaiiCacheService.getOfertaWithCache(semester),
        this.hawaiiCacheService.getInscripcionWithCache(semester)
      ]);
      
      // Filter enrollments for NEE students only
      const neeEnrollments = allEnrollments.filter(enrollment => 
        this.neeRuts.includes(enrollment.rut));
      
      // Get the list of courses that NEE students are enrolled in
      const neeCourseNRCs = new Set(neeEnrollments.map(e => e.nrc));
      const neeCourses = allCourses.filter(course => neeCourseNRCs.has(course.nrc));
      
      this.logger.log(`📊 Datos a sincronizar: ${neeCourses.length} cursos, ${neeEnrollments.length} matrículas NEE`);
      
      // Sync courses
      for (const course of neeCourses) {
        try {
          await this.courseModel.findOneAndUpdate(
            { nrc: course.nrc, semester: semester },
            {
              nrc: course.nrc,
              code: course.codigo,
              name: course.asignatura,
              parallel: course.paralelo,
              department: course.departamento,
              campus: course.sede,
              semester: semester,
              teacherRut: course.getProfesorRut() || '',
              teacherName: course.getProfesorNombre() || '',
              updatedAt: new Date(),
            },
            { upsert: true, new: true }
          );
          
          result.courses++;
        } catch (error) {
          result.errors.push({
            nrc: course.nrc,
            error: error.message
          });
        }
      }
      
      // Sync enrollments
      const enrollmentsSynced = await this.syncEnrollments(neeEnrollments, semester);
      result.enrollments = enrollmentsSynced;
      
      result.success = result.errors.length === 0;
      
      this.logger.log(`✅ Sincronización cursos/matrículas completada: ${result.courses} cursos, ${result.enrollments} matrículas`);
      
      return result;
    } catch (error) {
      this.logger.error('❌ Error syncing NEE courses and enrollments', error);
      throw error;
    }
  }

  /**
   * Sincroniza matrículas individuales
   */
  private async syncEnrollments(enrollments: HawaiiEnrollmentDto[], semester: string): Promise<number> {
    let synced = 0;
    
    for (const enrollment of enrollments) {
      try {
        await this.enrollmentModel.findOneAndUpdate(
          { 
            studentRut: enrollment.rut, 
            nrc: enrollment.nrc,
            semester: semester 
          },
          {
            studentRut: enrollment.rut,
            nrc: enrollment.nrc,
            semester: semester,
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );
        
        synced++;
      } catch (error) {
        this.errors.push({
          rut: enrollment.rut,
          nrc: enrollment.nrc,
          error: error.message
        });
      }
    }
    
    return synced;
  }

  /**
   * Ejecuta la sincronización completa de datos NEE usando pre-carga optimizada
   * @param semester Semestre actual (formato YYYYPP)
   */
  async syncAllNeeData(semester: string): Promise<{
    success: boolean;
    students: number;
    courses: number;
    enrollments: number;
    errors: Array<{ rut?: string; nrc?: string; error: string }>;
    cacheStats: {
      totalApiCalls: number;
      cachingEnabled: boolean;
      preloadUsed: boolean;
    };
  }> {
    try {
      this.logger.log(`🚀 Iniciando sincronización completa optimizada de datos NEE para semestre ${semester}`);
      
      const startTime = Date.now();
      
      // Reset counters and errors
      this.processedStudents = [];
      this.processedCourses = [];
      this.processedEnrollments = [];
      this.errors = [];

      // ✅ Pre-cargar todos los datos en una sola operación optimizada
      this.logger.log('📦 Pre-cargando datos Hawaii con caché inteligente...');
      const preloadData = await this.hawaiiCacheService.preloadSemesterData(semester);
      
      this.logger.log(`📊 Pre-carga completada: ${preloadData.cacheStats.totalApiCalls}/3 llamadas API realizadas`);

      // 1. Sync NEE students usando datos pre-cargados
      this.logger.log('👥 Sincronizando estudiantes NEE...');
      const studentsResult = await this.syncNeeStudentsFromPreload(preloadData.students, semester);
      
      // 2. Sync NEE courses and enrollments usando datos pre-cargados
      this.logger.log('📚 Sincronizando cursos y matrículas NEE...');
      const coursesResult = await this.syncNeeCoursesFromPreload(
        preloadData.courses,
        preloadData.enrollments,
        semester
      );

      const duration = Date.now() - startTime;
      const overallSuccess = studentsResult.success && coursesResult.success && this.errors.length === 0;
      
      this.logger.log(`🎉 Sincronización completa finalizada en ${duration}ms:`);
      this.logger.log(`   👥 Estudiantes: ${studentsResult.synchronized}`);
      this.logger.log(`   📚 Cursos: ${coursesResult.courses}`);
      this.logger.log(`   📝 Matrículas: ${coursesResult.enrollments}`);
      this.logger.log(`   🌐 Llamadas API: ${preloadData.cacheStats.totalApiCalls}/3`);
      this.logger.log(`   ⚡ Velocidad: ${overallSuccess ? 'EXCELENTE' : 'CON ADVERTENCIAS'}`);

      return {
        success: overallSuccess,
        students: studentsResult.synchronized,
        courses: coursesResult.courses,
        enrollments: coursesResult.enrollments,
        errors: this.errors,
        cacheStats: {
          totalApiCalls: preloadData.cacheStats.totalApiCalls,
          cachingEnabled: true,
          preloadUsed: true
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Error en syncAllNeeData optimizado: ${errorMessage}`, error instanceof Error ? error.stack : '');
      
      this.errors.push({
        error: `Error en sincronización completa optimizada: ${errorMessage}`
      });
      
      return {
        success: false,
        students: 0,
        courses: 0,
        enrollments: 0,
        errors: this.errors,
        cacheStats: {
          totalApiCalls: 0,
          cachingEnabled: true,
          preloadUsed: false
        }
      };
    }
  }

  /**
   * Sincroniza estudiantes NEE desde datos pre-cargados
   */
  private async syncNeeStudentsFromPreload(allStudents: HawaiiStudentDto[], semester: string): Promise<{
    success: boolean;
    synchronized: number;
    notFound: string[];
    errors: any[];
  }> {
    const result = {
      success: false,
      synchronized: 0,
      notFound: [] as string[],
      errors: [] as any[]
    };

    // Filter only NEE students
    const neeStudents = allStudents.filter(student => 
      this.neeRuts.includes(student.rut));
    
    // Track not found students
    const foundRuts = neeStudents.map(student => student.rut);
    result.notFound = this.neeRuts.filter(rut => !foundRuts.includes(rut));
    
    // Sync each NEE student
    for (const student of neeStudents) {
      try {
        await this.studentModel.findOneAndUpdate(
          { rut: student.rut },
          {
            rut: student.rut,
            firstName: student.nombres,
            lastName: student.apellidos,
            email: student.email_ucn,
            fullName: `${student.nombres} ${student.apellidos}`.trim(),
            semester: semester,
            hasNee: true,
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );
        
        result.synchronized++;
      } catch (error) {
        result.errors.push({
          rut: student.rut,
          error: error.message
        });
      }
    }
    
    result.success = result.errors.length === 0;
    return result;
  }

  /**
   * Sincroniza cursos e inscripciones NEE desde datos pre-cargados
   */
  private async syncNeeCoursesFromPreload(
    allCourses: HawaiiCourseDto[],
    allEnrollments: HawaiiEnrollmentDto[],
    semester: string
  ): Promise<{
    success: boolean;
    courses: number;
    enrollments: number;
    errors: any[];
  }> {
    const result = {
      success: false,
      courses: 0,
      enrollments: 0,
      errors: [] as any[]
    };

    // Filter enrollments for NEE students only
    const neeEnrollments = allEnrollments.filter(enrollment => 
      this.neeRuts.includes(enrollment.rut));
    
    // Get the list of courses that NEE students are enrolled in
    const neeCourseNRCs = new Set(neeEnrollments.map(e => e.nrc));
    const neeCourses = allCourses.filter(course => neeCourseNRCs.has(course.nrc));
    
    // Sync courses
    for (const course of neeCourses) {
      try {
        await this.courseModel.findOneAndUpdate(
          { nrc: course.nrc, semester: semester },
          {
            nrc: course.nrc,
            code: course.codigo,
            name: course.asignatura,
            parallel: course.paralelo,
            department: course.departamento,
            campus: course.sede,
            semester: semester,
            teacherRut: course.getProfesorRut() || '',
            teacherName: course.getProfesorNombre() || '',
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );
        
        result.courses++;
      } catch (error) {
        result.errors.push({
          nrc: course.nrc,
          error: error.message
        });
      }
    }
    
    // Sync enrollments
    result.enrollments = await this.syncEnrollments(neeEnrollments, semester);
    
    result.success = result.errors.length === 0;
    return result;
  }

  /**
   * Ejecuta la sincronización completa de TODOS los datos de la universidad usando pre-carga optimizada
   * @param semester Semestre actual (formato YYYYPP)
   */
  async syncFullUniversityData(semester: string): Promise<{
    success: boolean;
    students: number;
    courses: number;
    enrollments: number;
    errors: Array<{ rut?: string; nrc?: string; error: string }>;
    cacheStats: {
      totalApiCalls: number;
      cachingEnabled: boolean;
      preloadUsed: boolean;
    };
  }> {
    try {
      this.logger.log(`🚀 Iniciando sincronización COMPLETA de la universidad para semestre ${semester}`);
      const startTime = Date.now();
      this.errors = [];

      this.logger.log('📦 Pre-cargando todos los datos de Hawaii...');
      const preloadData = await this.hawaiiCacheService.preloadSemesterData(semester);
      this.logger.log(`📊 Pre-carga completada: ${preloadData.cacheStats.totalApiCalls}/3 llamadas API realizadas`);

      this.logger.log('👥 Sincronizando TODOS los estudiantes...');
      const studentsResult = await this.syncAllStudentsFromPreload(preloadData.students, semester);

      this.logger.log('📚 Sincronizando TODOS los cursos y matrículas...');
      const coursesResult = await this.syncAllCoursesAndEnrollmentsFromPreload(
        preloadData.courses,
        preloadData.enrollments,
        semester,
      );

      const duration = Date.now() - startTime;
      const overallSuccess = studentsResult.success && coursesResult.success && this.errors.length === 0;

      this.logger.log(`🎉 Sincronización COMPLETA finalizada en ${duration}ms:`);
      this.logger.log(`   👥 Estudiantes: ${studentsResult.synchronized}`);
      this.logger.log(`   📚 Cursos: ${coursesResult.courses}`);
      this.logger.log(`   📝 Matrículas: ${coursesResult.enrollments}`);
      this.logger.log(`   🌐 Llamadas API: ${preloadData.cacheStats.totalApiCalls}/3`);

      return {
        success: overallSuccess,
        students: studentsResult.synchronized,
        courses: coursesResult.courses,
        enrollments: coursesResult.enrollments,
        errors: this.errors,
        cacheStats: {
          totalApiCalls: preloadData.cacheStats.totalApiCalls,
          cachingEnabled: true,
          preloadUsed: true,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Error en syncFullUniversityData: ${errorMessage}`, error instanceof Error ? error.stack : '');
      this.errors.push({ error: `Error en sincronización completa: ${errorMessage}` });
      return {
        success: false,
        students: 0,
        courses: 0,
        enrollments: 0,
        errors: this.errors,
        cacheStats: { totalApiCalls: 0, cachingEnabled: true, preloadUsed: false },
      };
    }
  }

  /**
   * Sincroniza TODOS los estudiantes desde datos pre-cargados, marcando los NEE.
   */
  private async syncAllStudentsFromPreload(allStudents: HawaiiStudentDto[], semester: string): Promise<{
    success: boolean;
    synchronized: number;
    errors: any[];
  }> {
    const result = { success: false, synchronized: 0, errors: [] as any[] };

    for (const student of allStudents) {
      try {
        await this.studentModel.findOneAndUpdate(
          { rut: student.rut },
          {
            rut: student.rut,
            firstName: student.nombres,
            lastName: student.apellidos,
            email: student.email_ucn,
            fullName: `${student.nombres} ${student.apellidos}`.trim(),
            semester: semester,
            // Marcamos si el estudiante tiene NEE basado en la lista cargada
            hasNee: this.neeRuts.includes(student.rut),
            updatedAt: new Date(),
          },
          { upsert: true, new: true },
        );
        result.synchronized++;
      } catch (error) {
        result.errors.push({ rut: student.rut, error: error.message });
      }
    }

    result.success = result.errors.length === 0;
    return result;
  }

  /**
   * Sincroniza TODOS los cursos e inscripciones desde datos pre-cargados.
   */
  private async syncAllCoursesAndEnrollmentsFromPreload(
    allCourses: HawaiiCourseDto[],
    allEnrollments: HawaiiEnrollmentDto[],
    semester: string,
  ): Promise<{
    success: boolean;
    courses: number;
    enrollments: number;
    errors: any[];
  }> {
    const result = { success: false, courses: 0, enrollments: 0, errors: [] as any[] };

    // Sincronizar todos los cursos
    for (const course of allCourses) {
      try {
        await this.courseModel.findOneAndUpdate(
          { nrc: course.nrc, semester: semester },
          {
            nrc: course.nrc,
            code: course.codigo,
            name: course.asignatura,
            parallel: course.paralelo,
            department: course.departamento,
            campus: course.sede,
            semester: semester,
            teacherRut: course.getProfesorRut() || '',
            teacherName: course.getProfesorNombre() || '',
            updatedAt: new Date(),
          },
          { upsert: true, new: true },
        );
        result.courses++;
      } catch (error) {
        result.errors.push({ nrc: course.nrc, error: error.message });
      }
    }

    // Sincronizar todas las inscripciones
    result.enrollments = await this.syncEnrollments(allEnrollments, semester);

    result.success = result.errors.length === 0;
    return result;
  }
}
