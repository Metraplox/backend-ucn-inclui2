import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Adjustment, AdjustmentDocument, AdjustmentStatus } from '../schemas/adjustment.schema';

@Injectable()
export class AdjustmentTasksService {
  private readonly logger = new Logger(AdjustmentTasksService.name);

  constructor(
    @InjectModel(Adjustment.name) private adjustmentModel: Model<AdjustmentDocument>,
  ) {}

  /**
   * Tarea programada que se ejecuta todos los días a la medianoche.
   * Busca todos los ajustes 'activos' cuya fecha de vencimiento ya pasó y los marca como 'vencidos'.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'expireStudentAdjustments',
    timeZone: 'America/Santiago', // ¡IMPORTANTE! Ajusta a tu zona horaria local.
  })
  async handleExpireAdjustments() {
    this.logger.log('Iniciando tarea programada: Expirar Ajustes Razonables...');

    const today = new Date();
    // Normalizamos 'today' para que sea el inicio del día (00:00:00) para evitar problemas de zona horaria.
    today.setHours(0, 0, 0, 0);

    try {
      // Usamos updateMany con arrayFilters para actualizar solo los subdocumentos que cumplen la condición.
      // Esto es mucho más eficiente que buscar, iterar y guardar cada documento.
      const result = await this.adjustmentModel.updateMany(
        {
          // Filtramos documentos que *podrían* tener ajustes para expirar.
          'currentAdjustments.estado': AdjustmentStatus.ACTIVE,
          'currentAdjustments.expirationDate': { $lt: today },
        },
        {
          // La operación de actualización.
          $set: { 'currentAdjustments.$[elem].estado': AdjustmentStatus.EXPIRED },
        },
        {
          // El filtro que define qué elementos 'elem' del array serán actualizados.
          arrayFilters: [
            {
              'elem.estado': AdjustmentStatus.ACTIVE,
              'elem.expirationDate': { $lt: today },
            },
          ],
        },
      );

      if (result.modifiedCount > 0) {
        this.logger.log(`Tarea completada: ${result.modifiedCount} ajuste(s) fueron marcados como 'vencidos'.`);
      } else {
        this.logger.log('Tarea completada: No se encontraron ajustes para expirar.');
      }
    } catch (error) {
      this.logger.error('Error durante la ejecución de la tarea de expiración de ajustes.', error.stack);
    }
  }
}