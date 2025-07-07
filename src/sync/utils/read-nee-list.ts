import * as fs from 'fs/promises';
import * as path from 'path';

// Archivos de estudiantes NEE
const NEE_FILES = {
  production: path.resolve(
    __dirname,
    '../../../../backend-ucn-inclui2/GUIA-PROYECTO/ESTUDIANTES_NEE_CSV.txt',
  ),
  test: path.resolve(
    __dirname,
    '../../../../backend-ucn-inclui2/GUIA-PROYECTO/ESTUDIANTES_NEE_TEST.txt',
  ),
};

// Usar el archivo de prueba para mejor diagnóstico
const NEE_FILE_PATH = NEE_FILES.test;

/**
 * Extrae sólo los dígitos de un RUT, eliminando puntos, guiones, espacios y letras.
 * Esta función es útil para comparaciones consistentes entre distintos formatos de RUT.
 * @param rut RUT en cualquier formato
 * @returns RUT con solo dígitos (sin DV si es K)
 */
export function getOnlyDigits(rut: string): string {
  if (!rut) return '';
  // Quita todos los caracteres que no sean dígitos
  return rut.replace(/[^0-9]/g, '');
}

/**
 * Normaliza un RUT para mostrar o guardar en el formato estándar.
 * @param rut Parte numérica del RUT o RUT completo
 * @param dv Dígito verificador (opcional si ya viene en rut)
 * @returns RUT normalizado en formato estándar
 */
export function normalizeRut(rut: string, dv?: string): string {
  // Elimina puntos, guiones, espacios y convierte DV a mayúscula
  if (!rut) return '';
  const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();

  // Si se proporciona el DV por separado
  if (dv) {
    return cleanRut + dv.toUpperCase();
  }

  // Si el RUT ya viene completo, solo lo limpiamos
  return cleanRut;
}

/**
 * Lee el archivo CSV de estudiantes NEE y devuelve un array con sus datos
 * @returns Array de objetos con rut, dv y carrera de estudiantes NEE
 */
export async function readNeeList(): Promise<
  { rut: string; dv: string; carrera: string }[]
> {
  try {
    const content = await fs.readFile(NEE_FILE_PATH, 'utf-8');
    const lines = content.split('\n').filter(Boolean);

    // El archivo ya no tiene encabezado y usa comas como separador
    const result = lines.map((line) => {
      const [rut, dv, carrera] = line.split(',');
      return {
        rut: rut?.trim() || '',
        dv: dv?.trim() || '',
        carrera: carrera?.trim() || '',
      };
    });

    return result;
  } catch (error) {
    console.error('Error al leer el archivo de estudiantes NEE:', error);
    return [];
  }
}
