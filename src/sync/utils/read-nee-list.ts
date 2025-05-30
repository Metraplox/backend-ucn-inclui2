import * as fs from 'fs/promises';
import * as path from 'path';

const NEE_FILE_PATH = path.resolve(__dirname, '../../../GUIA-PROYECTO/ESTUDIANTES_NEE.txt');

export async function readNeeList(): Promise<{ rut: string; dv: string; carrera: string }[]> {
  const content = await fs.readFile(NEE_FILE_PATH, 'utf-8');
  const lines = content.split('\n').filter(Boolean);
  const result = lines.slice(1).map(line => {
    const [rut, dv, carrera] = line.split('\t');
    return { rut, dv, carrera };
  });
  return result;
}
