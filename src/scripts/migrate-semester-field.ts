/**
 * Script de migración para estandarizar el campo semester en la colección de estudiantes
 *
 * Este script busca estudiantes que tengan el campo 'semestre' y copia su valor al campo 'semester'
 * para mantener la consistencia en toda la aplicación.
 */

import { connect, connection } from 'mongoose';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const logger = new Logger('MigrateSemesterScript');

async function migrateSemesterField() {
  try {
    // Conectar a MongoDB
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/inclui2';
    await connect(mongoUri);
    logger.log('✅ Conectado a MongoDB');

    // Verificar que la conexión a la base de datos esté establecida
    if (!connection.db) {
      throw new Error('No se pudo establecer conexión con la base de datos');
    }

    // Acceder a la colección de estudiantes
    const studentsCollection = connection.db.collection('students');

    // Buscar estudiantes que tengan el campo 'semestre' y migrarlo a 'semester'
    const studentsWithSemestre = await studentsCollection
      .find({
        semestre: { $exists: true },
      })
      .toArray();

    logger.log(
      `📊 Se encontraron ${studentsWithSemestre.length} estudiantes con campo 'semestre' para migrar a 'semester'`,
    );

    // Actualizar cada estudiante para convertir 'semestre' a 'semester'
    let migratedSemestreCount = 0;
    for (const student of studentsWithSemestre) {
      await studentsCollection.updateOne(
        { _id: student._id },
        {
          $set: { semester: student.semestre },
        },
      );
      migratedSemestreCount++;
    }

    logger.log(
      `✅ Migración 'semestre' a 'semester' completada. ${migratedSemestreCount} estudiantes actualizados.`,
    );

    // Como segunda parte, actualizar los documentos que no tienen 'semester' pero tienen otro campo que podría usarse
    // Por ejemplo, semesterValue, semestreAcademico, etc.
    const studentsWithoutSemester = await studentsCollection
      .find({
        semester: { $exists: false },
      })
      .toArray();

    logger.log(
      `📊 Se encontraron ${studentsWithoutSemester.length} estudiantes sin campo 'semester'`,
    );

    // Establecer un valor por defecto para el semestre actual
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const defaultSemester = `${currentYear}-${currentMonth < 6 ? '1' : '2'}`;

    let defaultSemesterCount = 0;
    for (const student of studentsWithoutSemester) {
      await studentsCollection.updateOne(
        { _id: student._id },
        {
          $set: { semester: defaultSemester },
        },
      );
      defaultSemesterCount++;
    }

    logger.log(
      `✅ Valor por defecto establecido para ${defaultSemesterCount} estudiantes: ${defaultSemester}`,
    );

    // Finalmente, remover el campo 'semestre' para mantener consistencia
    const result = await studentsCollection.updateMany(
      { semestre: { $exists: true } },
      { $unset: { semestre: '' } },
    );

    logger.log(
      `🗑️ Campo 'semestre' eliminado en ${result.modifiedCount} documentos`,
    );

    logger.log('🎉 Migración completada exitosamente.');
  } catch (error) {
    logger.error('❌ Error durante la migración:', error);
  } finally {
    // Cerrar la conexión a MongoDB
    await connection.close();
    logger.log('🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar la migración
migrateSemesterField();
