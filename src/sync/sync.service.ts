import { Injectable, Logger, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import axios from 'axios';

import { UcnStudentDto } from './dto/ucn-student.dto';
import { UcnCourseDto } from './dto/ucn-course.dto';
import { UcnInscriptionDto } from './dto/ucn-inscription.dto';
import { readNeeList, normalizeRut, getOnlyDigits } from './utils/read-nee-list';

import { Student, StudentDocument } from '../students/schemas/student.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { SyncLog, SyncLogDocument, SyncType, SyncStatus } from './schemas/sync-log.schema';
import { CareersService } from '../careers/careers.service';
import { UsersService } from '../users/users.service';

// 🚀 Integración con sistema de caché Hawaii
import { HawaiiCacheService } from '../hawaii/hawaii-cache.service';

const HAWAII_ESTUDIANTES_URL = 'https://losvilos.ucn.cl/hawaii/api/estudiantes';
const HAWAII_ESTUDIANTES_HEADER = { 'X-HAWAII-AUTH': 'mnqpkUk00jioab' };

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  
  /**
   * Convierte de forma segura un valor a ObjectId válido
   * @param id Valor a convertir (string, ObjectId, o cualquier valor)
   * @returns ObjectId válido o undefined si no es válido
   */
  private safeObjectId(id: any): Types.ObjectId | undefined {
    if (!id) return undefined;
    
    try {
      // Si ya es un ObjectId válido
      if (id instanceof Types.ObjectId) return id;
      
      // Si es string y representa un ObjectId válido
      if (typeof id === 'string' && isValidObjectId(id)) {
        return new Types.ObjectId(id);
      }
      
      // Si tiene toString(), intentar convertir su representación string
      if (id && typeof id.toString === 'function') {
        const idStr = id.toString();
        if (isValidObjectId(idStr)) {
          return new Types.ObjectId(idStr);
        }
      }
      
      return undefined;
    } catch (error) {
      this.logger.warn(`Error al convertir a ObjectId: ${error.message}`);
      return undefined;
    }
  };
  
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(SyncLog.name) private syncLogModel: Model<SyncLogDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private careersService: CareersService,
    private usersService: UsersService,
    // 🎯 Inyectar servicio de caché Hawaii (opcional para retrocompatibilidad)
    private hawaiiCacheService?: HawaiiCacheService,
  ) {}

  /**
   * 🚀 OPTIMIZADO: Sincroniza estudiantes NEE usando caché inteligente
   */
  async syncNeeStudents(): Promise<UcnStudentDto[]> {
    // Leer lista de NEE desde archivo
    const neeList = await readNeeList();
    
    // Extraer solo los dígitos de los RUTs para comparación consistente
    const neeRutsDigits = neeList.map(e => getOnlyDigits(e.rut));
    this.logger.log(`📋 NEE list loaded: ${neeList.length} students (solo dígitos para comparación)`);
    // Mostrar los primeros 5 RUTs para diagnóstico
    this.logger.debug(`Primeros 5 RUTs de lista NEE (solo dígitos): ${neeRutsDigits.slice(0, 5).join(', ')}`);

    // ✅ Consumir datos usando caché inteligente si está disponible
    let estudiantes: UcnStudentDto[] = [];
    try {
      if (this.hawaiiCacheService) {
        this.logger.log('🚀 Usando caché inteligente Hawaii para estudiantes...');
        // Usar el sistema de caché optimizado
        const cachedStudents = await this.hawaiiCacheService.getEstudiantesWithCache();
        // Convertir formato Hawaii a formato UCN
        estudiantes = cachedStudents.map(student => ({
          rut: student.rut,
          nombres: student.nombres,
          apellidos: student.apellidos,
          email_ucn: student.email_ucn,
          // Agregar campos adicionales si es necesario
        })) as UcnStudentDto[];
        
        this.logger.log(`✅ Estudiantes obtenidos desde caché: ${estudiantes.length}`);
      } else {
        // Fallback al método original
        this.logger.log('⚠️ Caché Hawaii no disponible, usando método directo...');
        const response = await axios.get<UcnStudentDto[]>(HAWAII_ESTUDIANTES_URL, { headers: HAWAII_ESTUDIANTES_HEADER });
        estudiantes = response.data;
        this.logger.log(`📡 Total estudiantes recibidos desde endpoint: ${estudiantes.length}`);
      }
      
      // Mostrar los primeros 5 RUTs de Hawaii para diagnóstico
      if (estudiantes.length > 0) {
        const primeros5RutsHawaii = estudiantes.slice(0, 5).map(e => e.rut);
        const primeros5RutsHawaiiDigits = estudiantes.slice(0, 5).map(e => getOnlyDigits(e.rut));
        this.logger.debug(`Primeros 5 RUTs de Hawaii (original): ${primeros5RutsHawaii.join(', ')}`);
        this.logger.debug(`Primeros 5 RUTs de Hawaii (solo dígitos): ${primeros5RutsHawaiiDigits.join(', ')}`);
      }
    } catch (error) {
      this.logger.error('❌ Error al consumir endpoint /estudiantes', error);
      return [];
    }

    // Filtrar solo los estudiantes NEE usando comparación de solo dígitos
    const estudiantesNee = estudiantes.filter(e => {
      const rutDigits = getOnlyDigits(e.rut);
      const coincide = neeRutsDigits.includes(rutDigits);
      
      // Si hay alguna coincidencia, log detallado para verificar
      if (coincide) {
        this.logger.debug(`✅ Coincidencia encontrada: RUT Hawaii=${e.rut} (${rutDigits}) coincide con lista NEE`);
      }
      
      return coincide;
    });

    this.logger.log(`🎯 Estudiantes NEE encontrados: ${estudiantesNee.length} de ${estudiantes.length} total`);
    
    if (estudiantesNee.length === 0) {
      this.logger.warn('⚠️ No se encontraron estudiantes NEE en los datos de Hawaii');
    }

    return estudiantesNee;
  }

  /**
   * 🚀 OPTIMIZADO: Sincroniza cursos usando caché inteligente
   */
  async syncCourses(semester: string): Promise<UcnCourseDto[]> {
    this.logger.log(`🔄 Sincronizando cursos para el semestre ${semester}`);
    
    try {
      if (this.hawaiiCacheService) {
        this.logger.log('🚀 Usando caché inteligente Hawaii para cursos...');
        // Usar el sistema de caché optimizado
        const cachedCourses = await this.hawaiiCacheService.getOfertaWithCache(semester);
        // Convertir formato Hawaii a formato UCN
        const cursos = cachedCourses.map(course => ({
          periodo: course.periodo,
          nrc: course.nrc,
          asignatura: course.asignatura,
          paralelo: course.paralelo,
          codigo: course.codigo,
          sede: course.sede,
          departamento: course.departamento,
          profesores: course.profesores,
        })) as UcnCourseDto[];
        
        this.logger.log(`✅ Cursos obtenidos desde caché: ${cursos.length}`);
        return cursos;
      } else {
        // Fallback al método original
        this.logger.log('⚠️ Caché Hawaii no disponible, usando método directo...');
        const HAWAII_OFERTA_URL = `https://losvilos.ucn.cl/hawaii/api/oferta?${semester}`;
        const HAWAII_OFERTA_HEADER = { 'X-HAWAII-AUTH': 'qnbdg8k20jio90' };
        
        const response = await axios.get<UcnCourseDto[]>(HAWAII_OFERTA_URL, { headers: HAWAII_OFERTA_HEADER });
        const cursos = response.data;
        this.logger.log(`📡 Total cursos recibidos desde endpoint: ${cursos.length}`);
        return cursos;
      }
    } catch (error) {
      this.logger.error(`❌ Error al consumir endpoint /oferta para semestre ${semester}`, error);
      return [];
    }
  }

  /**
   * 🚀 OPTIMIZADO: Sincroniza inscripciones usando caché inteligente
   */
  async syncInscriptions(semester: string): Promise<UcnInscriptionDto[]> {
    this.logger.log(`🔄 Sincronizando inscripciones para el semestre ${semester}`);
    
    try {
      if (this.hawaiiCacheService) {
        this.logger.log('🚀 Usando caché inteligente Hawaii para inscripciones...');
        // Usar el sistema de caché optimizado
        const cachedEnrollments = await this.hawaiiCacheService.getInscripcionWithCache(semester);
        // Convertir formato Hawaii a formato UCN
        const inscripciones = cachedEnrollments.map(enrollment => ({
          rut: enrollment.rut,
          nrc: enrollment.nrc,
          // Agregar campos adicionales si es necesario según el formato UCN
        })) as UcnInscriptionDto[];
        
        this.logger.log(`✅ Inscripciones obtenidas desde caché: ${inscripciones.length}`);
        return inscripciones;
      } else {
        // Fallback al método original
        this.logger.log('⚠️ Caché Hawaii no disponible, usando método directo...');
        const HAWAII_INSCRIPCION_URL = `https://losvilos.ucn.cl/hawaii/api/inscripcion?${semester}`;
        const HAWAII_INSCRIPCION_HEADER = { 'X-HAWAII-AUTH': 'knf3g8k29pjht8' };
        
        const response = await axios.get<UcnInscriptionDto[]>(HAWAII_INSCRIPCION_URL, { headers: HAWAII_INSCRIPCION_HEADER });
        const inscripciones = response.data;
        this.logger.log(`📡 Total inscripciones recibidas desde endpoint: ${inscripciones.length}`);
        return inscripciones;
      }
    } catch (error) {
      this.logger.error(`❌ Error al consumir endpoint /inscripcion para semestre ${semester}`, error);
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
   * 🚀 NUEVO: Método optimizado para sincronización completa usando pre-carga
   */
  async syncCompleteWithCache(semester: string): Promise<{
    success: boolean;
    students: number;
    courses: number;
    inscriptions: number;
    cacheStats: {
      totalApiCalls: number;
      cachingEnabled: boolean;
    };
  }> {
    this.logger.log(`🚀 Iniciando sincronización completa optimizada para semestre ${semester}`);
    
    const startTime = Date.now();
    
    try {
      if (this.hawaiiCacheService) {
        // ✅ Pre-cargar todos los datos en una sola operación
        this.logger.log('📦 Pre-cargando datos Hawaii...');
        const preloadData = await this.hawaiiCacheService.preloadSemesterData(semester);
        
        this.logger.log(`📊 Pre-carga completada: ${preloadData.cacheStats.totalApiCalls}/3 llamadas API`);
        
        // Procesar estudiantes NEE
        const neeList = await readNeeList();
        const neeRutsDigits = neeList.map(e => getOnlyDigits(e.rut));
        
        const estudiantesNee = preloadData.students.filter(student => 
          neeRutsDigits.includes(getOnlyDigits(student.rut))
        );
        
        // Estadísticas finales
        const duration = Date.now() - startTime;
        this.logger.log(`🎉 Sincronización optimizada completada en ${duration}ms:`);
        this.logger.log(`   👥 Estudiantes NEE: ${estudiantesNee.length}`);
        this.logger.log(`   📚 Cursos: ${preloadData.courses.length}`);
        this.logger.log(`   📝 Inscripciones: ${preloadData.enrollments.length}`);
        this.logger.log(`   🌐 Llamadas API: ${preloadData.cacheStats.totalApiCalls}/3`);
        
        return {
          success: true,
          students: estudiantesNee.length,
          courses: preloadData.courses.length,
          inscriptions: preloadData.enrollments.length,
          cacheStats: {
            totalApiCalls: preloadData.cacheStats.totalApiCalls,
            cachingEnabled: true
          }
        };
      } else {
        this.logger.warn('⚠️ Sistema de caché no disponible, usando métodos individuales...');
        
        // Fallback a métodos individuales
        const [estudiantes, cursos, inscripciones] = await Promise.all([
          this.syncNeeStudents(),
          this.syncCourses(semester),
          this.syncInscriptions(semester)
        ]);
        
        const duration = Date.now() - startTime;
        this.logger.log(`✅ Sincronización tradicional completada en ${duration}ms`);
        
        return {
          success: true,
          students: estudiantes.length,
          courses: cursos.length,
          inscriptions: inscripciones.length,
          cacheStats: {
            totalApiCalls: 3, // Máximo posible sin caché
            cachingEnabled: false
          }
        };
      }
    } catch (error) {
      this.logger.error('❌ Error en sincronización completa optimizada:', error);
      throw error;
    }
  }

  /**
   * Sincroniza y persiste estudiantes NEE en la base de datos
   * @param semester Semestre académico actual
   * @returns Número de estudiantes persistidos
   */
  /**
  async syncAndPersistNeeStudents(semester: string): Promise<{ count: number; students: Student[] }> {
    try {
      // Obtener estudiantes NEE sincronizados
      const estudiantes = await this.syncNeeStudents();
      
      this.logger.log(`Estudiantes NEE obtenidos: ${estudiantes.length}`);
      
      // Log detallado para depuración
      if (estudiantes.length > 0) {
        const primeros3 = estudiantes.slice(0, 3);
        this.logger.debug(`Muestra de estudiantes encontrados:`);
        primeros3.forEach(e => {
          this.logger.debug(`- RUT: ${e.rut}, Nombre: ${e.nombres} ${e.apellidos}, Email: ${e.email_ucn}, Carrera: ${e.carrera}`);
        });
      }
      
      if (!estudiantes.length) {
        this.logger.warn(`No se encontraron estudiantes NEE para sincronizar en el semestre ${semester}`);
        await this.createSyncLog(SyncType.ESTUDIANTES_NEE, semester, SyncStatus.WARNING, 0, 0, 'No hay estudiantes NEE para sincronizar');
        return { count: 0, students: [] };
      }
      
      this.logger.log(`Persistiendo ${estudiantes.length} estudiantes NEE para semestre ${semester}...`);
      
      const persistedStudents: Student[] = [];
      let syncedCount = 0;

      // Crear un departamento por defecto si no existe
      let defaultDepartment;
      try {
        // Intentar buscar departamento por defecto
        defaultDepartment = await this.careersService['departmentModel']?.findOne({ name: 'Departamento por Defecto' }).exec();
        
        // Si no existe, crearlo
        if (!defaultDepartment && this.careersService['departmentModel']) {
          defaultDepartment = await new this.careersService['departmentModel']({
            name: 'Departamento por Defecto',
            code: 'DEP_DEFAULT',
            description: 'Departamento creado automáticamente para sincronización',
            createdAt: new Date(),
            updatedAt: new Date()
          }).save();
          this.logger.log('Departamento por defecto creado');
        }
      } catch (error) {
        this.logger.warn('No se pudo crear departamento por defecto, usando ID genérico', error);
        // Continuar sin departamento
      }
      
      // ID de departamento por defecto (usar el creado o un ID genérico)
      const defaultDepartmentId = defaultDepartment?._id || new Types.ObjectId();

      for (const estudiante of estudiantes) {
        try {
          this.logger.debug(`Procesando estudiante: ${estudiante.rut}`);
          
          // 1. Buscar o crear carrera con manejo mejorado de errores
          let career;
          try {
            career = await this.findOrCreateCareer(estudiante.carrera || 'Carrera No Especificada', {
              faculty: 'Facultad por Defecto',
              currentSemester: semester,
              departmentId: defaultDepartmentId.toString(),
            });
            
            if (!career) {
              throw new Error('Carrera no pudo ser creada');
            }
          } catch (careerError) {
            this.logger.error(`Error al crear carrera para ${estudiante.rut}: ${careerError.message}`);
            
            // Intento alternativo de crear carrera usando modelo directamente
            try {
              if (this.careersService['careerModel']) {
                career = await new this.careersService['careerModel']({
                  name: estudiante.carrera || 'Carrera No Especificada',
                  code: (estudiante.carrera || 'NO_SPEC').toUpperCase().replace(/\s+/g, '_'),
                  faculty: 'Facultad por Defecto',
                  currentSemester: semester,
                  departmentId: defaultDepartmentId,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }).save();
              }
            } catch (directCareerError) {
              this.logger.error(`Error en intento directo para crear carrera: ${directCareerError.message}`);
            }
            
            // Si aún no hay carrera, usar una carrera genérica
            if (!career) {
              career = { _id: new Types.ObjectId() };
              this.logger.warn(`Usando carrera genérica para ${estudiante.rut}`);
            }
          }
          
          // 2. Buscar o crear usuario con manejo mejorado de errores
          const email = estudiante.email_ucn || `${estudiante.rut.toLowerCase()}@alumnos.ucn.cl`;
          let user;
          
          try {
            user = await this.findOrCreateUser(email, estudiante.nombres, estudiante.apellidos, estudiante.rut, true);
            
            if (!user) {
              throw new Error('Usuario no pudo ser creado a través del servicio');
            }
          } catch (userError) {
            this.logger.error(`Error al crear usuario para ${email}: ${userError.message}`);
            
            // Intento alternativo usando modelo directamente
            try {
              if (this.usersService['userModel']) {
                // Buscar por email primero
                user = await this.usersService['userModel'].findOne({ email }).exec();
                
                // Si no existe, crear uno nuevo
                if (!user) {
                  user = await new this.usersService['userModel']({
                    email,
                    nombreCompleto: `${estudiante.nombres} ${estudiante.apellidos}`.trim(),
                    roles: ['student'],
                    isActive: true,
                    password: 'inclui2025', // Contraseña por defecto para pruebas
                    rut: estudiante.rut,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }).save();
                }
              }
            } catch (directUserError) {
              this.logger.error(`Error en intento directo para crear usuario: ${directUserError.message}`);
            }
            
            // Si aún no hay usuario, usar uno genérico
            if (!user) {
              user = { _id: new Types.ObjectId() };
              this.logger.warn(`Usando usuario genérico para ${estudiante.rut}`);
            }
          }

          // 3. Buscar si el estudiante ya existe por RUT, con mejor manejo de errores
          let student;
          try {
            student = await this.studentModel.findOne({ rut: estudiante.rut }).exec();
          } catch (findError) {
            this.logger.error(`Error al buscar estudiante ${estudiante.rut}: ${findError.message}`);
            // Continuamos asumiendo que no existe
          }

          // Preparar IDs seguros
          const carreraObjectId = this.safeObjectId(career?._id);
          const userObjectId = this.safeObjectId(user?._id);
          
          // Verificar que tenemos IDs válidos
          if (!carreraObjectId || !userObjectId) {
            this.logger.error(`IDs inválidos para estudiante ${estudiante.rut}: carreraId=${!!carreraObjectId}, userId=${!!userObjectId}`);
            continue;
          }

          try {
            if (student) {
              // Actualizar estudiante existente
              this.logger.debug(`Actualizando estudiante existente: ${estudiante.rut}`);
              student.nombres = estudiante.nombres;
              student.apellidos = estudiante.apellidos;
              student.email = email;
              student.carreraId = carreraObjectId;
              student.userId = userObjectId;
              student.semester = semester;
              student.updatedAt = new Date();
              await student.save();
            } else {
              // Crear nuevo estudiante
              this.logger.debug(`Creando nuevo estudiante: ${estudiante.rut}`);
              student = await new this.studentModel({
                rut: estudiante.rut,
                nombres: estudiante.nombres,
                apellidos: estudiante.apellidos,
                email,
                carreraId: carreraObjectId,
                userId: userObjectId,
                semester,
                createdAt: new Date(),
                updatedAt: new Date(),
              }).save();
            }

            // Registrar éxito
            this.logger.debug(`Estudiante ${estudiante.rut} persistido exitosamente`);
            persistedStudents.push(student);
            syncedCount++;
          } catch (saveError) {
            this.logger.error(`Error al guardar estudiante ${estudiante.rut}: ${saveError.message}`);
            if (saveError.code === 11000) {
              this.logger.error('Error de duplicación, posible índice único violado');
            }
          }
        } catch (error) {
          this.logger.error(`Error general al procesar estudiante ${estudiante.rut}:`, error);
          // Continuar con el siguiente estudiante
        }
      }

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
   * Busca o crea una carrera por nombre. Si no existe, la crea con datos mínimos.
   */
  private async findOrCreateCareer(careerName: string, options?: { faculty?: string; currentSemester?: string; departmentId?: string }) {
    if (!careerName) return null;
    try {
      // Buscar carrera por nombre usando el servicio
      // Buscar carrera por nombre usando el modelo si es público
      let existing: import('../careers/schemas/career.schema').CareerDocument | null = null;
if (typeof this.careersService['careerModel'] !== 'undefined') {
  existing = await this.careersService['careerModel'].findOne({ name: careerName }).exec();
}
if (existing) return existing;

      // Construir DTO completo con valores por defecto si no se proveen
      const createCareerDto = {
        name: careerName,
        code: careerName.toUpperCase().replace(/\s+/g, '_'),
        faculty: options?.faculty || 'Sin Facultad',
        currentSemester: options?.currentSemester || '2025-1', // Ajustar a semestre actual si es necesario
        departmentId: options?.departmentId || 'default-department', // Ajustar según lógica real
      };
      const career = await this.careersService.create(createCareerDto);
      this.logger.log(`Carrera creada: ${careerName}`);
      return career;
    } catch (error) {
      this.logger.error(`Error al buscar o crear carrera (${careerName}):`, error);
      return null;
    }
  }

  /**
   * Busca o crea un usuario por email. Si no existe, lo crea con datos mínimos.
   * Implementa múltiples estrategias de fallback para garantizar éxito.
   */
  private async findOrCreateUser(email: string, nombres: string, apellidos: string, rut: string, modoPruebas: boolean = false) {
    if (!email) {
      this.logger.error('Se intentó crear usuario sin email');
      return null;
    }
    
    try {
      // 1. Primer intento: buscar usuario por email usando el servicio
      try {
        const existing = await this.usersService.findByEmail?.(email);
        if (existing) {
          this.logger.debug(`Usuario encontrado por email: ${email}`);
          return existing;
        }
      } catch (findError) {
        this.logger.warn(`Error al buscar usuario por email: ${findError.message}`);
        // Continuar al siguiente intento
      }

      // 2. Segundo intento: buscar directamente en el modelo si está disponible
      if (this.usersService['userModel']) {
        try {
          const existingUser = await this.usersService['userModel'].findOne({ email }).exec();
          if (existingUser) {
            this.logger.debug(`Usuario encontrado directamente en el modelo: ${email}`);
            return existingUser;
          }
        } catch (directFindError) {
          this.logger.warn(`Error al buscar usuario directamente: ${directFindError.message}`);
          // Continuar al siguiente intento
        }
      }

      // 3. Tercer intento: crear usuario usando el servicio
      const userDto: any = {
        email,
        nombreCompleto: `${nombres} ${apellidos}`.trim(),
        roles: ['student'],
        isActive: true,
        // Siempre incluir contraseña para desarrollo/pruebas
        password: 'inclui2025',
        rut,
      };
      
      try {
        const user = await this.usersService.create(userDto);
        if (user) {
          this.logger.debug(`Usuario creado exitosamente vía servicio: ${email}`);
          return user;
        }
      } catch (createError) {
        this.logger.warn(`Error al crear usuario vía servicio: ${createError.message}`);
        // Continuar al siguiente intento
      }

      // 4. Cuarto intento: crear directamente en el modelo
      if (this.usersService['userModel']) {
        try {
          const newUser = await new this.usersService['userModel']({
            email,
            nombreCompleto: `${nombres} ${apellidos}`.trim(),
            roles: ['student'],
            isActive: true,
            password: 'inclui2025',
            rut,
            createdAt: new Date(),
            updatedAt: new Date()
          }).save();
          
          if (newUser) {
            this.logger.debug(`Usuario creado directamente en modelo: ${email}`);
            return newUser;
          }
        } catch (directCreateError) {
          this.logger.error(`Error al crear usuario directamente en modelo: ${directCreateError.message}`);
          
          // Si es error de duplicado, intentar obtener el existente
          if (directCreateError.code === 11000) {
            try {
              const duplicateUser = await this.usersService['userModel'].findOne({ email }).exec();
              if (duplicateUser) {
                this.logger.debug(`Recuperado usuario duplicado: ${email}`);
                return duplicateUser;
              }
            } catch (dupFindError) {
              this.logger.error(`Error al recuperar duplicado: ${dupFindError.message}`);
            }
          }
        }
      }
      
      // Si llegamos aquí, todos los intentos fallaron
      this.logger.error(`Todos los intentos de crear/encontrar usuario fallaron: ${email}`);
      return null;
    } catch (error) {
      this.logger.error(`Error general al buscar o crear usuario (${email}):`, error);
      return null;
    }
  }
  
  /**
   * Sincroniza y persiste cursos en la base de datos
   * @param semester Semestre académico
   * @returns Número de cursos persistidos
   */
  /**
   * Sincroniza y persiste estudiantes NEE en la base de datos para el semestre indicado
   * @param semester Semestre académico
   * @returns Número de estudiantes NEE persistidos
   */
  async syncAndPersistNeeStudents(semester: string): Promise<{count: number, students: Student[]}> {
    try {
      // 1. Obtener estudiantes NEE desde Hawaii y lista institucional
      const estudiantesNee = await this.syncNeeStudents();
      if (!estudiantesNee || estudiantesNee.length === 0) {
        await this.createSyncLog(SyncType.ESTUDIANTES_NEE, semester, SyncStatus.ERROR, 0, 0, 'No se encontraron estudiantes NEE');
        return { count: 0, students: [] };
      }

      // 2. Persistir o actualizar estudiantes NEE en la base de datos
      const persistedStudents: Student[] = [];
      let syncedCount = 0;

      for (const estudiante of estudiantesNee) {
        try {
          // Buscar si el estudiante ya existe por RUT y semestre
          const existing = await this.studentModel.findOne({ rut: estudiante.rut, semester }).exec();
          // Buscar o crear usuario asociado (User)
          let userId: import('mongoose').Types.ObjectId | undefined = undefined;
          if (estudiante.email_ucn) {
            let user = await this.userModel.findOne({ email: estudiante.email_ucn.toLowerCase() });
            if (!user) {
              user = new this.userModel({
                email: estudiante.email_ucn.toLowerCase(),
                roles: ['STUDENT'],
                isActive: true,
              });
              await user.save();
            }
            userId = (typeof user._id === 'string') ? new Types.ObjectId(user._id) : user._id;
          }
          // Buscar el id de carrera usando careersService
          let carreraId: import('mongoose').Types.ObjectId | undefined = undefined;
          if (estudiante.carrera) {
            const carrera = await this.careersService.findByName(estudiante.carrera);
            if (carrera && carrera._id) {
              carreraId = (typeof carrera._id === 'string') ? new (require('mongoose')).Types.ObjectId(carrera._id) : carrera._id;
            }
          }
          if (existing) {
            // Actualizar datos relevantes
            existing.nombres = estudiante.nombres;
            existing.apellidos = estudiante.apellidos;
            existing.email = estudiante.email_ucn || '';
            if (carreraId) existing.carreraId = carreraId;
            if (userId) existing.userId = userId;
            existing.updatedAt = new Date();
            await existing.save();
            persistedStudents.push(existing);
            syncedCount++;
          } else {
            // Crear nuevo estudiante NEE
            const nuevoEstudiante = new this.studentModel({
              rut: estudiante.rut,
              nombres: estudiante.nombres,
              apellidos: estudiante.apellidos,
              email: estudiante.email_ucn || '',
              userId: userId,
              carreraId: carreraId || undefined,
              semester,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            const saved = await nuevoEstudiante.save();
            persistedStudents.push(saved);
            syncedCount++;
          }
        } catch (error) {
          this.logger.error(`Error al persistir estudiante NEE ${estudiante.rut}:`, error);
        }
      }

      // 3. Registrar log de sincronización
      const status = syncedCount === estudiantesNee.length ? SyncStatus.SUCCESS : 
                    (syncedCount > 0 ? SyncStatus.PARTIAL : SyncStatus.ERROR);
      await this.createSyncLog(SyncType.ESTUDIANTES_NEE, semester, status, estudiantesNee.length, syncedCount);
      return { count: syncedCount, students: persistedStudents };
    } catch (error) {
      this.logger.error('Error en sincronización y persistencia de estudiantes NEE:', error);
      await this.createSyncLog(SyncType.ESTUDIANTES_NEE, semester, SyncStatus.ERROR, 0, 0, error.message);
      throw new InternalServerErrorException('Error al sincronizar y persistir estudiantes NEE');
    }
  }

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
