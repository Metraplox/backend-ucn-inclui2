#!/usr/bin/env node

/**
 * Script de prueba para validar la conexión Frontend-Backend
 * Simula el comportamiento del frontend Flutter para hacer login
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// Usuarios de prueba (mismos del frontend)
const TEST_USERS = [
  {
    email: 'coordinador@ucn.cl',
    password: 'password123',
    role: 'COORDINADOR'
  },
  {
    email: 'educadora@ucn.cl',
    password: 'password123',
    role: 'EDUCADORA_SOCIAL'
  },
  {
    email: 'diddec@ucn.cl',
    password: 'password123',
    role: 'DIDDEC_STAFF'
  },
  {
    email: 'estudiante@alumnos.ucn.cl',
    password: 'password123',
    role: 'ESTUDIANTE'
  }
];

console.log('🔄 INICIANDO PRUEBAS DE CONEXIÓN FRONTEND-BACKEND');
console.log('==================================================\n');

async function testBackendHealth() {
  console.log('📡 Verificando salud del backend...');
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend saludable:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Backend no disponible:', error.message);
    console.log('   → Asegúrate de que el backend esté ejecutándose en puerto 3000');
    console.log('   → Comando: npm run start:dev');
    return false;
  }
}

async function testLogin(user) {
  console.log(`\n🔐 Probando login: ${user.email} (${user.role})`);
  
  try {
    // Simular exactamente la petición que hace el frontend Flutter
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: user.email,
      password: user.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Login exitoso');
    console.log('   → Token recibido:', response.data.access_token ? 'SÍ' : 'NO');
    console.log('   → Usuario:', response.data.user?.email || 'No disponible');
    console.log('   → Roles:', response.data.user?.roles || 'No disponible');
    
    return {
      success: true,
      token: response.data.access_token,
      user: response.data.user
    };
  } catch (error) {
    console.log('❌ Error en login');
    if (error.response) {
      console.log('   → Status:', error.response.status);
      console.log('   → Mensaje:', error.response.data?.message || 'Sin mensaje');
    } else {
      console.log('   → Error de conexión:', error.message);
    }
    return { success: false };
  }
}

async function testAuthenticatedEndpoint(token, userRole) {
  console.log(`\n🔒 Probando endpoint autenticado (${userRole})`);
  
  try {
    let endpoint;
    switch (userRole) {
      case 'COORDINADOR':
      case 'EDUCADORA_SOCIAL':
      case 'DIDDEC_STAFF':
        endpoint = '/students';
        break;
      case 'ESTUDIANTE':
        endpoint = '/students/profile';
        break;
      default:
        endpoint = '/students';
    }

    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Endpoint autenticado funciona');
    console.log('   → Endpoint:', endpoint);
    console.log('   → Status:', response.status);
    console.log('   → Datos recibidos:', Array.isArray(response.data.data) ? `${response.data.data.length} elementos` : 'Objeto');
    
    return true;
  } catch (error) {
    console.log('❌ Error en endpoint autenticado');
    if (error.response) {
      console.log('   → Status:', error.response.status);
      console.log('   → Mensaje:', error.response.data?.message || 'Sin mensaje');
    } else {
      console.log('   → Error de conexión:', error.message);
    }
    return false;
  }
}

async function testCorsHeaders() {
  console.log('\n🌐 Verificando configuración CORS...');
  
  try {
    const response = await axios.options(`${API_BASE_URL}/auth/login`, {
      headers: {
        'Origin': 'http://localhost:4200',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    console.log('✅ CORS configurado correctamente');
    return true;
  } catch (error) {
    console.log('⚠️ CORS podría tener problemas:', error.message);
    return false;
  }
}

async function main() {
  let totalTests = 0;
  let passedTests = 0;

  // Test 1: Backend Health
  totalTests++;
  const backendHealthy = await testBackendHealth();
  if (backendHealthy) passedTests++;
  
  if (!backendHealthy) {
    console.log('\n❌ No se puede continuar sin backend. Saliendo...');
    process.exit(1);
  }

  // Test 2: CORS
  totalTests++;
  const corsOk = await testCorsHeaders();
  if (corsOk) passedTests++;

  // Test 3-6: Login de todos los usuarios
  for (const user of TEST_USERS) {
    totalTests++;
    const loginResult = await testLogin(user);
    if (loginResult.success) {
      passedTests++;
      
      // Test adicional: Endpoint autenticado
      if (loginResult.token) {
        totalTests++;
        const authEndpointOk = await testAuthenticatedEndpoint(loginResult.token, user.role);
        if (authEndpointOk) passedTests++;
      }
    }
  }

  // Resumen final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE PRUEBAS FRONTEND-BACKEND');
  console.log('='.repeat(50));
  console.log(`✅ Tests exitosos: ${passedTests}/${totalTests}`);
  console.log(`📈 Porcentaje de éxito: ${Math.round((passedTests/totalTests)*100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ¡PERFECTO! El frontend puede conectarse exitosamente al backend');
    console.log('   → Todos los usuarios pueden hacer login');
    console.log('   → Los endpoints autenticados funcionan');
    console.log('   → CORS está configurado correctamente');
    console.log('\n✅ LISTO PARA COMPARTIR CON TUS COMPAÑEROS');
  } else {
    console.log('\n⚠️ Hay algunos problemas que resolver antes de compartir');
    console.log('   → Revisa los errores arriba para más detalles');
    console.log('   → Asegúrate de que MongoDB esté ejecutándose');
    console.log('   → Verifica que los usuarios de prueba existan en la BD');
  }
  
  console.log('\n🔧 COMANDOS ÚTILES:');
  console.log('   Backend: npm run start:dev');
  console.log('   MongoDB: docker run -d -p 27017:27017 mongo:7.0');
  console.log('   Poblar BD: npm run seed:db');
}

if (require.main === module) {
  main().catch(error => {
    console.error('\n💥 Error inesperado:', error.message);
    process.exit(1);
  });
}

module.exports = { main };
