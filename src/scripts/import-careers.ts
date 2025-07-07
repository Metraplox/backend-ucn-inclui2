import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { connect, connection } from 'mongoose';
import { Career } from '../careers/schemas/career.schema';
import { CareerSchema } from '../careers/schemas/career.schema';
import * as mongoose from 'mongoose';
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Configuración MongoDB desde .env
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/inclui2';

// Archivo fuente de carreras
const NEE_FILE = path.resolve(
  __dirname,
  '../../GUIA-PROYECTO/ESTUDIANTES_NEE.txt',
);

// Extrae carreras únicas del archivo fuente
async function extractCareers(): Promise<{ name: string; code: string }[]> {
  const lines = fs.readFileSync(NEE_FILE, 'utf-8').split('\n').filter(Boolean);
  const carrerasSet = new Set<string>();
  for (const line of lines.slice(1)) {
    // Saltar cabecera
    const parts = line.split('\t');
    if (parts.length >= 3) {
      carrerasSet.add(parts[2].trim());
    }
  }
  // Mapear a objetos con code generado
  return Array.from(carrerasSet).map((name) => ({
    name,
    code: generateCareerCode(name),
  }));
}

function generateCareerCode(name: string): string {
  // Simple: primeras letras de cada palabra en mayúsculas
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

async function main() {
  await connect(MONGODB_URI);
  // Usar type casting para evitar errores de tipo
  const careerModel = mongoose.model('Career', CareerSchema as any);

  const careers = await extractCareers();
  let inserted = 0;
  for (const career of careers) {
    // Verificar existencia previa por código
    const exists = await careerModel.findOne({ code: career.code });
    if (exists) {
      console.log(`[SKIP] Carrera ya existe: ${career.name} (${career.code})`);
      continue;
    }
    // Solicitar datos obligatorios faltantes por consola
    const faculty = await ask(`Facultad para "${career.name}": `);
    const departmentId = await ask(`DepartmentId para "${career.name}": `);
    const duration = parseInt(
      await ask(`Duración en semestres para "${career.name}": `),
      10,
    );
    const currentSemester = await ask(
      `Semestre actual para "${career.name}" (ej: 2025-1): `,
    );
    const campus = await ask(`Campus para "${career.name}" (opcional): `);

    const doc = new careerModel({
      name: career.name,
      code: career.code,
      faculty,
      departmentId,
      duration,
      currentSemester,
      campus,
      isActive: true,
    });
    await doc.save();
    inserted++;
    console.log(`[OK] Insertada: ${career.name} (${career.code})`);
  }
  console.log(`\nTotal insertadas: ${inserted}`);
  process.exit(0);
}

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim());
    }),
  );
}

main().catch((err) => {
  console.error('Error en importación:', err);
  process.exit(1);
});
