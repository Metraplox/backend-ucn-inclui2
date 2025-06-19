const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testDirectEndpoint() {
  console.log('🧪 TEST DIRECTO - DIAGNÓSTICO DE GUARDS');
  console.log('======================================\n');
  
  try {
    // 1. Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'coordinadora@ucn.cl',
      password: 'Test123!'
    });
    
    const token = loginResponse.data?.data?.data?.access_token;
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    console.log('🔐 Usuario autenticado:');
    console.log('  Email:', payload.email);
    console.log('  Roles:', payload.roles);
    
    // 2. Test diferentes endpoints para comparar
    const endpoints = [
      { name: 'users/profile', url: '/users/profile', expected: '✅ Funciona' },
      { name: 'departments', url: '/departments', expected: '✅ Funciona' },
      { name: 'students', url: '/students', expected: '❌ Falla (403)' },
      { name: 'courses', url: '/courses', expected: '❌ Falla (403)' },
      { name: 'adjustments', url: '/adjustments', expected: '❌ Falla (403)' }
    ];
    
    console.log('\n📊 COMPARACIÓN DE ENDPOINTS:');
    console.log('============================');
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint.url}`, {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: () => true
        });
        
        const status = response.status === 200 ? '✅ OK' : 
                      response.status === 403 ? '❌ 403' :
                      response.status === 404 ? '🔍 404' : `⚠️ ${response.status}`;
        
        console.log(`${endpoint.name.padEnd(15)} | ${status.padEnd(8)} | ${endpoint.expected}`);
        
        // Para endpoints que fallan, mostramos más detalle
        if (response.status === 403) {
          console.log(`  └─ Error: ${response.data?.message || 'Forbidden'}`);
        }
        
      } catch (error) {
        console.log(`${endpoint.name.padEnd(15)} | ERROR    | ${error.message}`);
      }
    }
    
    // 3. Análisis específico del problema
    console.log('\n🔍 ANÁLISIS DEL PROBLEMA:');
    console.log('=========================');
    
    // Verificar si hay algún patrón
    const workingEndpoints = ['users/profile', 'departments'];
    const failingEndpoints = ['students', 'courses', 'adjustments'];
    
    console.log('✅ Endpoints que funcionan:', workingEndpoints.join(', '));
    console.log('❌ Endpoints que fallan:', failingEndpoints.join(', '));
    
    console.log('\n💡 HIPÓTESIS:');
    console.log('- users/profile: Probablemente tiene @Roles(UserRole.COORDINADOR)');
    console.log('- departments: Funciona ¿sin roles específicos?');
    console.log('- students: Tiene roles múltiples ¿problema en el guard?');
    
    // 4. Test con DIDDEC user
    console.log('\n🔄 Probando con usuario DIDDEC:');
    try {
      const diddecLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'diddec@ucn.cl',
        password: 'Test123!'
      });
      
      const diddecToken = diddecLogin.data?.data?.data?.access_token;
      
      const studentsWithDiddec = await axios.get(`${BASE_URL}/students`, {
        headers: { Authorization: `Bearer ${diddecToken}` },
        validateStatus: () => true
      });
      
      console.log('  Status con DIDDEC_STAFF:', studentsWithDiddec.status);
      
      if (studentsWithDiddec.status === 403) {
        console.log('  ❌ DIDDEC también recibe 403 - confirma problema en guard');
      }
      
    } catch (error) {
      console.log('  Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testDirectEndpoint(); 