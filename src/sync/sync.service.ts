import { Injectable, Logger, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';

import { UcnStudentDto } from './dto/ucn-student.dto';
import { UcnCourseDto } from './dto/ucn-course.dto';
import { UcnInscriptionDto } from './dto/ucn-inscription.dto';
import { readNeeList } from './utils/read-nee-list';

import { Student, StudentDocument } from '../students/schemas/student.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { SyncLog, SyncLogDocument, SyncType, SyncStatus } from './schemas/sync-log.schema';

const HAWAII_ESTUDIANTES_URL = 'https://losvilos.ucn.cl/hawaii/api/estudiantes';
const HAWAII_ESTUDIANTES_HEADER = { 'X-HAWAII-AUTH': 'mnqpkUk00jioab' };

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(SyncLog.name) private syncLogModel: Model<SyncLogDocument>,
  ) {}

  async syncNeeStudents(): Promise<UcnStudentDto[]> {
    // Leer lista de NEE desde archivo
    const neeList = await readNeeList();
    const neeRuts = neeList.map(e => e.rut);
    this.logger.log(`NEE list loaded: ${neeList.length} students`);

    // Consumir endpoint /estudiantes
    let estudiantes: UcnStudentDto[] = [];
    try {
      const response = await axios.get<UcnStudentDto[]>(HAWAII_ESTUDIANTES_URL, { headers: HAWAII_ESTUDIANTES_HEADER });
      estudiantes = response.data;
      this.logger.log(`Total estudiantes recibidos desde endpoint: ${estudiantes.length}`);
    } catch (error) {
      this.logger.error('Error al consumir endpoint /estudiantes', error);
      return [];
    }

    // Filtrar solo los estudiantes NEE
    const estudiantesNee = estudiantes.filter(e => neeRuts.includes(e.rut));
    this.logger.log(`Estudiantes NEE encontrados: ${estudiantesNee.length}`);
    // Agregar carrera a cada estudiante NEE
    const estudiantesNeeEnriquecidos = estudiantesNee.map(e => {
      const nee = neeList.find(n => n.rut === e.rut);
      return { ...e, carrera: nee?.carrera };
    });
    return estudiantesNeeEnriquecidos;
  }

  async syncCourses(semester: string): Promise<UcnCourseDto[]> {
    const HAWAII_OFERTA_URL = `https://losvilos.ucn.cl/hawaii/api/oferta?${semester}`;
    const HAWAII_OFERTA_HEADER = { 'X-HAWAII-AUTH': 'qnbdg8k20jio90' };
    
    this.logger.log(`Sincronizando cursos para el semestre ${semester}`);
    
    try {
      const response = await axios.get<UcnCourseDto[]>(HAWAII_OFERTA_URL, { headers: HAWAII_OFERTA_HEADER });
      const cursos = response.data;
      this.logger.log(`Total cursos recibidos desde endpoint: ${cursos.length}`);
      return cursos;
    } catch (error) {
      this.logger.error(`Error al consumir endpoint /oferta para semestre ${semester}`, error);
      return [];
    }
  }

  async syncInscriptions(semester: string): Promise<UcnInscriptionDto[]> {
    const HAWAII_INSCRIPCION_URL = `https://losvilos.ucn.cl/hawaii/api/inscripcion?${semester}`;
    const HAWAII_INSCRIPCION_HEADER = { 'X-HAWAII-AUTH': 'knf3g8k29pjht8' };
    
    this.logger.log(`Sincronizando inscripciones para el semestre ${semester}`);
    
    try {
      const response = await axios.get<UcnInscriptionDto[]>(HAWAII_INSCRIPCION_URL, { headers: HAWAII_INSCRIPCION_HEADER });
      const inscripciones = response.data;
      this.logger.log(`Total inscripciones recibidas desde endpoint: ${inscripciones.length}`);
      return inscripciones;
    } catch (error) {
      this.logger.error(`Error al consumir endpoint /inscripcion para semestre ${semester}`, error);
      return [];
    }
  }
  
  async syncNeeInscriptions(semester: string): Promise<UcnInscriptionDto[]> {
    // 1. Obtener lista de RUTs de estudiantes NEE
    const neeList = await readNeeList();
    const neeRuts = neeList.map(e => e.rut);
    
    // 2. Obtener todas las inscripciones del semestre
    const inscripciones = await this.syncInscriptions(semester);
    
    // 3. Filtrar solo inscripciones de estudiantes NEE
    const inscripcionesNee = inscripciones.filter(i => neeRuts.includes(i.rut));
    
    this.logger.log(`Inscripciones de estudiantes NEE: ${inscripcionesNee.length}`);
    return inscripcionesNee;
  }
  
  /**
   * Sincroniza y persiste estudiantes NEE en la base de datos
   * @param semester Semestre académico actual
   * @returns Número de estudiantes persistidos
   */
  async syncAndPersistNeeStudents(semester: string): Promise<{count: number, students: Student[]}> {
    try {
      // 1. Obtener estudiantes NEE desde Hawaii UCN
      const estudiantes = await this.syncNeeStudents();
      if (estudiantes.length === 0) {
        await this.createSyncLog(SyncType.ESTUDIANTES_NEE, semester, SyncStatus.ERROR, 0, 0, 'No se encontraron estudiantes NEE');
        return { count: 0, students: [] };
      }
      
      // 2. Persistir o actualizar estudiantes en la base de datos
      const persistedStudents: Student[] = [];
      let syncedCount = 0;
      
      for (const estudiante of estudiantes) {
        try {
          // Buscar si el estudiante ya existe por RUT
          const existingStudent = await this.studentModel.findOne({ rut: estudiante.rut }).exec();
          
          if (existingStudent) {
            // Actualizar estudiante existente
            const updated = await this.studentModel.findByIdAndUpdate(
              existingStudent._id,
              {
                nombres: estudiante.nombres,
                apellidos: estudiante.apellidos,
                email: estudiante.email_ucn || `${estudiante.rut}@ucn.cl`, // Email por defecto si no existe
                carrera: estudiante.carrera,
                semester: semester,
                hasSpecialNeeds: true,
                updatedAt: new Date(),
              },
              { new: true }
            ).exec();
            
            if (updated) {
              persistedStudents.push(updated);
              syncedCount++;
            }
          } else {
            // Crear nuevo estudiante
            const nuevoEstudiante = new this.studentModel({
              rut: estudiante.rut,
              nombres: estudiante.nombres,
              apellidos: estudiante.apellidos,
              email: estudiante.email_ucn || `${estudiante.rut}@ucn.cl`,
              carrera: estudiante.carrera,
              semester: semester,
              hasSpecialNeeds: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            
            const saved = await nuevoEstudiante.save();
            persistedStudents.push(saved);
            syncedCount++;
          }
        } catch (error) {
          this.logger.error(`Error al persistir estudiante ${estudiante.rut}:`, error);
          // Continuar con el siguiente estudiante
        }
      }
      
      // 3. Registrar log de sincronización
      const status = syncedCount === estudiantes.length ? SyncStatus.SUCCESS : 
                    (syncedCount > 0 ? SyncStatus.PARTIAL : SyncStatus.ERROR);
                    
      await this.createSyncLog(SyncType.ESTUDIANTES_NEE, semester, status, estudiantes.length, syncedCount);
      
      return { count: syncedCount, students: persistedStudents };
    } catch (error) {
      this.logger.error('Error en sincronización y persistencia de estudiantes NEE:', error);
      await this.createSyncLog(SyncType.ESTUDIANTES_NEE, semester, SyncStatus.ERROR, 0, 0, error.message);
      throw new InternalServerErrorException('Error al sincronizar y persistir estudiantes NEE');
    }
  }
  
  /**
   * Sincroniza y persiste cursos en la base de datos
   * @param semester Semestre académico
   * @returns Número de cursos persistidos
   */
  async syncAndPersistCourses(semester: string): Promise<{count: number, courses: Course[]}> {
    try {
      // 1. Obtener cursos desde Hawaii UCN
      const cursos = await this.syncCourses(semester);
      if (cursos.length === 0) {
        await this.createSyncLog(SyncType.CURSOS, semester, SyncStatus.ERROR, 0, 0, 'No se encontraron cursos');
        return { count: 0, courses: [] };
      }
      
      // 2. Persistir o actualizar cursos en la base de datos
      const persistedCourses: Course[] = [];
      let syncedCount = 0;
      
      for (const curso of cursos) {
        try {
          // Buscar si el curso ya existe por NRC y semestre
          const existingCourse = await this.courseModel.findOne({
            nrc: curso.nrc,
            semester: semester
          }).exec();
          
          if (existingCourse) {
            // Actualizar curso existente
            const updated = await this.courseModel.findByIdAndUpdate(
              existingCourse._id,
              {
                name: curso.asignatura,
                code: curso.codigo,
                parallel: curso.paralelo,
                campus: curso.sede,
                department: curso.departamento,
                professorInfo: curso.profesores,
                updatedAt: new Date(),
              },
              { new: true }
            ).exec();
            
            if (updated) {
              persistedCourses.push(updated);
              syncedCount++;
            }
          } else {
            // Crear nuevo curso
            const nuevoCurso = new this.courseModel({
              nrc: curso.nrc,
              name: curso.asignatura,
              code: curso.codigo,
              parallel: curso.paralelo,
              campus: curso.sede,
              department: curso.departamento,
              professorInfo: curso.profesores,
              semester: semester,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            
            const saved = await nuevoCurso.save();
            persistedCourses.push(saved);
            syncedCount++;
          }
        } catch (error) {
          this.logger.error(`Error al persistir curso ${curso.nrc}:`, error);
          // Continuar con el siguiente curso
        }
      }
      
      // 3. Registrar log de sincronización
      const status = syncedCount === cursos.length ? SyncStatus.SUCCESS : 
                    (syncedCount > 0 ? SyncStatus.PARTIAL : SyncStatus.ERROR);
                    
      await this.createSyncLog(SyncType.CURSOS, semester, status, cursos.length, syncedCount);
      
      return { count: syncedCount, courses: persistedCourses };
    } catch (error) {
      this.logger.error('Error en sincronización y persistencia de cursos:', error);
      await this.createSyncLog(SyncType.CURSOS, semester, SyncStatus.ERROR, 0, 0, error.message);
      throw new InternalServerErrorException('Error al sincronizar y persistir cursos');
    }
  }
  
  /**
   * Crea un registro de log de sincronización
   */
  private async createSyncLog(
    type: SyncType, 
    semester: string, 
    status: SyncStatus, 
    itemsProcessed: number, 
    itemsSynced: number,
    errorMessage?: string,
    metadata?: Record<string, any>
  ): Promise<SyncLog | null> {
    try {
      const syncLog = new this.syncLogModel({
        type,
        semester,
        status,
        itemsProcessed,
        itemsSynced,
        errorMessage,
        metadata,
      });
      
      return await syncLog.save();
    } catch (error) {
      this.logger.error('Error al crear registro de sincronización:', error);
      return null;
    }
  }
}
