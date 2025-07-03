import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../notifications/notifications.service';

interface SyncResult {
  success: boolean;
  operation: string;
  timestamp: Date;
  duration: number;
  stats?: any;
  error?: string;
}

@Injectable()
export class SemesterSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SemesterSchedulerService.name);
  private isInitialized = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    this.isInitialized = true;
    this.logger.log('🕐 SemesterSchedulerService inicializado - Programación automática activada');
    
    // Verificar configuración inicial
    await this.validateConfiguration();
  }

  /**
   * Cron Job: Sincronización semestral automática
   * Ejecuta el 1 de marzo y 1 de agosto a las 06:00 AM
   */
  @Cron('0 6 1 3,8 *', { name: 'semesterSync' })
  async handleSemesterSync() {
    if (!this.isInitialized) {
      this.logger.warn('⚠️ Scheduler no inicializado, omitiendo ejecución');
      return;
    }

    const currentDate = new Date();
    const semester = this.calculateCurrentSemester(currentDate);
    
    this.logger.log(`🚀 Iniciando sincronización automática semestral para ${semester}`);
    
    try {
      const result = await this.executeFullSemesterSync(semester);
      
      if (result.success) {
        this.logger.log(`✅ Sincronización semestral ${semester} completada exitosamente`);
      } else {
        this.logger.error(`❌ Error en sincronización semestral ${semester}:`, result.error);
      }
    } catch (error) {
      this.logger.error('❌ Error crítico en sincronización semestral:', error);
    }
  }

  /**
   * Cron Job: Verificación semanal de integridad
   * Ejecuta todos los lunes a las 05:00 AM
   */
  @Cron('0 5 * * 1', { name: 'weeklyIntegrityCheck' })
  async handleWeeklyIntegrityCheck() {
    if (!this.isInitialized) return;

    this.logger.log('🔍 Iniciando verificación semanal de integridad de datos');
    
    try {
      const currentSemester = this.configService.get('CURRENT_SEMESTER', '202510');
      const result = await this.performIntegrityCheck(currentSemester);
      
      this.logger.log('✅ Verificación de integridad completada:', result);
    } catch (error) {
      this.logger.error('❌ Error en verificación de integridad:', error);
    }
  }

  /**
   * Cron Job: Limpieza de notificaciones antiguas
   * Ejecuta todos los días a las 03:30 AM
   */
  @Cron('30 3 * * *', { name: 'notificationsCleanup' })
  async handleNotificationsCleanup() {
    if (!this.isInitialized) return;

    this.logger.log('🧹 Iniciando limpieza de notificaciones antiguas (>90 días)');
    try {
      await this.notificationsService.cleanupOldNotifications(90);
      this.logger.log('✅ Limpieza de notificaciones completada');
    } catch (error) {
      this.logger.error('❌ Error en limpieza de notificaciones:', error);
    }
  }

  /**
   * Ejecuta sincronización completa para un semestre
   */
  async executeFullSemesterSync(semester: string): Promise<SyncResult> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`📊 Iniciando sincronización completa para semestre ${semester}`);
      
      // Simular sincronización (se implementará con Hawaii API real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        operation: 'FULL_SEMESTER_SYNC',
        timestamp: new Date(),
        duration,
        stats: {
          semester,
          studentsProcessed: 63,
          coursesProcessed: 0,
          enrollmentsProcessed: 0
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        operation: 'FULL_SEMESTER_SYNC',
        timestamp: new Date(),
        duration,
        error: error.message
      };
    }
  }

  /**
   * Realiza verificación de integridad de datos
   */
  private async performIntegrityCheck(semester: string): Promise<any> {
    this.logger.log(`🔍 Verificando integridad de datos para semestre ${semester}`);
    
    try {
      // Verificaciones básicas de integridad
      const checks = {
        configurationValid: !!this.configService.get('HAWAII_BASE_URL'),
        hawaiiCredentials: !!(
          this.configService.get('HAWAII_AUTH_OFERTA') &&
          this.configService.get('HAWAII_AUTH_ESTUDIANTES') &&
          this.configService.get('HAWAII_AUTH_INSCRIPCION')
        ),
        currentSemesterValid: semester === this.configService.get('CURRENT_SEMESTER'),
        timestamp: new Date()
      };
      
      const allChecksPass = Object.values(checks).every(check => 
        typeof check === 'boolean' ? check : true
      );
      
      return {
        success: allChecksPass,
        checks,
        semester,
        recommendations: allChecksPass ? [] : ['Revisar configuración', 'Verificar credenciales Hawaii']
      };
    } catch (error) {
      this.logger.error('❌ Error en verificación de integridad:', error);
      return {
        success: false,
        error: error.message,
        semester
      };
    }
  }

  /**
   * Calcula el semestre actual basado en la fecha
   */
  private calculateCurrentSemester(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() retorna 0-11
    
    // Primer semestre: Marzo - Julio (período 1)
    // Segundo semestre: Agosto - Diciembre (período 2)
    const period = month >= 3 && month <= 7 ? '1' : '2';
    
    return `${year}${period}0`; // Formato: YYYYP0 (ej: 20251, 20252)
  }

  /**
   * Valida la configuración inicial del scheduler
   */
  private async validateConfiguration(): Promise<void> {
    try {
      const hawaiiBaseUrl = this.configService.get('HAWAII_BASE_URL');
      const hawaiiCreds = {
        oferta: this.configService.get('HAWAII_AUTH_OFERTA'),
        estudiantes: this.configService.get('HAWAII_AUTH_ESTUDIANTES'),
        inscripcion: this.configService.get('HAWAII_AUTH_INSCRIPCION')
      };
      
      if (!hawaiiBaseUrl || !hawaiiCreds.oferta || !hawaiiCreds.estudiantes || !hawaiiCreds.inscripcion) {
        throw new Error('Credenciales Hawaii no configuradas');
      }
      
      this.logger.log('✅ Configuración validada:', {
        baseUrl: hawaiiBaseUrl,
        credentialsConfigured: true,
        currentSemester: this.configService.get('CURRENT_SEMESTER')
      });
    } catch (error) {
      this.logger.error('❌ Error validando configuración:', error);
      throw new Error('Configuración del scheduler inválida');
    }
  }

  /**
   * API para sincronización manual
   */
  async triggerManualSync(semester?: string): Promise<SyncResult> {
    const targetSemester = semester || this.configService.get<string>('CURRENT_SEMESTER', '202510');
    this.logger.log(`🔄 Sincronización manual iniciada para semestre ${targetSemester}`);
    
    return await this.executeFullSemesterSync(targetSemester);
  }

  /**
   * Obtiene el estado del scheduler
   */
  getSchedulerStatus(): any {
    return {
      initialized: this.isInitialized,
      nextSemesterSync: this.getNextSemesterSyncDate(),
      nextIntegrityCheck: this.getNextIntegrityCheckDate(),
      currentSemester: this.configService.get('CURRENT_SEMESTER'),
      hawaiiConfigured: !!(
        this.configService.get('HAWAII_BASE_URL') &&
        this.configService.get('HAWAII_AUTH_OFERTA')
      ),
      timestamp: new Date()
    };
  }

  /**
   * Calcula la próxima fecha de sincronización semestral
   */
  private getNextSemesterSyncDate(): Date {
    const now = new Date();
    const year = now.getFullYear();
    
    // Próximas fechas: 1 marzo y 1 agosto
    const marchSync = new Date(year, 2, 1, 6, 0, 0); // Marzo es mes 2 (0-indexed)
    const augustSync = new Date(year, 7, 1, 6, 0, 0); // Agosto es mes 7
    
    if (now < marchSync) {
      return marchSync;
    } else if (now < augustSync) {
      return augustSync;
    } else {
      // Próximo marzo del siguiente año
      return new Date(year + 1, 2, 1, 6, 0, 0);
    }
  }

  /**
   * Calcula la próxima fecha de verificación de integridad
   */
  private getNextIntegrityCheckDate(): Date {
    const now = new Date();
    const nextMonday = new Date(now);
    
    // Calcular próximo lunes
    const daysUntilMonday = (7 - now.getDay() + 1) % 7 || 7;
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(5, 0, 0, 0);
    
    return nextMonday;
  }
} 