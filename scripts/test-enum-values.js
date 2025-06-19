// Importamos el enum directamente desde el mismo lugar que el controlador
const path = require('path');
const fs = require('fs');

// Leemos el archivo del schema directamente
const schemaPath = path.join(__dirname, '../src/users/schemas/user.schema.ts');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

console.log('🔍 ANÁLISIS DEL ENUM UserRole');
console.log('=============================');

// Extraemos la definición del enum
const enumMatch = schemaContent.match(/export enum UserRole \{([\s\S]*?)\}/);
if (enumMatch) {
  console.log('📋 Definición del enum encontrada:');
  console.log(enumMatch[0]);
  
  // Extraemos los valores específicos
  const enumBody = enumMatch[1];
  const lines = enumBody.split('\n').filter(line => line.includes('='));
  
  console.log('\n🎯 Valores del enum:');
  console.log('====================');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('//')) {
      console.log(`  ${trimmed}`);
    }
  });
  
  // Verificación específica de COORDINADOR
  const coordinadorMatch = enumBody.match(/COORDINADOR\s*=\s*['"]([^'"]+)['"]/);
  if (coordinadorMatch) {
    console.log(`\n🔑 Valor de COORDINADOR: "${coordinadorMatch[1]}"`);
    console.log(`📏 Longitud: ${coordinadorMatch[1].length}`);
    console.log(`🔤 Tipo: ${typeof coordinadorMatch[1]}`);
  }
  
} else {
  console.log('❌ No se pudo encontrar la definición del enum UserRole');
}

// Verificamos la compilación del archivo
console.log('\n🔧 Verificando compilación...');
try {
  // Intentamos requerir el archivo compilado (si existe)
  delete require.cache[path.resolve('../src/users/schemas/user.schema.ts')];
  console.log('✅ Archivo accessible para require');
} catch (error) {
  console.log(`❌ Error al acceder al archivo: ${error.message}`);
} 