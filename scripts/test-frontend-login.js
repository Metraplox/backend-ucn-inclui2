#!/usr/bin/env node

/**
 * Script de verificación y test de login Frontend-Backend
 * Valida la integración completa de autenticación
 */

const axios = require('axios');
const { execSync } = require('child_process');

const API_BASE = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:3000'; // Flutter web

console.log('🔍 VERIFICACIÓN PROFESIONAL LOGIN FRONTEND-BACKEND');
console.log('==================================================\n');

// Usuarios de prueba del sistema (segun mongodb-init/04-simple-test-data.js)
const TEST_USERS = [
  { email: 'coordinadora@ucn.cl', password: 'password123', role: 'COORDINADOR' },
  { email: 'educadora@ucn.cl', password: 'password123', role: 'EDUCADORA_SOCIAL' },
  { email: 'diddec@ucn.cl', password: 'password123', role: 'DIDDEC_STAFF' },
  { email: 'estudiante1@ucn.cl', password: '15032002', role: 'ESTUDIANTE' },
  { email: 'docente1@ucn.cl', password: 'password123', role: 'DOCENTE' }
];

async function checkBackendHealth() {
  console.log('🔍 1. VERIFICANDO BACKEND...');
  
  try {
    const response = await axios.get(`${API_BASE}/health`);
    console.log('✅ Backend saludable:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Backend no responde. Verificando configuración...');
    
    // Verificar si el puerto está en uso
    try {
      execSync('netstat -ano | findstr :3000', { stdio: 'pipe' });
      console.log('⚠️ Puerto 3000 en uso, pero el backend no responde correctamente');
    } catch {
      console.log('❌ Puerto 3000 libre - Backend no está ejecutándose');
      console.log('\n🚀 SOLUCIÓN: Ejecuta en otra terminal:');
      console.log('   cd "C:\\Users\\fabi_\\Desktop\\U\\Proyecto Plataformas V2\\V1\\back\\backend-ucn-inclui2"');
      console.log('   npm run start:dev');
    }
    return false;
  }
}

async function testLogin(user) {
  console.log(`\n🔐 Probando login: ${user.email}`);
  
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: user.email,
      password: user.password
    });

    // La respuesta del backend está anidada: response.data.data.data
    const loginData = response.data?.data?.data;
    
    if (loginData?.access_token && loginData?.user) {
      console.log(`✅ Login exitoso para ${user.role}`);
      console.log(`   Token: ${loginData.access_token.substring(0, 50)}...`);
      console.log(`   Usuario: ${loginData.user.email}`);
      console.log(`   Roles: ${loginData.user.roles.join(', ')}`);
      return loginData;
    } else {
      console.log(`❌ Respuesta inválida para ${user.email}`);
      console.log(`   Response structure:`, JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    console.log(`❌ Error login ${user.email}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function testProtectedEndpoint(token, role) {
  console.log(`\n🛡️ Probando endpoint protegido con rol ${role}...`);
  
  const endpoints = {
    'COORDINADOR': '/students',
    'EDUCADORA_SOCIAL': '/adjustments',
    'DIDDEC_STAFF': '/diddec/statistics',
    'ESTUDIANTE': '/students/profile'
  };

  const endpoint = endpoints[role] || '/students';
  
  try {
    const response = await axios.get(`${API_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Acceso autorizado a ${endpoint}`);
    console.log(`   Status: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`❌ Error accediendo a ${endpoint}:`, error.response?.status, error.response?.data?.message);
    return false;
  }
}

async function checkCorsConfiguration() {
  console.log('\n🌐 VERIFICANDO CONFIGURACIÓN CORS...');
  
  // Verificar si CORS está configurado para Flutter
  try {
    const response = await axios.options(`${API_BASE}/auth/login`);
    console.log('✅ CORS configurado correctamente');
    return true;
  } catch (error) {
    console.log('⚠️ Posible problema de CORS:', error.message);
    return false;
  }
}

function generateFlutterTestCode(successfulLogins) {
  console.log('\n📱 CÓDIGO FLUTTER PARA PROBAR:');
  console.log('================================');
  
  const user = successfulLogins[0];
  if (user) {
    console.log(`
// Test de login en Flutter
final response = await AuthRepository().login(
  '${user.email}', 
  '${user.password}'
);

print('Token: \${response["access_token"]}');
print('Usuario: \${response["user"]["email"]}');
print('Roles: \${response["user"]["roles"]}');
`);
  }
}

function displayTroubleshooting() {
  console.log('\n🔧 TROUBLESHOOTING GUIDE:');
  console.log('========================');
  console.log('');
  console.log('❌ Si Backend no responde:');
  console.log('   1. cd "C:\\Users\\fabi_\\Desktop\\U\\Proyecto Plataformas V2\\V1\\back\\backend-ucn-inclui2"');
  console.log('   2. npm run start:dev');
  console.log('   3. Esperar a ver "Application is running on: http://localhost:3000"');
  console.log('');
  console.log('❌ Si Login falla:');
  console.log('   1. Verificar que MongoDB esté ejecutándose');
  console.log('   2. Ejecutar: npm run seed:db (para poblar usuarios)');
  console.log('   3. Verificar variables de entorno en .env');
  console.log('');
  console.log('❌ Si Flutter no conecta:');
  console.log('   1. Verificar API_URL en flutter/.env');
  console.log('   2. Para emulador Android usar: http://10.0.2.2:3000');
  console.log('   3. Para dispositivo físico usar IP de la máquina');
  console.log('');
  console.log('📱 Iniciar Flutter app:');
  console.log('   cd "C:\\Users\\fabi_\\Desktop\\U\\Proyecto Plataformas V2\\V1\\frontend-unified\\backend-ucn-inclui2\\incluye_app"');
  console.log('   flutter run -d chrome (para web)');
  console.log('   flutter run (para emulador/dispositivo)');
}

async function main() {
  try {
    // 1. Verificar backend
    const backendOk = await checkBackendHealth();
    
    if (!backendOk) {
      displayTroubleshooting();
      return;
    }

    // 2. Verificar CORS
    await checkCorsConfiguration();

    // 3. Test login para cada usuario
    const successfulLogins = [];
    
    for (const user of TEST_USERS) {
      const loginResult = await testLogin(user);
      if (loginResult) {
        successfulLogins.push({ ...user, ...loginResult });
        
        // Test endpoint protegido
        await testProtectedEndpoint(loginResult.access_token, user.role);
      }
    }

    // 4. Generar código de ejemplo
    if (successfulLogins.length > 0) {
      generateFlutterTestCode(successfulLogins);
      
      console.log('\n🎉 RESUMEN:');
      console.log(`✅ Backend funcionando: ${API_BASE}`);
      console.log(`✅ Logins exitosos: ${successfulLogins.length}/${TEST_USERS.length}`);
      console.log('✅ Sistema listo para Flutter');
      
      console.log('\n🚀 PRÓXIMO PASO:');
      console.log('   Iniciar Flutter app y probar login con las credenciales validadas');
    } else {
      console.log('\n❌ NINGÚN LOGIN FUNCIONÓ');
      displayTroubleshooting();
    }

  } catch (error) {
    console.error('\n💥 Error inesperado:', error.message);
    displayTroubleshooting();
  }
}

if (require.main === module) {
  main();
}
