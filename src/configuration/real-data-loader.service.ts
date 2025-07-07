import { Injectable, Logger } from '@nestjs/common';
import { HawaiiSyncService } from '../hawaii/hawaii-sync.service';

@Injectable()
export class RealDataLoaderService {
  private readonly logger = new Logger(RealDataLoaderService.name);

  constructor(private readonly hawaiiSyncService: HawaiiSyncService) {}

  /**
   * Carga datos reales de Hawaii y estudiantes NEE a la BD
   * @param semestre Semestre a cargar (ej: '2025-2')
   */
  async cargarDatosReales(semestre: string) {
    this.logger.log(`Iniciando carga de datos reales para el semestre ${semestre}`);
    const resultado = await this.hawaiiSyncService.syncAllNeeData(semestre);
    if (resultado.success) {
      this.logger.log('✅ Carga de datos reales completada con éxito.');
    } else {
      this.logger.error('❌ Carga de datos reales finalizada con errores.');
    }
    return resultado;
  }
}
