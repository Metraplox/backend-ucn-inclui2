const axios = require('axios');

// Test específico para endpoints faltantes identificados
async function testMissingEndpoints() {
  let token = null;
  
  try {
    console.log('🔐 Obteniendo token de autenticación...');
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: 'coordinadora@ucn.cl',
      password: 'Test123!'
    });
    
    token = loginResponse.data.data.data.access_token;
    if (!token) {
      console.log('❌ Error: No se pudo obtener token');
      return;
    }
    console.log('✅ Token obtenido correctamente\n');
    
  } catch (error) {
    console.log('❌ Error en login:', error.message);
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };
  
  console.log('🧪 TESTING ENDPOINTS FALTANTES/PROBLEMÁTICOS');
  console.log('='.repeat(50));

  // 1. PROBLEMA CRÍTICO: /students/profile (Error 500)
  console.log('\n🔴 ENDPOINT CRÍTICO CON ERROR 500:');
  await testEndpoint('GET', '/students/profile', headers, 'Perfil de estudiante autenticado');

  // 2. ENDPOINTS 404 - RUTAS NO IMPLEMENTADAS
  console.log('\n🔴 ENDPOINTS NO IMPLEMENTADOS (404):');
  
  // Documents base routes
  await testEndpoint('GET', '/documents', headers, 'Lista general de documentos');
  await testEndpoint('POST', '/documents', headers, 'Crear documento (ruta base)', {
    studentId: '507f1f77bcf86cd799439011',
    category: 'test',
    description: 'test'
  });

  // Consents base route
  await testEndpoint('GET', '/consents', headers, 'Lista de consentimientos');

  // Notifications POST
  await testEndpoint('POST', '/notifications', headers, 'Crear notificación', {
    userId: '507f1f77bcf86cd799439011',
    title: 'Test',
    message: 'Test message',
    type: 'SYSTEM_ALERT',
    semester: '2025-1'
  });

  // 3. RUTAS CON NOMBRES INCORRECTOS
  console.log('\n🟡 RUTAS CON NOMBRES INCORRECTOS:');
  
  // DIDDEC routes incorrectas
  await testEndpoint('GET', '/diddec/reports', headers, 'Reportes DIDDEC (ruta incorrecta)');
  await testEndpoint('GET', '/diddec/stats', headers, 'Estadísticas DIDDEC (ruta incorrecta)');
  
  // Sync routes incorrectas  
  await testEndpoint('GET', '/sync/status', headers, 'Estado de sync (ruta incorrecta)');
  await testEndpoint('POST', '/sync/hawaii', headers, 'Sync Hawaii (ruta incorrecta)');

  // 4. RUTAS CORRECTAS ALTERNATIVAS
  console.log('\n✅ VERIFICANDO RUTAS CORRECTAS ALTERNATIVAS:');
  
  // DIDDEC rutas correctas
  await testEndpoint('GET', '/diddec/statistics', headers, 'Estadísticas DIDDEC (ruta correcta)');
  await testEndpoint('GET', '/diddec/reports/semester/2025-1', headers, 'Reportes DIDDEC (ruta correcta)');
  
  // Scheduler rutas correctas
  await testEndpoint('GET', '/scheduler/status', headers, 'Estado del scheduler (ruta correcta)');
  
  // Hawaii rutas correctas
  await testEndpoint('POST', '/hawaii/sync/all', headers, 'Sync Hawaii completo (ruta correcta)');
  
  // Documents rutas correctas implementadas
  await testEndpoint('POST', '/documents/upload', headers, 'Upload documento (ruta correcta implementada)', null, true);
  await testEndpoint('GET', '/documents/student/507f1f77bcf86cd799439011', headers, 'Documentos por estudiante (implementada)');

  console.log('\n📊 RESUMEN DE TESTING COMPLETADO');
  console.log('='.repeat(50));
  console.log('✅ Test finalizado - Revisa los resultados arriba');
}

async function testEndpoint(method, url, headers, description, data = null, skipDataValidation = false) {
  try {
    let response;
    const fullUrl = `http://localhost:3000${url}`;
    
    if (method === 'GET') {
      response = await axios.get(fullUrl, { headers });
    } else if (method === 'POST') {
      response = await axios.post(fullUrl, data, { headers });
    }
    
    // Endpoint funciona
    if (response.status >= 200 && response.status < 300) {
      console.log(`✅ ${method} ${url} - ${response.status} - ${description}`);
    } else {
      console.log(`🟡 ${method} ${url} - ${response.status} - ${description}`);
    }
    
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      if (status === 404) {
        console.log(`❌ ${method} ${url} - 404 - ${description} - ENDPOINT NO IMPLEMENTADO`);
      } else if (status === 500) {
        console.log(`🔴 ${method} ${url} - 500 - ${description} - ERROR SERVIDOR`);
      } else if (status === 400 && !skipDataValidation) {
        console.log(`🟡 ${method} ${url} - 400 - ${description} - VALIDACIÓN (NORMAL)`);
      } else if (status === 403) {
        console.log(`🟠 ${method} ${url} - 403 - ${description} - PERMISOS`);
      } else {
        console.log(`⚠️  ${method} ${url} - ${status} - ${description} - ${message}`);
      }
    } else {
      console.log(`💥 ${method} ${url} - ERROR CONEXIÓN - ${description}`);
    }
  }
}

// Ejecutar el test
testMissingEndpoints().catch(console.error); 