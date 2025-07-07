
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const logger = {
  log: (message: string) => console.log(`[LOG] ${message}`),
  error: (message: string, trace?: any) => console.error(`[ERROR] ${message}`, trace),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
};

async function directHawaiiCheck() {
  logger.log('🚀 Iniciando la verificación directa de la API de Hawaii...');

  try {
    // Cargar credenciales directamente
    const credentialsPath = path.resolve(__dirname, '../../config/hawaii-credentials.json');
    logger.log(`🔍 Cargando credenciales desde: ${credentialsPath}`);
    
    if (!fs.existsSync(credentialsPath)) {
      logger.error(`❌ No se encontraron las credenciales en la ruta: ${credentialsPath}`);
      return;
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
    const { username, password, url } = credentials;

    if (!username || !password || !url) {
      logger.error('❌ El archivo de credenciales es inválido o le faltan campos.');
      return;
    }

    const semester = '202510';
    const endpoint = `${url}/oferta/${semester}`;
    logger.log(`📡 Realizando petición a: ${endpoint}`);

    const response = await axios.get(endpoint, {
      auth: {
        username,
        password,
      },
      timeout: 15000 // 15 segundos de timeout
    });

    const courses = response.data;
    logger.log(`✅ Petición exitosa. Se recibieron ${courses.length} cursos.`);

    if (courses.length > 0) {
      logger.log('🔍 Mostrando los primeros 5 cursos recibidos para inspección:');
      console.log(JSON.stringify(courses.slice(0, 5), null, 2));

      const courseWithTeacher = courses.find((course: any) => {
        const teacherField = course.profesor || course.docente || course.instructor;
        return teacherField && typeof teacherField === 'string' && teacherField.trim() !== '';
      });

      if (courseWithTeacher) {
        logger.log('🎉 ¡Curso con profesor encontrado! Mostrando datos en bruto:');
        console.log(JSON.stringify(courseWithTeacher, null, 2));
      } else {
        logger.warn('🤔 No se encontró ningún curso con profesor asignado en la muestra.');
      }
    } else {
      logger.warn('🤔 La API no devolvió ningún curso para el semestre especificado.');
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
        logger.error('❌ Error de Axios al contactar la API de Hawaii:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            data: error.response?.data,
        });
    } else {
        logger.error('❌ Ocurrió un error inesperado:', error);
    }
  } finally {
    logger.log('🏁 Verificación directa finalizada.');
  }
}

directHawaiiCheck();
