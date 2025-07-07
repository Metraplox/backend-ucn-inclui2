const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Usuarios de prueba completos
const allTestUsers = [
  { email: 'coordinador@ucn.cl', password: 'password123', role: 'COORDINADOR', dashboard: '/students' },
  { email: 'educadora@ucn.cl', password: 'password123', role: 'EDUCADORA_SOCIAL', dashboard: '/students' },
  { email: 'diddec@ucn.cl', password: 'password123', role: 'DIDDEC_STAFF', dashboard: '/diddec/statistics' },
  { email: 'estudiante@alumnos.ucn.cl', password: 'password123', role: 'ESTUDIANTE', dashboard: '/students/profile' },
  { email: 'docente@ucn.cl', password: 'password123', role: 'DOCENTE', dashboard: '/dashboards/docente' },
  { email: 'jefe.carrera@ucn.cl', password: 'password123', role: 'JEFE_CARRERA', dashboard: '/dashboards/jefe-carrera' },
  { email: 'jefe.departamento@ucn.cl', password: 'password123', role: 'JEFE_DEPARTAMENTO', dashboard: '/dashboards/jefe-departamento' }
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

async function testEndpoint(token, endpoint, role) {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      status: response.status,
      message: 'OK'
    };
    
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 'ERROR',
      message: error.response?.data?.message || error.message
    };
  }
}

async function validateCompleteSystem() {
  console.log('🧪 === VALIDACION COMPLETA DEL SISTEMA UCN INCLUI2 ===\n');
  
  let totalTests = 0;
  let successfulTests = 0;
  let failedTests = 0;
  
  // Primero, probar endpoint público de status
  console.log('📊 Probando endpoint público de status...');
  try {
    const statusResponse = await axios.get(`${BASE_URL}/dashboards/status`);
    console.log('✅ Status endpoint:', { status: statusResponse.status });
    totalTests++;
    successfulTests++;
  } catch (error) {
    console.log('❌ Status endpoint:', { status: error.response?.status || 'ERROR' });
    totalTests++;
    failedTests++;
  }
  
  // Probar cada usuario y su dashboard correspondiente
  for (const user of allTestUsers) {
    console.log(`\n🔐 Probando usuario ${user.role} (${user.email})...`);
    
    // Test de login
    const token = await login(user.email, user.password);
    if (!token) {
      console.log(`❌ Login falló para ${user.role}`);
      totalTests++;
      failedTests++;
      continue;
    }
    
    console.log(`✅ Login exitoso para ${user.role}`);
    totalTests++;
    successfulTests++;
    
    // Test de acceso a dashboard
    const dashboardResult = await testEndpoint(token, user.dashboard, user.role);
    if (dashboardResult.success) {
      console.log(`✅ Dashboard ${user.role} accesible: ${dashboardResult.status}`);
      totalTests++;
      successfulTests++;
    } else {
      console.log(`❌ Dashboard ${user.role} falló: ${dashboardResult.status} - ${dashboardResult.message}`);
      totalTests++;
      failedTests++;
    }
    
    // Test adicional: verificar que no puede acceder a endpoints restringidos
    if (user.role === 'DOCENTE' || user.role === 'JEFE_CARRERA' || user.role === 'JEFE_DEPARTAMENTO') {
      const restrictedResult = await testEndpoint(token, '/students', user.role);
      if (!restrictedResult.success && restrictedResult.status === 403) {
        console.log(`✅ Restricción correcta: ${user.role} no puede acceder a /students`);
        totalTests++;
        successfulTests++;
      } else {
        console.log(`❌ Error de seguridad: ${user.role} puede acceder a /students`);
        totalTests++;
        failedTests++;
      }
    }
  }
  
  // Resumen final
  console.log('\n📋 === RESUMEN DE VALIDACION COMPLETA ===');
  console.log(`Total pruebas: ${totalTests}`);
  console.log(`Exitosas: ${successfulTests}`);
  console.log(`Fallidas: ${failedTests}`);
  console.log(`Porcentaje de éxito: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('🎉 ¡SISTEMA UCN INCLUI2 FUNCIONANDO AL 100% EN PRODUCCION!');
    console.log('✅ Todos los roles pueden acceder a sus dashboards correspondientes');
    console.log('✅ Las restricciones de seguridad funcionan correctamente');
    console.log('✅ El login está funcionando para todos los usuarios');
  } else {
    console.log('⚠️ Hay problemas que requieren atención');
  }
}

validateCompleteSystem();
