const axios = require('axios');

// Test inteligente para encontrar rutas alternativas y endpoints ocultos
async function smartTestMissingEndpoints() {
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
  
  console.log('🔍 TESTING INTELIGENTE - BUSCANDO RUTAS ALTERNATIVAS');
  console.log('='.repeat(55));

  // 1. BÚSQUEDA SISTEMÁTICA DE RUTAS DE DOCUMENTOS
  console.log('\n📄 EXPLORANDO RUTAS DE DOCUMENTOS:');
  const documentRoutes = [
    '/documents',
    '/documents/all',
    '/documents/list',
    '/document',
    '/document/list',
    '/documents/search',
    '/api/documents',
    '/documents/metadata',
    '/documents/templates'
  ];
  
  for (const route of documentRoutes) {
    await testEndpoint('GET', route, headers, `Documentos via ${route}`);
  }

  // 2. BÚSQUEDA DE RUTAS DE CONSENTIMIENTOS
  console.log('\n📋 EXPLORANDO RUTAS DE CONSENTIMIENTOS:');
  const consentRoutes = [
    '/consents',
    '/consent',
    '/consent/list',
    '/consents/all',
    '/api/consents',
    '/consents/search'
  ];
  
  for (const route of consentRoutes) {
    await testEndpoint('GET', route, headers, `Consentimientos via ${route}`);
  }

  // 3. BÚSQUEDA DE RUTAS DE NOTIFICACIONES
  console.log('\n🔔 EXPLORANDO RUTAS DE NOTIFICACIONES:');
  const notificationRoutes = [
    '/notifications/create',
    '/notifications/send',
    '/notification',
    '/notification/create',
    '/api/notifications',
    '/notifications/admin'
  ];
  
  for (const route of notificationRoutes) {
    await testEndpoint('POST', route, headers, `Notificaciones via ${route}`, {
      title: 'Test',
      message: 'Test',
      type: 'SYSTEM_ALERT',
      semester: '2025-1'
    });
  }

  // 4. EXPLORACIÓN DE RUTAS DE SYNC Y SCHEDULER
  console.log('\n🔄 EXPLORANDO RUTAS DE SINCRONIZACIÓN:');
  const syncRoutes = [
    '/sync',
    '/sync/status',
    '/synchronization/status',
    '/hawaii/status',
    '/hawaii/sync',
    '/hawaii/sync/status',
    '/scheduler',
    '/scheduler/status',
    '/scheduler/state',
    '/api/sync/status'
  ];
  
  for (const route of syncRoutes) {
    await testEndpoint('GET', route, headers, `Sync status via ${route}`);
  }

  // 5. EXPLORACIÓN DE RUTAS ESPECIALES
  console.log('\n⭐ EXPLORANDO RUTAS ESPECIALES:');
  const specialRoutes = [
    '/api',
    '/api/status',
    '/health',
    '/health/check',
    '/status',
    '/version',
    '/api/version'
  ];
  
  for (const route of specialRoutes) {
    await testEndpoint('GET', route, headers, `Ruta especial ${route}`);
  }

  // 6. TEST ESPECÍFICO DEL PROBLEMA /students/profile CON DIFERENTES USUARIOS
  console.log('\n🎓 TESTING /students/profile CON DIFERENTES USUARIOS:');
  
  const testUsers = [
    { email: 'estudiante@ucn.cl', role: 'ESTUDIANTE' },
    { email: 'educadora@ucn.cl', role: 'EDUCADORA_SOCIAL' },
    { email: 'diddec@ucn.cl', role: 'DIDDEC_STAFF' }
  ];

  for (const user of testUsers) {
    try {
      const loginResponse = await axios.post('http://localhost:3000/auth/login', {
        email: user.email,
        password: 'Test123!'
      });
      
      const userToken = loginResponse.data.data.data.access_token;
      if (userToken) {
        await testEndpoint('GET', '/students/profile', 
          { Authorization: `Bearer ${userToken}` }, 
          `Profile como ${user.role}`);
      }
    } catch (error) {
      console.log(`❌ Login failed for ${user.email}`);
    }
  }

  console.log('\n📊 TESTING INTELIGENTE COMPLETADO');
  console.log('='.repeat(55));
  console.log('✅ Revisa los resultados para encontrar rutas funcionales');
}

async function testEndpoint(method, url, headers, description, data = null) {
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
      console.log(`✅ ${method} ${url} - ${response.status} - ${description} - ¡FUNCIONA!`);
      
      // Si encontramos algo interesante, mostrar más detalles
      if (url.includes('document') || url.includes('consent') || url.includes('sync') || url.includes('status')) {
        console.log(`   📝 Respuesta: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
    }
    
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      
      if (status === 404) {
        // Solo mostrar los 404 si es una ruta que podría ser importante
        if (url.includes('api') || url.includes('status') || url.includes('health')) {
          console.log(`❌ ${method} ${url} - 404 - ${description}`);
        }
      } else if (status === 500) {
        console.log(`🔴 ${method} ${url} - 500 - ${description} - ERROR SERVIDOR`);
      } else if (status === 400) {
        console.log(`🟡 ${method} ${url} - 400 - ${description} - VALIDACIÓN`);
      } else if (status === 403) {
        console.log(`🟠 ${method} ${url} - 403 - ${description} - PERMISOS (pero existe)`);
      } else if (status === 401) {
        console.log(`🔐 ${method} ${url} - 401 - ${description} - AUTH REQUERIDA (pero existe)`);
      } else {
        console.log(`⚠️  ${method} ${url} - ${status} - ${description}`);
      }
    }
    // No mostrar errores de conexión para mantener limpio el output
  }
}

// Ejecutar el test
smartTestMissingEndpoints().catch(console.error); 