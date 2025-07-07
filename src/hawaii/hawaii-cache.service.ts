import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { HawaiiService } from './hawaii.service';
import { HawaiiStudentDto } from './dto/hawaii-student.dto';
import { HawaiiCourseDto } from './dto/hawaii-course.dto';
import { HawaiiEnrollmentDto } from './dto/hawaii-enrollment.dto';

interface CacheMetadata {
  timestamp: number;
  semestre?: string;
  recordCount: number;
  checksum: string;
  lastUpdated: string;
}

interface CacheData<T> {
  metadata: CacheMetadata;
  data: T[];
}

@Injectable()
export class HawaiiCacheService {
  private readonly logger = new Logger(HawaiiCacheService.name);
  private readonly cacheDir = join(process.cwd(), 'cache', 'hawaii');
  private readonly maxCacheAge = 2 * 60 * 60 * 1000; // 2 horas en millisegundos

  // Cache en memoria para sesión actual
  private memoryCache = new Map<string, { data: any; timestamp: number }>();

  constructor(private readonly hawaiiService: HawaiiService) {
    this.ensureCacheDirectory();
  }

  /**
   * Obtiene estudiantes con caché inteligente
   */
  async getEstudiantesWithCache(): Promise<HawaiiStudentDto[]> {
    const cacheKey = 'estudiantes';
    const cacheFile = join(this.cacheDir, 'estudiantes.json');

    try {
      // 1. Verificar caché en memoria primero
      const memCache = this.memoryCache.get(cacheKey);
      if (memCache && this.isMemoryCacheValid(memCache.timestamp)) {
        this.logger.log('📋 Usando estudiantes desde caché en memoria');
        return memCache.data;
      }

      // 2. Verificar caché en disco
      const diskCache = await this.loadFromDisk<HawaiiStudentDto>(cacheFile);
      if (diskCache && this.isCacheValid(diskCache.metadata.timestamp)) {
        this.logger.log(
          `📋 Usando estudiantes desde caché en disco (${diskCache.metadata.recordCount} registros)`,
        );

        // Guardar en memoria para próximos usos
        this.memoryCache.set(cacheKey, {
          data: diskCache.data,
          timestamp: Date.now(),
        });

        return diskCache.data;
      }

      // 3. Descargar datos frescos de Hawaii API
      this.logger.log('🔄 Descargando estudiantes frescos desde Hawaii API...');
      const response = await this.hawaiiService.getEstudiantes();
      const students = response.data;

      // 4. Guardar en cachés
      await this.saveToDisk(cacheFile, students);
      this.memoryCache.set(cacheKey, {
        data: students,
        timestamp: Date.now(),
      });

      this.logger.log(
        `✅ Estudiantes descargados y cacheados (${students.length} registros)`,
      );
      return students;
    } catch (error) {
      this.logger.error('❌ Error obteniendo estudiantes con caché:', error);

      // Fallback: intentar usar caché expirado si existe
      const fallbackCache =
        await this.loadFromDisk<HawaiiStudentDto>(cacheFile);
      if (fallbackCache) {
        this.logger.warn('⚠️ Usando caché expirado como fallback');
        return fallbackCache.data;
      }

      throw error;
    }
  }

  /**
   * Obtiene cursos de un semestre con caché inteligente
   */
  async getOfertaWithCache(semestre: string): Promise<HawaiiCourseDto[]> {
    const cacheKey = `oferta-${semestre}`;
    const cacheFile = join(this.cacheDir, `oferta-${semestre}.json`);

    try {
      // 1. Verificar caché en memoria
      const memCache = this.memoryCache.get(cacheKey);
      if (memCache && this.isMemoryCacheValid(memCache.timestamp)) {
        this.logger.log(`📚 Usando cursos ${semestre} desde caché en memoria`);
        return memCache.data;
      }

      // 2. Verificar caché en disco
      const diskCache = await this.loadFromDisk<HawaiiCourseDto>(cacheFile);
      if (diskCache && this.isCacheValid(diskCache.metadata.timestamp)) {
        this.logger.log(
          `📚 Usando cursos ${semestre} desde caché en disco (${diskCache.metadata.recordCount} registros)`,
        );

        this.memoryCache.set(cacheKey, {
          data: diskCache.data,
          timestamp: Date.now(),
        });

        return diskCache.data;
      }

      // 3. Descargar datos frescos
      this.logger.log(
        `🔄 Descargando cursos ${semestre} frescos desde Hawaii API...`,
      );
      const response = await this.hawaiiService.getOferta(semestre);
      const courses = response.data;

      // 4. Guardar en cachés
      await this.saveToDisk(cacheFile, courses, semestre);
      this.memoryCache.set(cacheKey, {
        data: courses,
        timestamp: Date.now(),
      });

      this.logger.log(
        `✅ Cursos ${semestre} descargados y cacheados (${courses.length} registros)`,
      );
      return courses;
    } catch (error) {
      this.logger.error(
        `❌ Error obteniendo cursos ${semestre} con caché:`,
        error,
      );

      // Fallback: usar caché expirado
      const fallbackCache = await this.loadFromDisk<HawaiiCourseDto>(cacheFile);
      if (fallbackCache) {
        this.logger.warn(
          `⚠️ Usando caché expirado de cursos ${semestre} como fallback`,
        );
        return fallbackCache.data;
      }

      throw error;
    }
  }

  /**
   * Obtiene inscripciones de un semestre con caché inteligente
   */
  async getInscripcionWithCache(
    semestre: string,
  ): Promise<HawaiiEnrollmentDto[]> {
    const cacheKey = `inscripcion-${semestre}`;
    const cacheFile = join(this.cacheDir, `inscripcion-${semestre}.json`);

    try {
      // 1. Verificar caché en memoria
      const memCache = this.memoryCache.get(cacheKey);
      if (memCache && this.isMemoryCacheValid(memCache.timestamp)) {
        this.logger.log(
          `📝 Usando inscripciones ${semestre} desde caché en memoria`,
        );
        return memCache.data;
      }

      // 2. Verificar caché en disco
      const diskCache = await this.loadFromDisk<HawaiiEnrollmentDto>(cacheFile);
      if (diskCache && this.isCacheValid(diskCache.metadata.timestamp)) {
        this.logger.log(
          `📝 Usando inscripciones ${semestre} desde caché en disco (${diskCache.metadata.recordCount} registros)`,
        );

        this.memoryCache.set(cacheKey, {
          data: diskCache.data,
          timestamp: Date.now(),
        });

        return diskCache.data;
      }

      // 3. Descargar datos frescos
      this.logger.log(
        `🔄 Descargando inscripciones ${semestre} frescas desde Hawaii API...`,
      );
      const response = await this.hawaiiService.getInscripcion(semestre);
      const enrollments = response.data;

      // 4. Guardar en cachés
      await this.saveToDisk(cacheFile, enrollments, semestre);
      this.memoryCache.set(cacheKey, {
        data: enrollments,
        timestamp: Date.now(),
      });

      this.logger.log(
        `✅ Inscripciones ${semestre} descargadas y cacheadas (${enrollments.length} registros)`,
      );
      return enrollments;
    } catch (error) {
      this.logger.error(
        `❌ Error obteniendo inscripciones ${semestre} con caché:`,
        error,
      );

      // Fallback: usar caché expirado
      const fallbackCache =
        await this.loadFromDisk<HawaiiEnrollmentDto>(cacheFile);
      if (fallbackCache) {
        this.logger.warn(
          `⚠️ Usando caché expirado de inscripciones ${semestre} como fallback`,
        );
        return fallbackCache.data;
      }

      throw error;
    }
  }

  /**
   * Descarga y cachea todos los datos para un semestre completo
   * Optimizado para sincronizaciones completas
   */
  async preloadSemesterData(semestre: string): Promise<{
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
    this.logger.log(
      `🚀 Pre-cargando datos completos para semestre ${semestre}...`,
    );

    const startTime = Date.now();
    let apiCalls = 0;

    // Cargar todos en paralelo para máxima eficiencia
    const [students, courses, enrollments] = await Promise.all([
      this.trackApiCall(() => this.getEstudiantesWithCache()),
      this.trackApiCall(() => this.getOfertaWithCache(semestre)),
      this.trackApiCall(() => this.getInscripcionWithCache(semestre)),
    ]);

    apiCalls = this.apiCallCounter;
    this.resetApiCallCounter();

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
        totalApiCalls: apiCalls,
      },
    };
  }

  /**
   * Limpia caché expirado y optimiza almacenamiento
   */
  async cleanupCache(): Promise<{
    filesRemoved: number;
    spaceFreed: number;
    oldestCache: string | null;
  }> {
    this.logger.log('🧹 Iniciando limpieza de caché...');

    try {
      const files = await fs.readdir(this.cacheDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      let filesRemoved = 0;
      let spaceFreed = 0;
      let oldestCache: string | null = null;
      let oldestTime = Date.now();

      for (const file of jsonFiles) {
        const filePath = join(this.cacheDir, file);
        const stats = await fs.stat(filePath);

        // Verificar si el archivo es muy antiguo (más de 24 horas)
        const isOld = Date.now() - stats.mtime.getTime() > 24 * 60 * 60 * 1000;

        if (isOld) {
          await fs.unlink(filePath);
          filesRemoved++;
          spaceFreed += stats.size;
          this.logger.log(`🗑️ Eliminado caché expirado: ${file}`);
        } else {
          // Rastrear el archivo más antiguo
          if (stats.mtime.getTime() < oldestTime) {
            oldestTime = stats.mtime.getTime();
            oldestCache = file;
          }
        }
      }

      // Limpiar caché en memoria también
      this.memoryCache.clear();

      this.logger.log(
        `✅ Limpieza completada: ${filesRemoved} archivos removidos, ${this.formatBytes(spaceFreed)} liberados`,
      );

      return {
        filesRemoved,
        spaceFreed,
        oldestCache,
      };
    } catch (error) {
      this.logger.error('❌ Error durante limpieza de caché:', error);
      throw error;
    }
  }

  /**
   * Fuerza actualización de caché (ignora caché existente)
   */
  async forceRefresh(
    type: 'all' | 'estudiantes' | 'cursos' | 'inscripciones',
    semestre?: string,
  ): Promise<void> {
    this.logger.log(`🔄 Forzando actualización de caché: ${type}`);

    if (type === 'all' && semestre) {
      // Limpiar cachés específicos del semestre
      await this.invalidateCache(`estudiantes`);
      await this.invalidateCache(`oferta-${semestre}`);
      await this.invalidateCache(`inscripcion-${semestre}`);

      // Precargar datos frescos
      await this.preloadSemesterData(semestre);
    } else if (type === 'estudiantes') {
      await this.invalidateCache('estudiantes');
      await this.getEstudiantesWithCache();
    } else if (type === 'cursos' && semestre) {
      await this.invalidateCache(`oferta-${semestre}`);
      await this.getOfertaWithCache(semestre);
    } else if (type === 'inscripciones' && semestre) {
      await this.invalidateCache(`inscripcion-${semestre}`);
      await this.getInscripcionWithCache(semestre);
    }

    this.logger.log(`✅ Actualización forzada completada: ${type}`);
  }

  /**
   * Obtiene estadísticas del caché
   */
  async getCacheStats(): Promise<{
    memoryCacheSize: number;
    diskCacheFiles: number;
    totalDiskSize: number;
    oldestFile: string | null;
    newestFile: string | null;
    hitRate: number;
  }> {
    try {
      const files = await fs.readdir(this.cacheDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      let totalSize = 0;
      let oldestFile: string | null = null;
      let newestFile: string | null = null;
      let oldestTime = Date.now();
      let newestTime = 0;

      for (const file of jsonFiles) {
        const filePath = join(this.cacheDir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;

        if (stats.mtime.getTime() < oldestTime) {
          oldestTime = stats.mtime.getTime();
          oldestFile = file;
        }

        if (stats.mtime.getTime() > newestTime) {
          newestTime = stats.mtime.getTime();
          newestFile = file;
        }
      }

      return {
        memoryCacheSize: this.memoryCache.size,
        diskCacheFiles: jsonFiles.length,
        totalDiskSize: totalSize,
        oldestFile,
        newestFile,
        hitRate: this.calculateHitRate(),
      };
    } catch (error) {
      this.logger.error('Error obteniendo estadísticas de caché:', error);
      return {
        memoryCacheSize: 0,
        diskCacheFiles: 0,
        totalDiskSize: 0,
        oldestFile: null,
        newestFile: null,
        hitRate: 0,
      };
    }
  }

  // Métodos auxiliares privados

  private async ensureCacheDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      this.logger.error('Error creando directorio de caché:', error);
    }
  }

  private isMemoryCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < 30 * 60 * 1000; // 30 minutos para caché en memoria
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.maxCacheAge;
  }

  private async loadFromDisk<T>(
    filePath: string,
  ): Promise<CacheData<T> | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  private async saveToDisk<T>(
    filePath: string,
    data: T[],
    semestre?: string,
  ): Promise<void> {
    const cacheData: CacheData<T> = {
      metadata: {
        timestamp: Date.now(),
        semestre,
        recordCount: data.length,
        checksum: this.calculateChecksum(data),
        lastUpdated: new Date().toISOString(),
      },
      data,
    };

    await fs.writeFile(filePath, JSON.stringify(cacheData, null, 2));
  }

  private calculateChecksum(data: any): string {
    return require('crypto')
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  private async invalidateCache(cacheKey: string): Promise<void> {
    // Remover de memoria
    this.memoryCache.delete(cacheKey);

    // Remover de disco
    const cacheFile = join(this.cacheDir, `${cacheKey}.json`);
    try {
      await fs.unlink(cacheFile);
    } catch (error) {
      // Archivo no existe, ignorar
    }
  }

  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Contador de llamadas API para estadísticas
  private apiCallCounter = 0;

  private async trackApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
    this.apiCallCounter++;
    return await apiCall();
  }

  private resetApiCallCounter(): void {
    this.apiCallCounter = 0;
  }

  private calculateHitRate(): number {
    // Implementar lógica de hit rate basada en estadísticas de uso
    return 0.85; // Mock por ahora
  }
}
