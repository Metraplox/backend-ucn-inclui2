import { Injectable, Logger } from '@nestjs/common';
import { existsSync, readFileSync, promises as fs } from 'fs';
import { join } from 'path';
import { HawaiiService } from './hawaii.service';
import { HawaiiStudentDto } from './dto/hawaii-student.dto';
import { HawaiiCourseDto } from './dto/hawaii-course.dto';
import { HawaiiEnrollmentDto } from './dto/hawaii-enrollment.dto';

interface CacheData<T> {
  data: T[];
  timestamp: number;
}

@Injectable()
export class HawaiiCacheService {
  private readonly logger = new Logger(HawaiiCacheService.name);
  
  // Cache simple en memoria para evitar lecturas repetidas durante la misma sesión
  private memoryCache = new Map<string, any>();
  private apiCallCounter = 0;
  private readonly cacheDir = join(process.cwd(), 'cache');
  private readonly maxCacheAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

  constructor(
    private readonly hawaiiService: HawaiiService,
  ) {}

  /**
   * Lógica simple para obtener datos:
   * 1. Busca en caché de memoria primero
   * 2. Si no existe, intenta leer desde archivo JSON local
   * 3. Si no existe el archivo, llama a la API de Hawaii
   */
  private async loadData<T>(
    apiCall: () => Promise<{ data: T[] }>,
    localFilename: string,
    cacheKey: string,
  ): Promise<T[]> {
    // 1. Verificar caché en memoria
    if (this.memoryCache.has(cacheKey)) {
      this.logger.log(`MEMORY CACHE HIT: ${cacheKey}`);
      return this.memoryCache.get(cacheKey);
    }

    // 2. Intentar leer desde archivo local (prioridad en desarrollo)
    const localFilePath = join(process.cwd(), 'docs', 'assets', localFilename);
    if (existsSync(localFilePath)) {
      try {
        this.logger.log(`[DEV MODE] Leyendo datos desde archivo local: ${localFilename}`);
        const fileContent = readFileSync(localFilePath, 'utf-8');
        const data = JSON.parse(fileContent);
        
        // Guardar en caché de memoria
        this.memoryCache.set(cacheKey, data);
        return data;
      } catch (error) {
        this.logger.warn(`Error leyendo archivo local ${localFilename}:`, error.message);
      }
    }

    // 3. Fallback: llamar a la API
    this.logger.log(`Llamando a la API de Hawaii para: ${cacheKey}`);
    this.apiCallCounter++;
    const { data } = await apiCall();
    
    // Guardar en caché de memoria
    this.memoryCache.set(cacheKey, data);
    return data;
  }

  /**
   * Obtiene la lista completa de estudiantes.
   * Usa el archivo local 'estudiantes.json' si existe.
   */
  async getEstudiantesWithCache(): Promise<HawaiiStudentDto[]> {
    return this.loadData(
      () => this.hawaiiService.getEstudiantes(),
      'estudiantes.json',
      'hawaii_students',
    );
  }

  /**
   * Obtiene la oferta académica para un semestre.
   * Usa el archivo local 'oferta.json' si existe.
   */
  async getOfertaWithCache(semestre: string): Promise<HawaiiCourseDto[]> {
    return this.loadData(
      () => this.hawaiiService.getOferta(semestre),
      'oferta.json',
      `hawaii_oferta_${semestre}`,
    );
  }

  /**
   * Obtiene las inscripciones para un semestre.
   * Usa el archivo local 'inscripcion.json' si existe.
   */
  async getInscripcionWithCache(semestre: string): Promise<HawaiiEnrollmentDto[]> {
    return this.loadData(
      () => this.hawaiiService.getInscripcion(semestre),
      'inscripcion.json',
      `hawaii_inscripcion_${semestre}`,
    );
  }

  /**
   * Pre-carga todos los datos para un semestre dado, usando los archivos locales si existen.
   */
  async preloadSemesterData(semester: string): Promise<{
    students: HawaiiStudentDto[];
    courses: HawaiiCourseDto[];
    enrollments: HawaiiEnrollmentDto[];
    cacheStats: {
      studentsFromCache: boolean;
      coursesFromCache: boolean;
      enrollmentsFromCache: boolean;
      totalApiCalls: number;
    };
  }> {
    this.logger.log(`🚀 Pre-cargando datos completos para semestre ${semester}...`);
    
    const startTime = Date.now();
    this.apiCallCounter = 0;
    
    // Cargar todos en paralelo para máxima eficiencia
    const [students, courses, enrollments] = await Promise.all([
      this.getEstudiantesWithCache(),
      this.getOfertaWithCache(semester),
      this.getInscripcionWithCache(semester)
    ]);
    
    const apiCalls = this.apiCallCounter;
    const duration = Date.now() - startTime;
    
    this.logger.log(`🎉 Pre-carga completada en ${duration}ms:`);
    this.logger.log(`   📊 Estudiantes: ${students.length}`);
    this.logger.log(`   📚 Cursos: ${courses.length}`);
    this.logger.log(`   📝 Inscripciones: ${enrollments.length}`);
    this.logger.log(`   🌐 Llamadas API realizadas: ${apiCalls}/3`);
    
    return {
      students,
      courses,
      enrollments,
      cacheStats: {
        studentsFromCache: apiCalls < 3,
        coursesFromCache: apiCalls < 3,
        enrollmentsFromCache: apiCalls < 3,
        totalApiCalls: apiCalls
      }
    };
  }
}