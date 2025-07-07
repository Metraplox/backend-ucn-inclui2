import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RealDataLoaderService } from '../configuration/real-data-loader.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'error', 'warn', 'debug'] });
  const loader = app.get(RealDataLoaderService);
  const semestre = process.argv[2] || '2025-2';
  console.log(`Iniciando carga real de datos para el semestre: ${semestre}`);
  try {
    const result = await loader.cargarDatosReales(semestre);
    console.log('Resultado:', JSON.stringify(result, null, 2));
    if (!result.success) process.exit(1);
  } catch (err) {
    console.error('Error en la carga real:', err);
    process.exit(2);
  } finally {
    await app.close();
  }
}

main();
