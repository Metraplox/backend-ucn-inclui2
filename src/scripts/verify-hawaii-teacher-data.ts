import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { HawaiiService } from '../hawaii/hawaii.service';
import { Logger } from '@nestjs/common';

/**
 * Este script verifica el formato de los datos del profesor que devuelve el endpoint de Hawaii.
 * Llama a la API de Hawaii, busca el primer curso con un profesor asignado y muestra
 * el objeto completo del curso en la consola para su inspección.
 */
async function bootstrap() {
  const logger = new Logger('VerifyHawaiiTeacherData');
  logger.log('🚀 Iniciando la verificación de datos de profesores de Hawaii...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const hawaiiService = app.get(HawaiiService);

  const semester = '202510'; // Usamos un semestre conocido para la prueba
  logger.log(`🔍 Obteniendo oferta académica para el semestre: ${semester}`);

  try {
    const { data: courses } = await hawaiiService.getOferta(semester);
    logger.log(`✅ Se encontraron ${courses.length} cursos en total.`);

    // Buscar el primer curso que tenga un profesor definido
    const courseWithTeacher = courses.find(course => {
      // El campo del profesor puede tener distintos nombres, probamos los más comunes
      const teacherField = (course as any).profesor || (course as any).docente || (course as any).instructor;
      return teacherField && typeof teacherField === 'string' && teacherField.trim() !== '';
    });

    if (courses.length > 0) {
        logger.log('🔍 Mostrando los primeros 5 cursos recibidos para inspección:');
        console.log(JSON.stringify(courses.slice(0, 5), null, 2));
    }

    if (courseWithTeacher) {
      logger.log('🎉 ¡Curso con profesor encontrado! Mostrando datos en bruto:');
      console.log(JSON.stringify(courseWithTeacher, null, 2));
    } else {
      logger.warn('🤔 No se encontró ningún curso con profesor asignado en la muestra.');
    }
  } catch (error) {
    logger.error('❌ Error al verificar los datos de Hawaii:', error.stack);
  } finally {
    await app.close();
    logger.log('🏁 Verificación finalizada.');
  }
}

bootstrap();
