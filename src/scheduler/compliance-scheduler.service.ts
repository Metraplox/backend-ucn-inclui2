import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Adjustment } from '../adjustments/schemas/adjustment.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class ComplianceSchedulerService {
  private readonly logger = new Logger(ComplianceSchedulerService.name);

  constructor(
    @InjectModel(Adjustment.name) private adjustmentModel: Model<Adjustment>,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkPendingAdjustments(): Promise<void> {
    this.logger.log('Iniciando verificación diaria de cumplimiento de ajustes');

    try {
      const overdueCutoff = new Date();
      overdueCutoff.setHours(overdueCutoff.getHours() - 72); // 72 horas para revisar

      const overdueAdjustments = await this.adjustmentModel
        .find({
          reviewedAt: null,
          createdAt: { $lt: overdueCutoff },
          isActive: true,
        })
        .populate('studentId', 'firstName lastName email')
        .populate('courseId', 'name teacherId departmentId')
        .exec();

      if (overdueAdjustments.length === 0) {
        this.logger.log('No se encontraron ajustes pendientes fuera de plazo');
        return;
      }

      this.logger.log(
        `Encontrados ${overdueAdjustments.length} ajustes fuera de plazo`,
      );

      // Agrupar por docente
      const adjustmentsByTeacher =
        this.groupAdjustmentsByTeacher(overdueAdjustments);

      // Procesar cada docente con ajustes pendientes
      for (const [teacherId, adjustments] of adjustmentsByTeacher.entries()) {
        await this.processTeacherOverdueAdjustments(teacherId, adjustments);
      }

      this.logger.log('Verificación de cumplimiento completada exitosamente');
    } catch (error) {
      this.logger.error(
        'Error durante la verificación de cumplimiento:',
        error,
      );
    }
  }

  @Cron('0 9 * * MON') // Todos los lunes a las 9 AM
  async sendWeeklyComplianceReport(): Promise<void> {
    this.logger.log('Generando reporte semanal de cumplimiento');

    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const weeklyStats = await this.generateWeeklyStats(oneWeekAgo);

      // Enviar reporte a coordinadores
      const coordinators = await this.usersService.findByRole(
        UserRole.COORDINADOR,
      );

      for (const coordinator of coordinators) {
        await this.notificationsService.createSystemNotification(
          coordinator._id.toString(),
          'Reporte Semanal de Cumplimiento',
          this.formatWeeklyReport(weeklyStats),
          'WEEKLY_REPORT' as any,
          '2025-1', // Semestre actual - esto debería venir de configuración
        );
      }

      this.logger.log('Reporte semanal enviado exitosamente');
    } catch (error) {
      this.logger.error('Error generando reporte semanal:', error);
    }
  }

  @Cron('0 */6 * * *') // Cada 6 horas
  async sendUrgentReminders(): Promise<void> {
    this.logger.log(
      'Verificando ajustes críticos que requieren atención urgente',
    );

    try {
      const urgentCutoff = new Date();
      urgentCutoff.setHours(urgentCutoff.getHours() - 120); // 5 días

      const criticalAdjustments = await this.adjustmentModel
        .find({
          reviewedAt: null,
          createdAt: { $lt: urgentCutoff },
          isActive: true,
        })
        .populate('studentId', 'firstName lastName')
        .populate('courseId', 'name teacherId')
        .exec();

      if (criticalAdjustments.length === 0) {
        return;
      }

      this.logger.warn(
        `Encontrados ${criticalAdjustments.length} ajustes críticos sin revisar`,
      );

      // Notificar a DIDDEC y coordinadores
      const criticalStaff = await this.usersService.findByRoles([
        UserRole.COORDINADOR,
        UserRole.DIDDEC_STAFF,
      ]);

      for (const staff of criticalStaff) {
        await this.notificationsService.createSystemNotification(
          staff._id.toString(),
          'URGENTE: Ajustes críticos sin revisar',
          `Se han detectado ${criticalAdjustments.length} ajustes que llevan más de 5 días sin revisión. Requieren atención inmediata.`,
          'CRITICAL_ALERT' as any,
          '2025-1', // Semestre actual
        );
      }
    } catch (error) {
      this.logger.error('Error verificando ajustes críticos:', error);
    }
  }

  private groupAdjustmentsByTeacher(adjustments: any[]): Map<string, any[]> {
    const grouped = new Map();

    for (const adjustment of adjustments) {
      const teacherId = adjustment.courseId?.teacherId?.toString();
      if (!teacherId) continue;

      if (!grouped.has(teacherId)) {
        grouped.set(teacherId, []);
      }
      grouped.get(teacherId).push(adjustment);
    }

    return grouped;
  }

  private async processTeacherOverdueAdjustments(
    teacherId: string,
    adjustments: any[],
  ): Promise<void> {
    try {
      const teacher = await this.usersService.findById(teacherId);
      if (!teacher) return;

      // Notificar al docente
      await this.notificationsService.createSystemNotification(
        teacherId,
        'Ajustes pendientes de revisión',
        `Tiene ${adjustments.length} ajuste(s) que requieren su revisión urgente.`,
        'OVERDUE_ADJUSTMENTS' as any,
        '2025-1', // Semestre actual
      );

      this.logger.log(
        `Notificaciones enviadas para docente ${teacher.email} (${adjustments.length} ajustes)`,
      );
    } catch (error) {
      this.logger.error(
        `Error procesando ajustes del docente ${teacherId}:`,
        error,
      );
    }
  }

  private async generateWeeklyStats(startDate: Date): Promise<any> {
    const endDate = new Date();

    const totalAdjustments = await this.adjustmentModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const reviewedAdjustments = await this.adjustmentModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      reviewedAt: { $ne: null },
    });

    const pendingAdjustments = await this.adjustmentModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      reviewedAt: null,
    });

    const overdueAdjustments = await this.adjustmentModel.countDocuments({
      createdAt: { $lt: new Date(Date.now() - 72 * 60 * 60 * 1000) },
      reviewedAt: null,
      isActive: true,
    });

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      stats: {
        total: totalAdjustments,
        reviewed: reviewedAdjustments,
        pending: pendingAdjustments,
        overdue: overdueAdjustments,
        complianceRate:
          totalAdjustments > 0
            ? (reviewedAdjustments / totalAdjustments) * 100
            : 0,
      },
    };
  }

  private formatWeeklyReport(stats: any): string {
    const { period, stats: data } = stats;

    return `📊 Reporte Semanal de Cumplimiento (${period.start.toLocaleDateString()} - ${period.end.toLocaleDateString()})

📈 Estadísticas:
• Total de ajustes: ${data.total}
• Ajustes revisados: ${data.reviewed}
• Ajustes pendientes: ${data.pending}
• Ajustes vencidos: ${data.overdue}
• Tasa de cumplimiento: ${data.complianceRate.toFixed(1)}%

${data.overdue > 0 ? '⚠️ Requiere atención: Hay ajustes vencidos que necesitan seguimiento inmediato.' : '✅ Excelente: No hay ajustes vencidos esta semana.'}`;
  }
}
