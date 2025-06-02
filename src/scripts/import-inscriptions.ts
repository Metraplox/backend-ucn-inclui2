import * as fs from 'fs';
import * as path from 'path';
import { connect, connection } from 'mongoose';
import { Enrollment, EnrollmentDocument, EnrollmentSchema } from '../enrollments/schemas/enrollment.schema';
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inclui2';
const INSCRIPTIONS_FILE = path.resolve(__dirname, '../../GUIA-PROYECTO/json-inscripcion-hawaii.txt');

async function extractInscriptions(): Promise<any[]> {
  const raw = fs.readFileSync(INSCRIPTIONS_FILE, 'utf-8');
  let data: any[] = [];
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('Error parsing inscriptions file:', e);
    process.exit(1);
  }
  // Solo campos reales
  return data.map((i) => ({
    nrc: i.nrc,
    rut: i.rut,
    // Agregar más campos si existen en el archivo real
  }));
}

async function main() {
  await connect(MONGODB_URI);
  // Usar type casting para evitar errores de tipo
  const enrollmentModel = connection.model<EnrollmentDocument>('Enrollment', EnrollmentSchema as any);

  const inscriptions = await extractInscriptions();
  let inserted = 0;
  for (const insc of inscriptions) {
    if (!insc.nrc || !insc.rut) {
      console.log(`[SKIP] Faltan campos obligatorios para inscripción:`, insc);
      continue;
    }
    // Obtener semestre actual (podría venir del archivo o usar un valor por defecto)
    const semester = insc.semester || '2025-1';
    
    // Evitar duplicados por NRC+RUT+semester
    const exists = await enrollmentModel.findOne({ 
      nrc: insc.nrc, 
      studentRut: insc.rut,
      semester: semester 
    });
    if (exists) {
      console.log(`[SKIP] Inscripción ya existe: NRC ${insc.nrc}, RUT ${insc.rut}, Semestre ${semester}`);
      continue;
    }
    
    // Crear documento con el modelo de Enrollment
    const doc = new enrollmentModel({
      nrc: insc.nrc,
      studentRut: insc.rut,
      semester: semester,
      active: true
    });
    await doc.save();
    inserted++;
    console.log(`[OK] Insertada inscripción: NRC ${insc.nrc}, RUT ${insc.rut}, Semestre ${semester}`);
  }
  console.log(`\nTotal inscripciones insertadas: ${inserted}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error en importación:', err);
  process.exit(1);
});
