// Script de prueba para endpoints DIDDEC
// Ejecutar con: node test_diddec_endpoints.js

const http = require('http');

const baseUrl = 'http://localhost:3002';

// Función helper para hacer requests
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Nota: En una prueba real necesitarías un token JWT válido
        // 'Authorization': 'Bearer <token>'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Función principal de prueba
async function testDiddecEndpoints() {
  console.log('🚀 Iniciando pruebas de endpoints DIDDEC...');
  console.log('📍 URL Base:', baseUrl);
  console.log('');

  // Endpoints a probar
  const endpoints = [
    { name: 'Health Check', path: '/health' },
    { name: 'Estadísticas DIDDEC', path: '/diddec/statistics?semester=2025-1' },
    { name: 'Reporte Semestre', path: '/diddec/reports/semester/2025-1' },
    { name: 'Estudiantes NEE', path: '/diddec/students/all?semester=2025-1' },
    { name: 'Cumplimiento Departamentos', path: '/diddec/adjustments/compliance?semester=2025-1' },
    { name: 'Recursos DIDDEC', path: '/diddec/resources' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Probando: ${endpoint.name} -> ${endpoint.path}`);
      const result = await makeRequest(endpoint.path);
      
      if (result.status === 200) {
        console.log(`✅ ${endpoint.name}: OK (200)`);
      } else if (result.status === 401) {
        console.log(`🔐 ${endpoint.name}: Requiere autenticación (401) - Esto es esperado`);
      } else if (result.status === 404) {
        console.log(`❌ ${endpoint.name}: Endpoint no encontrado (404)`);
      } else {
        console.log(`⚠️  ${endpoint.name}: Status ${result.status}`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${endpoint.name}: Backend no está corriendo (ECONNREFUSED)`);
      } else if (error.message === 'Request timeout') {
        console.log(`⏱️  ${endpoint.name}: Timeout - Backend puede estar sobrecargado`);
      } else {
        console.log(`❌ ${endpoint.name}: Error -> ${error.message}`);
      }
    }
    console.log('');
  }

  console.log('🏁 Pruebas completadas');
}

// Ejecutar las pruebas
testDiddecEndpoints().catch(console.error);
