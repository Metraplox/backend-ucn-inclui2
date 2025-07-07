import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';

interface HawaiiStudent {
  rut: string;
  nombres: string;
  apellidos: string;
  email: string;
  carrera: string;
  [key: string]: any;
}

interface HawaiiBourse {
  nrc: string;
  asignatura: string;
  codigo: string;
  profesor: string;
  seccion: string;
  [key: string]: any;
}

interface HawaiiEnrollment {
  rut_estudiante: string;
  nrc: string;
  semestre: string;
  [key: string]: any;
}

interface NEEStudent {
  rut: string;
  carrera: string;
}

@Injectable()
export class HawaiiRealDataService {
  private readonly logger = new Logger(HawaiiRealDataService.name);
  private hawaiiConfig: any;
  private neeStudentsList: NEEStudent[] = [];

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.loadConfiguration();
    this.loadNEEStudentsList();
  }

  private loadConfiguration(): void {
    try {
      // Configuración desde variables de entorno (más seguro)
      this.hawaiiConfig = {
        hawaii: {
          baseUrl: this.configService.get(
            'HAWAII_BASE_URL',
            'https://losvilos.ucn.cl/hawaii/api',
          ),
          endpoints: {
            oferta: {
              url: '/oferta',
              auth: this.configService.get('HAWAII_AUTH_OFERTA'),
              description: 'Oferta académica por semestre',
            },
            estudiantes: {
              url: '/estudiantes',
              auth: this.configService.get('HAWAII_AUTH_ESTUDIANTES'),
              description: 'Lista completa de estudiantes UCN',
            },
            inscripcion: {
              url: '/inscripcion',
              auth: this.configService.get('HAWAII_AUTH_INSCRIPCION'),
              description: 'Inscripciones por semestre',
            },
          },
          config: {
            timeout: parseInt(
              this.configService.get('HAWAII_REQUEST_TIMEOUT', '30000'),
            ),
            retries: 3,
            cacheEnabled:
              this.configService.get('HAWAII_CACHE_ENABLED', 'true') === 'true',
            cacheTTL: parseInt(
              this.configService.get('HAWAII_CACHE_TTL', '3600'),
            ),
          },
        },
        semester: {
          current: this.configService.get('CURRENT_SEMESTER', '202510'),
          format: 'YYYYPP',
        },
        nee: {
          studentsFile: this.configService.get(
            'NEE_STUDENTS_FILE',
            './docs/assets/ESTUDIANTES_NEE_CSV.txt',
          ),
          totalCount: 63,
        },
      };

      // Validar que las credenciales estén configuradas
      if (
        !this.hawaiiConfig.hawaii.endpoints.oferta.auth ||
        !this.hawaiiConfig.hawaii.endpoints.estudiantes.auth ||
        !this.hawaiiConfig.hawaii.endpoints.inscripcion.auth
      ) {
        throw new Error(
          'Credenciales Hawaii no configuradas en variables de entorno',
        );
      }

      this.logger.log(
        '✅ Configuración Hawaii cargada desde variables de entorno',
      );
    } catch (error) {
      this.logger.error('❌ Error cargando configuración Hawaii:', error);
      throw new Error('No se pudo cargar la configuración de Hawaii API');
    }
  }

  private loadNEEStudentsList(): void {
    try {
      const neeFilePath = path.join(
        process.cwd(),
        'docs',
        'assets',
        'ESTUDIANTES_NEE_CSV.txt',
      );
      const neeData = fs.readFileSync(neeFilePath, 'utf8');

      this.neeStudentsList = neeData
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          const [rutNumber, dv, carrera] = line.split(',');
          return {
            rut: `${rutNumber}-${dv}`,
            carrera: carrera.trim(),
          };
        });

      this.logger.log(
        `✅ Lista NEE cargada: ${this.neeStudentsList.length} estudiantes`,
      );
    } catch (error) {
      this.logger.error('❌ Error cargando lista NEE:', error);
      throw new Error('No se pudo cargar la lista de estudiantes NEE');
    }
  }

  private async makeHawaiiRequest(
    endpoint: string,
    params?: any,
  ): Promise<any> {
    const endpointConfig = this.hawaiiConfig.hawaii.endpoints[endpoint];
    if (!endpointConfig) {
      throw new Error(`Endpoint ${endpoint} no configurado`);
    }

    const url = `${this.hawaiiConfig.hawaii.baseUrl}${endpointConfig.url}`;
    const headers = {
      'X-HAWAII-AUTH': endpointConfig.auth,
      'Content-Type': 'application/json',
      'User-Agent': 'UCN-INCLUI2/1.0',
    };

    try {
      this.logger.log(`🌐 Realizando petición a: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers,
          params,
          timeout: this.hawaiiConfig.hawaii.config.timeout,
        }),
      );

      this.logger.log(
        `✅ Respuesta exitosa de ${endpoint}: ${response.data?.length || 'N/A'} registros`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(`❌ Error en petición a ${endpoint}:`, error.message);
      throw new Error(
        `Error conectando con Hawaii API ${endpoint}: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene todos los estudiantes NEE desde Hawaii API
   */
  async getNEEStudentsFromHawaii(): Promise<HawaiiStudent[]> {
    this.logger.log('🎓 Obteniendo estudiantes NEE desde Hawaii API...');

    // Obtener todos los estudiantes desde Hawaii
    const allStudents: HawaiiStudent[] =
      await this.makeHawaiiRequest('estudiantes');

    // Filtrar solo los estudiantes que están en la lista NEE
    const neeRuts = new Set(this.neeStudentsList.map((s) => s.rut));

    const neeStudents = allStudents.filter((student) => {
      const studentRut = this.normalizeRut(student.rut);
      return neeRuts.has(studentRut);
    });

    this.logger.log(
      `✅ Estudiantes NEE encontrados: ${neeStudents.length}/${this.neeStudentsList.length}`,
    );

    if (neeStudents.length === 0) {
      this.logger.warn('⚠️ No se encontraron estudiantes NEE en Hawaii API');
    }

    return neeStudents;
  }

  /**
   * Obtiene la oferta académica para el semestre actual
   */
  async getCoursesFromHawaii(semester?: string): Promise<HawaiiBourse[]> {
    const targetSemester = semester || this.hawaiiConfig.semester.current;
    this.logger.log(
      `📚 Obteniendo oferta académica para semestre ${targetSemester}...`,
    );

    const courses: HawaiiBourse[] = await this.makeHawaiiRequest('oferta', {
      [targetSemester]: targetSemester,
    });

    this.logger.log(`✅ Cursos obtenidos: ${courses.length}`);
    return courses;
  }

  /**
   * Obtiene las inscripciones para el semestre actual
   */
  async getEnrollmentsFromHawaii(
    semester?: string,
  ): Promise<HawaiiEnrollment[]> {
    const targetSemester = semester || this.hawaiiConfig.semester.current;
    this.logger.log(
      `📝 Obteniendo inscripciones para semestre ${targetSemester}...`,
    );

    const enrollments: HawaiiEnrollment[] = await this.makeHawaiiRequest(
      'inscripcion',
      {
        [targetSemester]: targetSemester,
      },
    );

    // Filtrar solo inscripciones de estudiantes NEE
    const neeRuts = new Set(this.neeStudentsList.map((s) => s.rut));
    const neeEnrollments = enrollments.filter((enrollment) => {
      const studentRut = this.normalizeRut(enrollment.rut_estudiante);
      return neeRuts.has(studentRut);
    });

    this.logger.log(
      `✅ Inscripciones NEE obtenidas: ${neeEnrollments.length}/${enrollments.length}`,
    );
    return neeEnrollments;
  }

  /**
   * Sincronización completa de datos reales desde Hawaii
   */
  async syncCompleteRealData(semester?: string): Promise<{
    students: HawaiiStudent[];
    courses: HawaiiBourse[];
    enrollments: HawaiiEnrollment[];
    stats: any;
  }> {
    const startTime = Date.now();
    this.logger.log(
      '🚀 Iniciando sincronización completa de datos reales Hawaii...',
    );

    try {
      // Ejecutar todas las peticiones en paralelo para optimizar tiempo
      const [students, courses, enrollments] = await Promise.all([
        this.getNEEStudentsFromHawaii(),
        this.getCoursesFromHawaii(semester),
        this.getEnrollmentsFromHawaii(semester),
      ]);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      const stats = {
        totalStudentsNEE: students.length,
        totalCourses: courses.length,
        totalEnrollments: enrollments.length,
        syncDuration: `${duration}s`,
        timestamp: new Date().toISOString(),
        semester: semester || this.hawaiiConfig.semester.current,
      };

      this.logger.log('✅ Sincronización completa finalizada:', stats);

      return {
        students,
        courses,
        enrollments,
        stats,
      };
    } catch (error) {
      this.logger.error('❌ Error en sincronización completa:', error);
      throw error;
    }
  }

  /**
   * Normaliza formato de RUT para comparaciones
   */
  private normalizeRut(rut: string): string {
    if (!rut) return '';

    // Remover puntos y espacios, mantener guión
    return rut.replace(/\./g, '').replace(/\s/g, '').toUpperCase();
  }

  /**
   * Obtiene estadísticas de la configuración actual
   */
  getConfigStats(): any {
    return {
      hawaiiBaseUrl: this.hawaiiConfig.hawaii.baseUrl,
      configuredEndpoints: Object.keys(this.hawaiiConfig.hawaii.endpoints)
        .length,
      neeStudentsCount: this.neeStudentsList.length,
      currentSemester: this.hawaiiConfig.semester.current,
      cacheEnabled: this.hawaiiConfig.hawaii.config.cacheEnabled,
    };
  }
}
