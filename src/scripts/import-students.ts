import * as fs from 'fs';
import * as path from 'path';
import { connect, connection } from 'mongoose';
import { Student, StudentDocument, StudentSchema } from '../students/schemas/student.schema';
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inclui2';

const STUDENTS_FILE = path.resolve(__dirname, '../../GUIA-PROYECTO/json_estudiantes-hawaii.txt');

async function extractStudents(): Promise<any[]> {
  const raw = fs.readFileSync(STUDENTS_FILE, 'utf-8');
  let data: any[] = [];
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('Error parsing students file:', e);
    process.exit(1);
  }
  // Solo campos reales, nunca ficticios
  return data.map((s) => ({
    rut: s.rut,
    apellidos: s.apellidos,
    nombres: s.nombres,
    email_ucn: s.email_ucn || null,
    // carrera: asociar si existe campo, si no dejar null
    carrera: s.carrera || null,
  }));
}

async function main() {
  await connect(MONGODB_URI);
  // Usar type casting para evitar errores de tipo
  const studentModel = connection.model<StudentDocument>('Student', StudentSchema as any);

  const students = await extractStudents();
  let inserted = 0;
  for (const student of students) {
    if (!student.rut || !student.apellidos || !student.nombres) {
      console.log(`[SKIP] Faltan campos obligatorios para estudiante:`, student);
      continue;
    }
    // Validar formato de RUT si es necesario (ejemplo: solo números y K)
    if (!/^\d{7,8}-?[\dkK]$/.test(student.rut)) {
      console.log(`[SKIP] RUT inválido: ${student.rut}`);
      continue;
    }
    // Evitar duplicados
    const exists = await studentModel.findOne({ rut: student.rut });
    if (exists) {
      console.log(`[SKIP] Estudiante ya existe: ${student.rut}`);
      continue;
    }
    const doc = new studentModel(student);
    await doc.save();
    inserted++;
    console.log(`[OK] Insertado: ${student.nombres} ${student.apellidos} (${student.rut})`);
  }
  console.log(`\nTotal estudiantes insertados: ${inserted}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error en importación:', err);
  process.exit(1);
});
