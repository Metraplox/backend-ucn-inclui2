const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Credenciales de testing válidas
const testUsers = {
  coordinador: { email: 'coordinadora.inclusion@ucn.cl', password: 'inclui2025' },
  educadora: { email: 'educadora.social@ucn.cl', password: 'inclui2025' },
  docente: { email: 'profesor.mat101@ucn.cl', password: 'inclui2025' },
  estudiante: { email: 'estudiante.nee@alumnos.ucn.cl', password: 'test123' }
};

// Endpoints problemáticos identificados
const problematicEndpoints = [
  { method: 'GET', path: '/users/profile', expectedRole: 'ANY', description: 'Profile sin @Roles()' },
  { method: 'GET', path: '/students', expectedRole: 'COORDINADOR', description: 'Forbidden resource' },
  { method: 'GET', path: '/adjustments', expectedRole: 'COORDINADOR', description: 'Forbidden resource' },
  { method: 'GET', path: '/courses', expectedRole: 'COORDINADOR', description: 'Forbidden resource' },
  { method: 'GET', path: '/users', expectedRole: 'COORDINADOR', description: 'Forbidden resource' },
  { method: 'GET', path: '/consents/all', expectedRole: 'COORDINADOR', description: 'Endpoint no existe' },
  { method: 'GET', path: '/nee-categories', expectedRole: 'COORDINADOR', description: 'Endpoint no existe' },
  { method: 'GET', path: '/educational-resources', expectedRole: 'COORDINADOR', description: 'Endpoint no existe' }
];

async function login(userType) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, testUsers[userType]);
    const authData = response.data.data?.data || response.data.data || response.data;
    return authData.access_token;
  } catch (error) {
    console.error(`❌ Login falló para ${userType}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function testEndpoint(token, method, path, description) {
  try {
    const config = {
      method: method.toLowerCase(),
      url: `${BASE_URL}${path}`,
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 5000
    };
    
    const response = await axios(config);
    return {
      status: response.status,
      success: true,
      message: 'OK'
    };
  } catch (error) {
    return {
      status: error.response?.status || 0,
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
}

async function runProblematicEndpointTests() {
  console.log('🧪 TESTING ENDPOINTS PROBLEMÁTICOS');
  console.log('==================================');
  
  // Test con coordinador (máximos permisos)
  const coordinadorToken = await login('coordinador');
  if (!coordinadorToken) return;
  
  let fixedCount = 0;
  let stillBrokenCount = 0;
  
  for (const endpoint of problematicEndpoints) {
    console.log(`\n🔍 Testing: ${endpoint.method} ${endpoint.path}`);
    console.log(`   📝 Descripción: ${endpoint.description}`);
    
    const result = await testEndpoint(coordinadorToken, endpoint.method, endpoint.path, endpoint.description);
    
    if (result.success) {
      console.log(`   ✅ FUNCIONA: Status ${result.status}`);
      fixedCount++;
    } else {
      console.log(`   ❌ FALLA: Status ${result.status} - ${result.message}`);
      stillBrokenCount++;
    }
  }
  
  console.log(`\n📊 RESULTADOS DEL TESTING:`);
  console.log(`✅ Endpoints corregidos: ${fixedCount}/${problematicEndpoints.length}`);
  console.log(`❌ Endpoints aún problemáticos: ${stillBrokenCount}/${problematicEndpoints.length}`);
  console.log(`📈 Progreso: ${((fixedCount / problematicEndpoints.length) * 100).toFixed(1)}%`);
  
  if (stillBrokenCount === 0) {
    console.log('\n🎉 ¡TODOS LOS ENDPOINTS PROBLEMÁTICOS HAN SIDO CORREGIDOS!');
  } else {
    console.log('\n⚠️  Aún hay endpoints que requieren atención');
  }
}

// Ejecutar tests
runProblematicEndpointTests().catch(console.error);
