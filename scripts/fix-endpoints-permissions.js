const { MongoClient } = require('mongodb');

// Configuración
const MONGODB_URI = 'mongodb://localhost:27017';
const DATABASE_NAME = 'ucn_inclui2_test';

async function fixEndpointsPermissions() {
  console.log('🔧 INICIANDO CORRECCIONES DE PERMISOS DE ENDPOINTS');
  console.log('==========================================');

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    // 1. Verificar estado actual de usuarios
    console.log('\n📊 VERIFICANDO ESTADO ACTUAL DE USUARIOS');
    console.log('----------------------------------------');
    
    const users = await db.collection('users').find({}).toArray();
    console.log(`👥 Total usuarios: ${users.length}`);
    
    for (const user of users) {
      console.log(`📧 ${user.email}:`);
      console.log(`   🔑 Roles: ${Array.isArray(user.roles) ? user.roles.join(', ') : 'NO DEFINIDOS'}`);
      console.log(`   ✅ Activo: ${user.isActive === true ? 'SÍ' : 'NO'}`);
      console.log(`   🔐 Hash: ${user.password_hash ? 'PRESENTE' : 'AUSENTE'}`);
    }
    
    // 2. Verificar roles específicos para endpoints problemáticos
    console.log('\n🎯 VERIFICANDO ROLES PARA ENDPOINTS CRÍTICOS');
    console.log('--------------------------------------------');
    
    const coordinadores = users.filter(u => u.roles && u.roles.includes('coordinador'));
    const educadoras = users.filter(u => u.roles && u.roles.includes('educadora_social'));
    const docentes = users.filter(u => u.roles && u.roles.includes('docente'));
    const estudiantes = users.filter(u => u.roles && u.roles.includes('estudiante'));
    
    console.log(`👑 Coordinadores: ${coordinadores.length}`);
    coordinadores.forEach(u => console.log(`   - ${u.email}`));
    
    console.log(`👩‍🏫 Educadoras Sociales: ${educadoras.length}`);
    educadoras.forEach(u => console.log(`   - ${u.email}`));
    
    console.log(`👨‍🏫 Docentes: ${docentes.length}`);
    docentes.forEach(u => console.log(`   - ${u.email}`));
    
    console.log(`🎓 Estudiantes: ${estudiantes.length}`);
    estudiantes.forEach(u => console.log(`   - ${u.email}`));
    
    // 3. Crear script de endpoints testing actualizado
    await createEndpointTestingScript();
    
    console.log('\n✅ ANÁLISIS DE PERMISOS COMPLETADO');
    console.log('=================================');
    console.log('');
    console.log('📋 PROBLEMAS IDENTIFICADOS:');
    console.log('1. /users/profile NO tiene decorador @Roles()');
    console.log('2. Sistema RolesGuard muy restrictivo');
    console.log('3. Endpoints inexistentes: /consents/all, /nee-categories, /educational-resources');
    console.log('');
    console.log('🔧 CORRECCIONES REQUERIDAS:');
    console.log('1. Actualizar UsersController para /users/profile');
    console.log('2. Revisar rutas de categorías y recursos');
    console.log('3. Ajustar RolesGuard para permitir acceso más flexible');
    
  } catch (error) {
    console.error('❌ Error durante el análisis:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

async function createEndpointTestingScript() {
  console.log('\n📝 CREANDO SCRIPT DE TESTING ACTUALIZADO');
  console.log('---------------------------------------');
  
  const testingScript = `const axios = require('axios');

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
    const response = await axios.post(\`\${BASE_URL}/auth/login\`, testUsers[userType]);
    const authData = response.data.data?.data || response.data.data || response.data;
    return authData.access_token;
  } catch (error) {
    console.error(\`❌ Login falló para \${userType}:\`, error.response?.data?.message || error.message);
    return null;
  }
}

async function testEndpoint(token, method, path, description) {
  try {
    const config = {
      method: method.toLowerCase(),
      url: \`\${BASE_URL}\${path}\`,
      headers: { 'Authorization': \`Bearer \${token}\` },
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
    console.log(\`\\n🔍 Testing: \${endpoint.method} \${endpoint.path}\`);
    console.log(\`   📝 Descripción: \${endpoint.description}\`);
    
    const result = await testEndpoint(coordinadorToken, endpoint.method, endpoint.path, endpoint.description);
    
    if (result.success) {
      console.log(\`   ✅ FUNCIONA: Status \${result.status}\`);
      fixedCount++;
    } else {
      console.log(\`   ❌ FALLA: Status \${result.status} - \${result.message}\`);
      stillBrokenCount++;
    }
  }
  
  console.log(\`\\n📊 RESULTADOS DEL TESTING:\`);
  console.log(\`✅ Endpoints corregidos: \${fixedCount}/\${problematicEndpoints.length}\`);
  console.log(\`❌ Endpoints aún problemáticos: \${stillBrokenCount}/\${problematicEndpoints.length}\`);
  console.log(\`📈 Progreso: \${((fixedCount / problematicEndpoints.length) * 100).toFixed(1)}%\`);
  
  if (stillBrokenCount === 0) {
    console.log('\\n🎉 ¡TODOS LOS ENDPOINTS PROBLEMÁTICOS HAN SIDO CORREGIDOS!');
  } else {
    console.log('\\n⚠️  Aún hay endpoints que requieren atención');
  }
}

// Ejecutar tests
runProblematicEndpointTests().catch(console.error);
`;
  
  const fs = require('fs');
  fs.writeFileSync('scripts/test-problematic-endpoints.js', testingScript);
  console.log('✅ Script creado: scripts/test-problematic-endpoints.js');
}

if (require.main === module) {
  fixEndpointsPermissions();
}

module.exports = { fixEndpointsPermissions }; 