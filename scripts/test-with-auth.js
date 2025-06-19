// Script de testing con autenticación - UCN INCLUI2
// Fecha: 18-06-2025
// Objetivo: Probar endpoints con credenciales reales

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Credenciales de prueba
const TEST_USERS = [
  { email: 'coordinadora@ucn.cl', password: 'Test123!', role: 'COORDINADOR' },
  { email: 'educadora@ucn.cl', password: 'Test123!', role: 'EDUCADORA_SOCIAL' },
  { email: 'diddec@ucn.cl', password: 'Test123!', role: 'DIDDEC_STAFF' },
  { email: 'profesor@ucn.cl', password: 'Test123!', role: 'DOCENTE' },
  { email: 'estudiante@alumnos.ucn.cl', password: 'Test123!', role: 'ESTUDIANTE' }
];

async function testEndpointsWithAuth() {
  console.log('🚀 TESTING CON AUTENTICACIÓN - UCN INCLUI2');
  console.log('📅 Fecha:', new Date().toISOString());
  console.log('');

  // Test endpoints públicos primero
  console.log('📋 1. TESTING ENDPOINTS PÚBLICOS');
  console.log('================================\n');

  const publicEndpoints = [
    { method: 'GET', url: '/', description: 'Health Check' },
    { method: 'GET', url: '/categories', description: 'Categorías (debería ser público)' },
    { method: 'GET', url: '/departments', description: 'Departamentos (debería ser público)' },
    { method: 'GET', url: '/careers', description: 'Carreras (debería ser público)' },
    { method: 'GET', url: '/courses', description: 'Cursos (debería ser público)' }
  ];

  for (const endpoint of publicEndpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${BASE_URL}${endpoint.url}`,
        validateStatus: () => true
      });
      
      if (response.status === 200 || response.status === 201) {
        console.log(`✅ ${endpoint.description}: OK (${response.status})`);
        if (response.data.data && Array.isArray(response.data.data)) {
          console.log(`   📊 Elementos: ${response.data.data.length}`);
        }
      } else if (response.status === 401) {
        console.log(`❌ ${endpoint.description}: Requiere autenticación (401)`);
      } else {
        console.log(`⚠️ ${endpoint.description}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.description}: Error - ${error.message}`);
    }
  }

  // Test con autenticación
  console.log('\n📋 2. TESTING CON AUTENTICACIÓN');
  console.log('==================================\n');

  for (const user of TEST_USERS) {
    console.log(`\n🔐 Probando con ${user.role} (${user.email})`);
    console.log('─'.repeat(50));

    try {
      // Intentar login
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: user.email,
        password: user.password
      }, {
        validateStatus: () => true
      });

      if (loginResponse.status !== 200) {
        console.log(`❌ Login fallido: ${loginResponse.status} - ${loginResponse.data.message || 'Error'}`);
        continue;
      }

      console.log('✅ Login exitoso');
      const token = loginResponse.data.data.data.access_token;

      // Configurar headers con token
      const authConfig = {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        validateStatus: () => true
      };

      // Probar endpoints autenticados según rol
      const endpointsToTest = getEndpointsByRole(user.role);

      for (const endpoint of endpointsToTest) {
        try {
          const response = await axios({
            method: endpoint.method,
            url: `${BASE_URL}${endpoint.url}`,
            ...authConfig
          });

          if (response.status === 200 || response.status === 201) {
            console.log(`  ✅ ${endpoint.description}: Acceso permitido`);
          } else if (response.status === 403) {
            console.log(`  🔒 ${endpoint.description}: Acceso denegado (rol insuficiente)`);
          } else if (response.status === 404) {
            console.log(`  📭 ${endpoint.description}: Endpoint no encontrado`);
          } else {
            console.log(`  ⚠️ ${endpoint.description}: Status ${response.status}`);
          }
        } catch (error) {
          console.log(`  ❌ ${endpoint.description}: Error - ${error.message}`);
        }
      }

    } catch (error) {
      console.log(`❌ Error con usuario ${user.email}: ${error.message}`);
    }
  }

  // Resumen final
  console.log('\n\n📊 RESUMEN DE TESTING');
  console.log('=====================\n');
  console.log('✅ Testing completado');
  console.log('📝 Recomendaciones:');
  console.log('   1. Verificar endpoints públicos que devuelven 401');
  console.log('   2. Implementar endpoints faltantes (404)');
  console.log('   3. Revisar permisos por rol');
  console.log('   4. Asegurar consistencia en las respuestas');
}

function getEndpointsByRole(role) {
  const commonEndpoints = [
    { method: 'GET', url: '/users/profile', description: 'Mi perfil' },
    { method: 'GET', url: '/notifications', description: 'Notificaciones' }
  ];

  const roleSpecificEndpoints = {
    COORDINADOR: [
      { method: 'GET', url: '/users', description: 'Lista de usuarios' },
      { method: 'GET', url: '/students', description: 'Lista de estudiantes' },
      { method: 'GET', url: '/adjustments', description: 'Lista de ajustes' },
      { method: 'GET', url: '/diddec/statistics', description: 'Estadísticas DIDDEC' }
    ],
    EDUCADORA_SOCIAL: [
      { method: 'GET', url: '/students', description: 'Lista de estudiantes' },
      { method: 'GET', url: '/adjustments', description: 'Lista de ajustes' },
      { method: 'POST', url: '/categories', description: 'Crear categoría' }
    ],
    DIDDEC_STAFF: [
      { method: 'GET', url: '/diddec/statistics', description: 'Estadísticas' },
      { method: 'GET', url: '/diddec/resources', description: 'Recursos DIDDEC' },
      { method: 'GET', url: '/students', description: 'Lista de estudiantes' }
    ],
    DOCENTE: [
      { method: 'GET', url: '/courses', description: 'Mis cursos' },
      { method: 'GET', url: '/students', description: 'Mis estudiantes' }
    ],
    ESTUDIANTE: [
      { method: 'GET', url: '/students/profile', description: 'Mi perfil estudiantil' },
      { method: 'GET', url: '/consents/my-consent', description: 'Mi consentimiento' }
    ]
  };

  return [...commonEndpoints, ...(roleSpecificEndpoints[role] || [])];
}

// Ejecutar testing
testEndpointsWithAuth().catch(console.error); 