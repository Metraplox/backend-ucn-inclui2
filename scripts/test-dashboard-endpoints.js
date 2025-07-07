const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Usuarios de prueba
const testUsers = [
  { email: 'docente@ucn.cl', password: 'password123', role: 'DOCENTE' },
  { email: 'jefe.carrera@ucn.cl', password: 'password123', role: 'JEFE_CARRERA' },
  { email: 'jefe.departamento@ucn.cl', password: 'password123', role: 'JEFE_DEPARTAMENTO' }
];

async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password
    });
    
    // Buscar el token en la estructura correcta
    let token = null;
    if (response.data?.data?.data?.accessToken) {
      token = response.data.data.data.accessToken;
    } else if (response.data?.data?.accessToken) {
      token = response.data.data.accessToken;
    } else if (response.data?.accessToken) {
      token = response.data.accessToken;
    }
    
    return token;
  } catch (error) {
    console.error(`❌ Error login ${email}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function testDashboardEndpoint(token, endpoint, role) {
  try {
    const response = await axios.get(`${BASE_URL}/dashboards/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ Dashboard ${role} (${endpoint}): `, {
      status: response.status,
      hasData: response.data?.data ? 'Si' : 'No',
      message: response.data?.message || 'OK'
    });
    
    return true;
  } catch (error) {
    console.log(`❌ Dashboard ${role} (${endpoint}): `, {
      status: error.response?.status || 'ERROR',
      message: error.response?.data?.message || error.message
    });
    return false;
  }
}

async function testStatusEndpoint() {
  try {
    const response = await axios.get(`${BASE_URL}/dashboards/status`);
    console.log(`✅ Dashboard Status Endpoint: `, {
      status: response.status,
      data: response.data
    });
    return true;
  } catch (error) {
    console.log(`❌ Dashboard Status Endpoint: `, {
      status: error.response?.status || 'ERROR',
      message: error.response?.data?.message || error.message
    });
    return false;
  }
}

async function runTests() {
  console.log('🧪 === PRUEBA ENDPOINTS DASHBOARDS ===\n');
  
  // Test del endpoint de status (sin autenticación)
  console.log('📊 Probando endpoint de status...');
  await testStatusEndpoint();
  console.log('');
  
  // Test de endpoints específicos por rol
  let totalTests = 0;
  let passedTests = 0;
  
  for (const user of testUsers) {
    console.log(`🔐 Probando usuario ${user.role} (${user.email})...`);
    
    const token = await login(user.email, user.password);
    if (!token) {
      console.log(`❌ No se pudo obtener token para ${user.role}`);
      continue;
    }
    
    let endpoint;
    switch (user.role) {
      case 'DOCENTE':
        endpoint = 'docente';
        break;
      case 'JEFE_CARRERA':
        endpoint = 'jefe-carrera';
        break;
      case 'JEFE_DEPARTAMENTO':
        endpoint = 'jefe-departamento';
        break;
    }
    
    if (endpoint) {
      totalTests++;
      const success = await testDashboardEndpoint(token, endpoint, user.role);
      if (success) passedTests++;
    }
    
    console.log('');
  }
  
  // Resumen
  console.log('📋 === RESUMEN DE PRUEBAS ===');
  console.log(`Total endpoints probados: ${totalTests + 1} (incluye status)`);
  console.log(`Exitosos: ${passedTests}`);
  console.log(`Fallidos: ${totalTests - passedTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ¡Todos los endpoints de dashboard funcionan correctamente!');
  } else {
    console.log('⚠️  Algunos endpoints necesitan revisión.');
  }
}

runTests().catch(console.error);
