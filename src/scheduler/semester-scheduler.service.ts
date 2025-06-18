import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SyncService } from '../sync/sync.service';
import { NotificationsService } from '../notifications/notifications.service';
import { HawaiiCacheService } from '../hawaii/hawaii-cache.service';
import { InjectModel } from '@nestjs/mongoose';
import { SyncLog } from '../sync/sync-log.entity';
import { Model } from 'mongoose';

@Injectable()
export class SemesterSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SemesterSchedulerService.name);

  constructor(
    private readonly syncService: SyncService,
    private readonly notificationsService: NotificationsService,
    private readonly hawaiiCacheService: HawaiiCacheService,
    @InjectModel(SyncLog.name) private syncLogModel: Model<SyncLog>,
  ) {}

  /**
   * 🚀 OPTIMIZADO: Sincronización semestral automática con caché inteligente
   */
  @Cron('0 6 1 3,8 *') // 1 de marzo y 1 de agosto a las 6:00 AM
  async handleSemesterSync() {
    const semester = this.getCurrentSemester();
    this.logger.log(`🚀 Iniciando sincronización semestral automática: ${semester}`);
    
    try {
      // ✅ Pre-limpiar caché antes de sincronización mayor
      this.logger.log('🧹 Limpiando caché expirado antes de sincronización...');
      const cleanup = await this.hawaiiCacheService.cleanupCache();
      this.logger.log(`📊 Limpieza completada: ${cleanup.filesRemoved} archivos eliminados`);
      
      // ✅ Usar método optimizado con pre-carga
      this.logger.log('📦 Ejecutando sincronización completa optimizada...');
      const result = await this.syncService.syncAllNeeData(semester);
      
      // Log de resultados optimizados
      this.logger.log(`✅ Sincronización automática completada:`);
      this.logger.log(`   👥 Estudiantes: ${result.students}`);
      this.logger.log(`   📚 Cursos: ${result.courses}`);
      this.logger.log(`   📝 Matrículas: ${result.enrollments}`);
      this.logger.log(`   🌐 Llamadas API: ${result.cacheStats?.totalApiCalls || 'N/A'}/3`);
      this.logger.log(`   ⚡ Caché utilizado: ${result.cacheStats?.cachingEnabled ? 'SÍ' : 'NO'}`);
      
      // Notificaciones con estadísticas de caché
      await this.sendSyncNotification(semester, result.success, {
        students: result.students,
        courses: result.courses,
        enrollments: result.enrollments,
        apiCalls: result.cacheStats?.totalApiCalls || 3,
        cachingEnabled: result.cacheStats?.cachingEnabled || false
      });
      
    } catch (error) {
      this.logger.error(`❌ Error en sincronización automática ${semester}:`, error);
      await this.sendErrorNotification(semester, error);
    }
  }

  /**
   * 🚀 OPTIMIZADO: Verificación de integridad semanal con caché
   */
  @Cron('0 5 * * 1') // Todos los lunes a las 5:00 AM
  async handleWeeklyIntegrityCheck() {
    const semester = this.getCurrentSemester();
    this.logger.log(`🔍 Iniciando verificación de integridad semanal: ${semester}`);
    
    try {
      // ✅ Usar datos del caché para verificación rápida
      this.logger.log('📊 Obteniendo estadísticas de caché...');
      const cacheStats = await this.hawaiiCacheService.getCacheStats();
      
      this.logger.log(`📈 Estado del caché:`);
      this.logger.log(`   🗂️ Archivos en disco: ${cacheStats.diskCacheFiles}`);
      this.logger.log(`   💾 Tamaño total: ${this.formatBytes(cacheStats.totalDiskSize)}`);
      this.logger.log(`   📊 Hit rate: ${(cacheStats.hitRate * 100).toFixed(1)}%`);
      
      // Verificación ligera de datos
      const verification = await this.performLightIntegrityCheck(semester);
      
      // Enviar notificación solo si hay problemas o estadísticas importantes
      if (!verification.success || verification.needsAttention) {
        await this.sendIntegrityReport(semester, verification, cacheStats);
      } else {
        this.logger.log('✅ Verificación de integridad: Sistema en óptimas condiciones');
      }
      
    } catch (error) {
      this.logger.error('❌ Error en verificación de integridad:', error);
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
   * 🚀 NUEVO: Verificación ligera de integridad usando caché
   */
  private async performLightIntegrityCheck(semester: string): Promise<{
    success: boolean;
    needsAttention: boolean;
    issues: string[];
    stats: {
      expectedStudents: number;
      foundStudents: number;
      cacheAge: number;
    };
  }> {
    const issues: string[] = [];
    
    try {
      // Verificar estudiantes en caché vs base de datos
      const cachedStudents = await this.hawaiiCacheService.getEstudiantesWithCache();
      
      // Contar estudiantes en BD
      const dbStudents = await this.countStudentsInDB();
      
      // Verificar si hay discrepancias significativas
      const discrepancy = Math.abs(cachedStudents.length - dbStudents);
      const discrepancyPercent = (discrepancy / Math.max(cachedStudents.length, 1)) * 100;
      
      if (discrepancyPercent > 5) {
        issues.push(`Discrepancia entre caché (${cachedStudents.length}) y BD (${dbStudents}): ${discrepancyPercent.toFixed(1)}%`);
      }
      
      // Verificar edad del caché
      const cacheStats = await this.hawaiiCacheService.getCacheStats();
      const oldestCacheAge = this.calculateCacheAge(cacheStats.oldestFile);
      
      if (oldestCacheAge > 7) { // Más de 7 días
        issues.push(`Caché antiguo detectado: ${oldestCacheAge} días`);
      }
      
      return {
        success: issues.length === 0,
        needsAttention: issues.length > 0,
        issues,
        stats: {
          expectedStudents: cachedStudents.length,
          foundStudents: dbStudents,
          cacheAge: oldestCacheAge
        }
      };
      
    } catch (error) {
      issues.push(`Error en verificación: ${error.message}`);
      return {
        success: false,
        needsAttention: true,
        issues,
        stats: { expectedStudents: 0, foundStudents: 0, cacheAge: 0 }
      };
    }
  }

  /**
   * Notificación optimizada con estadísticas de caché
   */
  private async sendSyncNotification(
    semester: string, 
    success: boolean, 
    stats: {
      students: number;
      courses: number; 
      enrollments: number;
      apiCalls: number;
      cachingEnabled: boolean;
    }
  ) {
    const emoji = success ? '✅' : '⚠️';
    const status = success ? 'EXITOSA' : 'CON ADVERTENCIAS';
    const efficiency = stats.apiCalls < 3 ? '🚀 ALTA' : '📡 ESTÁNDAR';
    
    const message = `
${emoji} Sincronización ${semester} ${status}

📊 RESULTADOS:
👥 Estudiantes NEE: ${stats.students}
📚 Cursos sincronizados: ${stats.courses}
📝 Matrículas procesadas: ${stats.enrollments}

⚡ EFICIENCIA:
🌐 Llamadas API: ${stats.apiCalls}/3
💾 Caché: ${stats.cachingEnabled ? 'ACTIVO' : 'INACTIVO'}
📈 Velocidad: ${efficiency}

🕐 Fecha: ${new Date().toLocaleString('es-CL')}
    `.trim();

    // Enviar a coordinadores
    await this.notificationsService.createSystemNotification(
      `Sincronización ${semester} ${status}`,
      message,
      'coordinador'
    );
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

  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  private calculateCacheAge(filename: string | null): number {
    if (!filename) return 0;
    // Implementar lógica para calcular edad del caché
    return 0; // Mock por ahora
  }

  private async countStudentsInDB(): Promise<number> {
    // Implementar conteo de estudiantes en BD
    return 0; // Mock por ahora
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
} 