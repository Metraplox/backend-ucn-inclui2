import * as fs from 'fs';
import * as path from 'path';
import { connect, connection } from 'mongoose';
import {
  Course,
  CourseDocument,
  CourseSchema,
} from '../courses/schemas/course.schema';
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/inclui2';
const COURSES_FILE = path.resolve(
  __dirname,
  '../../GUIA-PROYECTO/json_oferta-202510-hawaii.txt',
);

function parseProfesores(prof: any): string[] {
  // Si viene como string separados por coma, convertir a array
  if (typeof prof === 'string') {
    return prof
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
  }
  if (Array.isArray(prof)) {
    return prof;
  }
  return [];
}

async function extractCourses(): Promise<any[]> {
  const raw = fs.readFileSync(COURSES_FILE, 'utf-8');
  let data: any[] = [];
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('Error parsing courses file:', e);
    process.exit(1);
  }
  // Solo campos reales
  return data.map((c) => ({
    periodo: c.periodo,
    nrc: c.nrc,
    asignatura: c.asignatura,
    paralelo: c.paralelo,
    codigo: c.codigo,
    sede: c.sede,
    departamento: c.departamento,
    profesores: parseProfesores(c.profesores),
  }));
}

async function main() {
  await connect(MONGODB_URI);
  // Usar type casting para evitar errores de tipo
  const courseModel = connection.model<CourseDocument>(
    'Course',
    CourseSchema as any,
  );

  const courses = await extractCourses();
  let inserted = 0;
  for (const course of courses) {
    if (!course.nrc || !course.codigo || !course.asignatura) {
      console.log(`[SKIP] Faltan campos obligatorios para curso:`, course);
      continue;
    }
    // Evitar duplicados por NRC
    const exists = await courseModel.findOne({ nrc: course.nrc });
    if (exists) {
      console.log(`[SKIP] Curso ya existe: ${course.nrc}`);
      continue;
    }
    const doc = new courseModel(course);
    await doc.save();
    inserted++;
    console.log(`[OK] Insertado curso: ${course.asignatura} (${course.nrc})`);
  }
  console.log(`\nTotal cursos insertados: ${inserted}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error en importación:', err);
  process.exit(1);
});
