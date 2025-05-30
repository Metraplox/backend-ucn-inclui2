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
      const filePath = join(process.cwd(), 'GUIA-PROYECTO', 'ESTUDIANTES_NEE.txt');
      const fileContent = readFileSync(filePath, 'utf8');
      const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
      
      // Skip header line and process RUTs
      this.neeRuts = lines.slice(1).map(line => {
        const parts = line.split('\t');
        if (parts.length >= 2) {
          // Normalize RUT with DV
          return `${parts[0]}${parts[1]}`;
        }
        return null;
      }).filter(rut => rut !== null);
      
      this.logger.log(`Loaded ${this.neeRuts.length} NEE student RUTs`);
    } catch (error) {
      this.logger.error('Failed to load NEE students list', error);
      this.neeRuts = [];
    }
  }

  /**
   * Sincroniza estudiantes NEE con Hawaii
   * @param semester Semestre actual (formato YYYYPP)
   */
  async syncNeeStudents(semester: string): Promise<{ 
    success: boolean; 
    synchronized: number; 
    notFound: string[];
    errors: any[] 
  }> {
    try {
      const result: {
        success: boolean;
        synchronized: number;
        notFound: string[];
        errors: Array<{ rut: string; error: any }>;
      } = {
        success: false,
        synchronized: 0,
        notFound: [],
        errors: []
      };

      // Get all students from Hawaii
      const studentsResponse = await this.hawaiiService.getEstudiantes();
      const allStudents: HawaiiStudentDto[] = studentsResponse.data;
      
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
    } catch (error) {
      this.logger.error('Error syncing NEE students', error);
      throw error;
    }
  }

  /**
   * Sincroniza cursos e inscripciones de estudiantes NEE
   * @param semester Semestre actual (formato YYYYPP)
   */
  async syncNeeCoursesAndEnrollments(semester: string): Promise<{
    success: boolean;
    courses: number;
    enrollments: number;
    errors: any[]
  }> {
    try {
      const result: {
        success: boolean;
        courses: number;
        enrollments: number;
        errors: Array<{ nrc?: string; rut?: string; error: any }>;
      } = {
        success: false,
        courses: 0,
        enrollments: 0,
        errors: []
      };

      // Get courses from Hawaii
      const coursesResponse = await this.hawaiiService.getOferta(semester);
      const allCourses: HawaiiCourseDto[] = coursesResponse.data;
      
      // Get enrollments from Hawaii
      const enrollmentsResponse = await this.hawaiiService.getInscripcion(semester);
      const allEnrollments: HawaiiEnrollmentDto[] = enrollmentsResponse.data;
      
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
      const enrollmentsSynced = await this.syncEnrollments(neeEnrollments, semester);
      result.enrollments = enrollmentsSynced;
      
      result.success = result.errors.length === 0;
      return result;
    } catch (error) {
      this.logger.error('Error syncing NEE courses and enrollments', error);
      throw error;
    }
  }

  private async syncEnrollments(enrollments: HawaiiEnrollmentDto[], semester: string): Promise<number> {
    let count = 0;
    for (const enrollment of enrollments) {
      try {
        const studentRut = enrollment.rut;
        const nrc = enrollment.nrc;
        
        // Skip if not a NEE student
        if (!this.neeRuts.includes(studentRut)) {
          continue;
        }
        
        // Find student and course
        const student = await this.studentModel.findOne({ rut: studentRut });
        const course = await this.courseModel.findOne({ nrc, semester });
        
        if (!student || !course) {
          this.logger.warn(`Student ${studentRut} or course ${nrc} not found for enrollment`);
          continue;
        }
        
        // Create or update enrollment
        await this.enrollmentModel.findOneAndUpdate(
          { rut: studentRut, nrc, semester },
          {
            rut: studentRut,
            nrc,
            semester,
            student: student._id,
            course: course._id,
            status: 'ACTIVE', // Default status since estado is not in the DTO
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );
        
        count++;
        
        // Track processed enrollment
        this.processedEnrollments.push({
          rut: studentRut,
          nrc,
          status: 'SYNCED'
        });
        
      } catch (error) {
        this.logger.error(`Error syncing enrollment ${enrollment.rut}-${enrollment.nrc}: ${error.message}`);
        this.errors.push({
          rut: enrollment.rut,
          nrc: enrollment.nrc,
          error: error.message
        });
      }
    }
    return count;
  }

  /**
   * Ejecuta la sincronización completa de datos NEE
   * @param semester Semestre actual (formato YYYYPP)
   */
  async syncAllNeeData(semester: string): Promise<{
    success: boolean;
    students: number;
    courses: number;
    enrollments: number;
    errors: Array<{ rut?: string; nrc?: string; error: string }>;
  }> {
    try {
      this.logger.log(`Iniciando sincronización completa de datos NEE para el semestre ${semester}`);
      
      // Reset counters and errors
      this.processedStudents = [];
      this.processedCourses = [];
      this.processedEnrollments = [];
      this.errors = [];

      // 1. Sync NEE students
      this.logger.log('Sincronizando estudiantes NEE...');
      const studentsResult = await this.syncNeeStudents(semester);
      
      if (studentsResult.success) {
        this.logger.log(`Estudiantes NEE sincronizados: ${studentsResult.synchronized}`);
      } else {
        this.logger.warn(`Advertencia: Hubo problemas al sincronizar estudiantes NEE`);
      }

      // 2. Sync NEE courses and enrollments
      this.logger.log('Sincronizando cursos y matrículas NEE...');
      const { success, courses, enrollments, errors } = await this.syncNeeCoursesAndEnrollments(semester);
      this.logger.log(`Cursos sincronizados: ${courses}, Matrículas sincronizadas: ${enrollments}`);

      // 3. Log any errors that occurred
      if (errors.length > 0) {
        this.logger.warn(`Se encontraron ${errors.length} errores durante la sincronización`);
      }

      const overallSuccess = studentsResult.success && success && this.errors.length === 0;
      
      if (overallSuccess) {
        this.logger.log('Sincronización completada exitosamente');
      } else {
        this.logger.warn('Sincronización completada con advertencias');
      }

      return {
        success: overallSuccess,
        students: studentsResult.synchronized,
        courses,
        enrollments,
        errors: this.errors,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error en syncAllNeeData: ${errorMessage}`, error instanceof Error ? error.stack : '');
      
      // Add the error to the errors array
      this.errors.push({
        error: `Error en sincronización completa: ${errorMessage}`
      });
      
      return {
        success: false,
        students: 0,
        courses: 0,
        enrollments: 0,
        errors: this.errors,
      };
    }
  }
}
