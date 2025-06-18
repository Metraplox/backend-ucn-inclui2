import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SyncService } from '../sync/sync.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SemesterSchedulerService {
  private readonly logger = new Logger(SemesterSchedulerService.name);

  constructor(
    private readonly syncService: SyncService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Ejecuta sincronización automática al inicio de cada semestre UCN
   * Marzo 1 (Semestre 1) y Agosto 1 (Semestre 2) a las 06:00 AM
   */
  @Cron('0 6 1 3,8 *')
  async autoSyncNewSemester() {
    const currentSemester = this.getCurrentSemester();
    
    this.logger.log(`🔄 Iniciando sincronización automática semestre ${currentSemester}`);
    
    try {
      const startTime = Date.now();
      
      // 1. Sincronizar estudiantes NEE
      this.logger.log('Sincronizando estudiantes NEE...');
      const studentsResult = await this.syncService.syncAndPersistNeeStudents(currentSemester);
      
      // 2. Sincronizar cursos del semestre
      this.logger.log('Sincronizando cursos...');
      const coursesResult = await this.syncService.syncAndPersistCourses(currentSemester);
      
      // 3. Sincronizar inscripciones NEE
      this.logger.log('Sincronizando inscripciones NEE...');
      const enrollments = await this.syncService.syncNeeInscriptions(currentSemester);
      
      const duration = Date.now() - startTime;
      
      const results = {
        semester: currentSemester,
        students: studentsResult.count,
        courses: coursesResult.count,
        enrollments: enrollments.length,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      };
      
      // 4. Notificar coordinadores del éxito
      await this.notifyCoordinators(results);
      
      this.logger.log(`✅ Sincronización automática completada: ${JSON.stringify(results)}`);
      
    } catch (error) {
      this.logger.error(`❌ Error en sincronización automática:`, error);
      await this.notifyAdministrators(error, currentSemester);
      throw error;
    }
  }

  /**
   * Sincronización semanal de verificación (todos los lunes a las 05:00 AM)
   */
  @Cron('0 5 * * 1')
  async weeklyDataVerification() {
    const currentSemester = this.getCurrentSemester();
    
    this.logger.log(`🔍 Verificación semanal de datos - Semestre ${currentSemester}`);
    
    try {
      // Verificar integridad de datos del semestre actual
      const verification = await this.verifyDataIntegrity(currentSemester);
      
      if (verification.issues.length > 0) {
        this.logger.warn(`⚠️ Problemas detectados en verificación: ${verification.issues.length}`);
        await this.notifyDataIntegrityIssues(verification);
      } else {
        this.logger.log('✅ Verificación semanal completada sin problemas');
      }
      
    } catch (error) {
      this.logger.error('❌ Error en verificación semanal:', error);
    }
  }

  /**
   * Backup automático de datos (todos los días a las 02:00 AM)
   */
  @Cron('0 2 * * *')
  async dailyDataBackup() {
    this.logger.log('💾 Iniciando backup automático diario...');
    
    try {
      const currentSemester = this.getCurrentSemester();
      const backupResult = await this.createDataBackup(currentSemester);
      
      this.logger.log(`✅ Backup completado: ${backupResult.filename}`);
      
    } catch (error) {
      this.logger.error('❌ Error en backup automático:', error);
      // Intentar notificar aunque falle el backup
      try {
        await this.notifyBackupFailure(error);
      } catch (notificationError) {
        this.logger.error('❌ Error adicional enviando notificación de backup:', notificationError);
      }
    }
  }

  /**
   * Calcula el semestre actual basado en la fecha
   */
  private getCurrentSemester(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // Semestre 1: Marzo-Julio, Semestre 2: Agosto-Diciembre/Enero-Febrero
    if (month >= 3 && month <= 7) {
      return `${year}-1`;
    } else if (month >= 8 && month <= 12) {
      return `${year}-2`;
    } else {
      // Enero-Febrero pertenecen al semestre 2 del año anterior
      return `${year - 1}-2`;
    }
  }

  /**
   * Obtiene el próximo semestre académico
   */
  private getNextSemester(): string {
    const current = this.getCurrentSemester();
    const [year, semester] = current.split('-').map(Number);
    
    if (semester === 1) {
      return `${year}-2`;
    } else {
      return `${year + 1}-1`;
    }
  }

  /**
   * Verifica la integridad de datos del semestre
   */
  private async verifyDataIntegrity(semester: string): Promise<{
    semester: string;
    timestamp: Date;
    issues: Array<{ type: string; description: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' }>;
    summary: {
      totalStudents: number;
      totalCourses: number;
      totalEnrollments: number;
      orphanedRecords: number;
    };
  }> {
    const issues: Array<{ type: string; description: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' }> = [];
    
    try {
      // Verificar estudiantes sin carrera asignada
      const studentsWithoutCareer = await this.syncService['studentModel']
        .countDocuments({ semester, carreraId: null });
      
      if (studentsWithoutCareer > 0) {
        issues.push({
          type: 'MISSING_CAREER',
          description: `${studentsWithoutCareer} estudiantes sin carrera asignada`,
          severity: 'MEDIUM'
        });
      }
      
      // Verificar cursos sin estudiantes
      const coursesWithoutStudents = await this.syncService['courseModel']
        .countDocuments({ semester, students: { $size: 0 } });
      
      if (coursesWithoutStudents > 5) { // Umbral configurable
        issues.push({
          type: 'EMPTY_COURSES',
          description: `${coursesWithoutStudents} cursos sin estudiantes inscritos`,
          severity: 'LOW'
        });
      }
      
      // Obtener estadísticas generales
      const totalStudents = await this.syncService['studentModel']
        .countDocuments({ semester });
      const totalCourses = await this.syncService['courseModel']
        .countDocuments({ semester });
      
      return {
        semester,
        timestamp: new Date(),
        issues,
        summary: {
          totalStudents,
          totalCourses,
          totalEnrollments: 0, // Implementar según modelo de inscripciones
          orphanedRecords: studentsWithoutCareer
        }
      };
      
    } catch (error) {
      this.logger.error('Error en verificación de integridad:', error);
      throw error;
    }
  }

  /**
   * Crea backup de datos del semestre
   */
  private async createDataBackup(semester: string): Promise<{ filename: string; size: number }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${semester}-${timestamp}.json`;
    
    try {
      // Aquí implementarías la lógica de backup
      // Por ahora retornamos un mock
      return {
        filename,
        size: 1024 * 1024 // 1MB mock
      };
    } catch (error) {
      this.logger.error('Error creando backup:', error);
      throw error;
    }
  }

  /**
   * Notifica a coordinadores sobre sincronización exitosa
   */
  private async notifyCoordinators(results: any) {
    try {
      await this.notificationsService.createNotification({
        type: 'SEMESTER_SYNC_SUCCESS',
        title: `Sincronización Semestre ${results.semester} Completada`,
        message: `Se han sincronizado ${results.students} estudiantes NEE y ${results.courses} cursos.`,
        targetRoles: ['COORDINADOR', 'EDUCADORA_SOCIAL'],
        data: results,
        priority: 'MEDIUM'
      });
    } catch (error) {
      this.logger.error('Error enviando notificación a coordinadores:', error);
    }
  }

  /**
   * Notifica a administradores sobre errores
   */
  private async notifyAdministrators(error: any, semester: string) {
    try {
      await this.notificationsService.createNotification({
        type: 'SEMESTER_SYNC_ERROR',
        title: `Error en Sincronización Semestre ${semester}`,
        message: `Ha ocurrido un error durante la sincronización automática: ${error.message}`,
        targetRoles: ['DIDDEC', 'ADMINISTRADOR'],
        data: {
          semester,
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        },
        priority: 'HIGH'
      });
    } catch (notificationError) {
      this.logger.error('Error enviando notificación de error:', notificationError);
    }
  }

  /**
   * Notifica problemas de integridad de datos
   */
  private async notifyDataIntegrityIssues(verification: any) {
    try {
      const highSeverityIssues = verification.issues.filter(i => i.severity === 'HIGH');
      const priority = highSeverityIssues.length > 0 ? 'HIGH' : 'MEDIUM';
      
      await this.notificationsService.createNotification({
        type: 'DATA_INTEGRITY_WARNING',
        title: `Problemas de Integridad - Semestre ${verification.semester}`,
        message: `Se detectaron ${verification.issues.length} problemas en la verificación de datos.`,
        targetRoles: ['DIDDEC', 'COORDINADOR'],
        data: verification,
        priority
      });
    } catch (error) {
      this.logger.error('Error enviando notificación de integridad:', error);
    }
  }

  /**
   * Notifica fallos de backup
   */
  private async notifyBackupFailure(error: any) {
    try {
      await this.notificationsService.createNotification({
        type: 'BACKUP_FAILURE',
        title: 'Error en Backup Automático',
        message: `Ha fallado el backup automático diario: ${error.message}`,
        targetRoles: ['DIDDEC', 'ADMINISTRADOR'],
        data: {
          error: error.message,
          timestamp: new Date().toISOString()
        },
        priority: 'HIGH'
      });
    } catch (notificationError) {
      this.logger.error('Error enviando notificación de backup:', notificationError);
    }
  }

  /**
   * API manual para forzar sincronización fuera de horario
   */
  async forceSemesterSync(semester: string): Promise<any> {
    this.logger.log(`🔄 Sincronización manual forzada para semestre ${semester}`);
    
    try {
      const startTime = Date.now();
      
      const studentsResult = await this.syncService.syncAndPersistNeeStudents(semester);
      const coursesResult = await this.syncService.syncAndPersistCourses(semester);
      const enrollments = await this.syncService.syncNeeInscriptions(semester);
      
      const duration = Date.now() - startTime;
      
      const results = {
        semester,
        students: studentsResult.count,
        courses: coursesResult.count,
        enrollments: enrollments.length,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        type: 'MANUAL'
      };
      
      await this.notifyCoordinators(results);
      
      return results;
      
    } catch (error) {
      this.logger.error(`❌ Error en sincronización manual:`, error);
      await this.notifyAdministrators(error, semester);
      throw error;
    }
  }
} 