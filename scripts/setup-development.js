#!/usr/bin/env node

/**
 * Script de configuración rápida para desarrollo
 * Configura automáticamente el entorno de desarrollo
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 UCN INCLUI2 - CONFIGURACIÓN AUTOMÁTICA DE DESARROLLO');
console.log('======================================================\n');

function checkPrerequisites() {
  console.log('📋 Verificando prerrequisitos...');
  
  try {
    execSync('node --version', { stdio: 'ignore' });
    console.log('✅ Node.js encontrado');
  } catch (error) {
    console.log('❌ Node.js no encontrado. Instala Node.js 18+ desde https://nodejs.org/');
    process.exit(1);
  }

  try {
    execSync('mongod --version', { stdio: 'ignore' });
    console.log('✅ MongoDB encontrado');
  } catch (error) {
    console.log('❌ MongoDB no encontrado. Instala MongoDB desde https://www.mongodb.com/try/download/community');
    process.exit(1);
  }
}

function setupEnvironment() {
  console.log('\n⚙️ Configurando variables de entorno...');
  
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Archivo .env creado desde .env.example');
    } else {
      console.log('❌ No se encontró .env.example');
      process.exit(1);
    }
  } else {
    console.log('✅ Archivo .env ya existe');
  }
}

function installDependencies() {
  console.log('\n📦 Instalando dependencias...');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencias instaladas');
  } catch (error) {
    console.log('❌ Error instalando dependencias');
    process.exit(1);
  }
}

function setupDatabase() {
  console.log('\n🗄️ Configurando base de datos...');
  
  try {
    // Verificar si MongoDB está ejecutándose
    execSync('mongosh --eval "db.runCommand({ ping: 1 })"', { stdio: 'ignore' });
    console.log('✅ MongoDB está ejecutándose');
    
    // Ejecutar script de inicialización si existe
    const seedScript = path.join(__dirname, 'mongodb-init', '04-simple-test-data.js');
    if (fs.existsSync(seedScript)) {
      execSync(`mongosh ucn_inclui2_dev ${seedScript}`, { stdio: 'inherit' });
      console.log('✅ Base de datos inicializada con datos de prueba');
    }
  } catch (error) {
    console.log('⚠️ MongoDB no está ejecutándose. Inicia MongoDB manualmente.');
  }
}

function createDirectories() {
  console.log('\n📁 Creando directorios necesarios...');
  
  const dirs = ['uploads', 'templates', 'test-results', 'logs'];
  
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Directorio ${dir} creado`);
    } else {
      console.log(`✅ Directorio ${dir} ya existe`);
    }
  });
}

function runTests() {
  console.log('\n🧪 Ejecutando tests básicos...');
  
  try {
    execSync('npm test', { stdio: 'inherit' });
    console.log('✅ Tests pasaron exitosamente');
  } catch (error) {
    console.log('⚠️ Algunos tests fallaron, pero el setup está completo');
  }
}

function main() {
  try {
    checkPrerequisites();
    setupEnvironment();
    installDependencies();
    createDirectories();
    setupDatabase();
    runTests();
    
    console.log('\n🎉 ¡CONFIGURACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('\n📚 PRÓXIMOS PASOS:');
    console.log('   1. Inicia el servidor: npm run start:dev');
    console.log('   2. Abre Swagger: http://localhost:3000/api');
    console.log('   3. Revisa README_DESARROLLO.md para más detalles');
    console.log('\n👥 USUARIOS DE PRUEBA:');
    console.log('   - coordinador@ucn.cl / password123');
    console.log('   - educadora@ucn.cl / password123');
    console.log('   - diddec@ucn.cl / password123');
    console.log('   - estudiante@alumnos.ucn.cl / password123');
    
  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
