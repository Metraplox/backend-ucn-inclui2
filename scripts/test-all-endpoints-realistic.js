const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Usuarios de prueba
const testUsers = [
  { email: 'coordinadora@ucn.cl', password: 'Test123!', role: 'COORDINADOR' },
  { email: 'educadora@ucn.cl', password: 'Test123!', role: 'EDUCADORA_SOCIAL' },
  { email: 'diddec@ucn.cl', password: 'Test123!', role: 'DIDDEC_STAFF' },
  { email: 'profesor@ucn.cl', password: 'Test123!', role: 'DOCENTE' }
];

// Todos los endpoints a probar
const endpoints = [
  // Auth
  { method: 'POST', path: '/auth/login', requiresAuth: false, body: { email: 'coordinadora@ucn.cl', password: 'Test123!' } },
  
  // Users
  { method: 'GET', path: '/users/profile', requiresAuth: true },
  { method: 'GET', path: '/users', requiresAuth: true },
  
  // Students
  { method: 'GET', path: '/students', requiresAuth: true },
  { method: 'POST', path: '/students', requiresAuth: true, body: { rut: '12345678-9', name: 'Test Student' } },
  
  // Departments
  { method: 'GET', path: '/departments', requiresAuth: true },
  { method: 'POST', path: '/departments', requiresAuth: true, body: { name: 'Test Dept' } },
  
  // Careers
  { method: 'GET', path: '/careers', requiresAuth: true },
  { method: 'POST', path: '/careers', requiresAuth: true, body: { name: 'Test Career' } },
  
  // Courses
  { method: 'GET', path: '/courses', requiresAuth: true },
  { method: 'POST', path: '/courses', requiresAuth: true, body: { name: 'Test Course' } },
  
  // Categories
  { method: 'GET', path: '/categories', requiresAuth: true },
  { method: 'POST', path: '/categories', requiresAuth: true, body: { name: 'Test Category' } },
  
  // Adjustments
  { method: 'GET', path: '/adjustments', requiresAuth: true },
  { method: 'POST', path: '/adjustments', requiresAuth: true, body: { studentRut: '12345678-9' } },
  
  // Documents
  { method: 'GET', path: '/documents', requiresAuth: true },
  { method: 'POST', path: '/documents', requiresAuth: true, body: { title: 'Test Doc' } },
  
  // Consents
  { method: 'GET', path: '/consents', requiresAuth: true },
  { method: 'POST', path: '/consents', requiresAuth: true, body: { studentRut: '12345678-9' } },
  
  // Resources
  { method: 'GET', path: '/resources', requiresAuth: true },
  { method: 'POST', path: '/resources', requiresAuth: true, body: { title: 'Test Resource' } },
  
  // DIDDEC
  { method: 'GET', path: '/diddec/reports', requiresAuth: true },
  { method: 'GET', path: '/diddec/stats', requiresAuth: true },
  
  // Sync
  { method: 'GET', path: '/sync/status', requiresAuth: true },
  { method: 'POST', path: '/sync/hawaii', requiresAuth: true },
  
  // Notifications
  { method: 'GET', path: '/notifications', requiresAuth: true },
  { method: 'POST', path: '/notifications', requiresAuth: true, body: { message: 'Test' } }
];

let globalToken = null;

async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'coordinadora@ucn.cl',
      password: 'Test123!'
    });
    
    // Extraer token de la estructura anidada
    if (response.data?.data?.data?.access_token) {
      globalToken = response.data.data.data.access_token;
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    return false;
  }
}

async function testEndpoint(endpoint) {
  try {
    const config = {
      method: endpoint.method,
      url: `${BASE_URL}${endpoint.path}`,
      timeout: 5000,
      validateStatus: () => true // Acepta cualquier status
    };
    
    if (endpoint.requiresAuth && globalToken) {
      config.headers = { Authorization: `Bearer ${globalToken}` };
    }
    
    if (endpoint.body) {
      config.data = endpoint.body;
    }
    
    const response = await axios(config);
    
    return {
      endpoint: `${endpoint.method} ${endpoint.path}`,
      status: response.status,
      success: response.status >= 200 && response.status < 300,
      error: response.status >= 400 ? response.data?.message || 'Error' : null
    };
    
  } catch (error) {
    return {
      endpoint: `${endpoint.method} ${endpoint.path}`,
      status: 'ERROR',
      success: false,
      error: error.message
    };
  }
}

async function runCompleteTest() {
  console.log('🧪 TESTING COMPLETO DE ENDPOINTS - UCN INCLUI2');
  console.log('===============================================\n');
  
  // 1. Login
  console.log('🔐 Intentando login...');
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Login falló. No se pueden probar endpoints autenticados.');
    return;
  }
  console.log('✅ Login exitoso\n');
  
  // 2. Test de todos los endpoints
  console.log('🔍 Probando endpoints...\n');
  
  const results = [];
  let successCount = 0;
  let totalCount = 0;
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    totalCount++;
    
    if (result.success) {
      successCount++;
      console.log(`✅ ${result.endpoint} - ${result.status}`);
    } else {
      console.log(`❌ ${result.endpoint} - ${result.status} - ${result.error}`);
    }
  }
  
  // 3. Resumen
  console.log('\n📊 RESUMEN DE RESULTADOS:');
  console.log('=========================');
  console.log(`Total endpoints probados: ${totalCount}`);
  console.log(`Exitosos: ${successCount}`);
  console.log(`Fallidos: ${totalCount - successCount}`);
  console.log(`Tasa de éxito: ${((successCount / totalCount) * 100).toFixed(1)}%`);
  
  // 4. Detalle por categoría
  console.log('\n📋 DETALLE POR CATEGORÍA:');
  console.log('========================');
  
  const categories = {
    'Auth': results.filter(r => r.endpoint.includes('/auth')),
    'Users': results.filter(r => r.endpoint.includes('/users')),
    'Students': results.filter(r => r.endpoint.includes('/students')),
    'Departments': results.filter(r => r.endpoint.includes('/departments')),
    'Careers': results.filter(r => r.endpoint.includes('/careers')),
    'Courses': results.filter(r => r.endpoint.includes('/courses')),
    'Categories': results.filter(r => r.endpoint.includes('/categories')),
    'Adjustments': results.filter(r => r.endpoint.includes('/adjustments')),
    'Documents': results.filter(r => r.endpoint.includes('/documents')),
    'Consents': results.filter(r => r.endpoint.includes('/consents')),
    'Resources': results.filter(r => r.endpoint.includes('/resources')),
    'DIDDEC': results.filter(r => r.endpoint.includes('/diddec')),
    'Sync': results.filter(r => r.endpoint.includes('/sync')),
    'Notifications': results.filter(r => r.endpoint.includes('/notifications'))
  };
  
  for (const [category, endpoints] of Object.entries(categories)) {
    if (endpoints.length > 0) {
      const categorySuccess = endpoints.filter(e => e.success).length;
      const categoryTotal = endpoints.length;
      const categoryRate = ((categorySuccess / categoryTotal) * 100).toFixed(1);
      console.log(`${category}: ${categorySuccess}/${categoryTotal} (${categoryRate}%)`);
    }
  }
  
  // 5. Endpoints problemáticos
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log('\n❌ ENDPOINTS CON PROBLEMAS:');
    console.log('==========================');
    failed.forEach(f => {
      console.log(`${f.endpoint} - ${f.status} - ${f.error}`);
    });
  }
  
  console.log('\n✅ Testing completo finalizado');
}

// Ejecutar
if (require.main === module) {
  runCompleteTest().catch(console.error);
} 