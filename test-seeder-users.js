const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Usuarios que deberían existir en la base de datos
const testUsers = [
  {
    email: 'coordinador@ucn.cl',
    password: 'password123',
    expectedRole: 'COORDINADOR'
  },
  {
    email: 'estudiante1@ucn.cl',
    password: 'password123',
    expectedRole: 'ESTUDIANTE'
  },
  {
    email: 'docente@ucn.cl',
    password: 'password123',
    expectedRole: 'DOCENTE'
  },
  {
    email: 'diddec@ucn.cl',
    password: 'password123',
    expectedRole: 'DIDDEC_STAFF'
  },
  {
    email: 'educadora@ucn.cl',
    password: 'password123',
    expectedRole: 'EDUCADORA_SOCIAL'
  },
  {
    email: 'jefe.carrera@ucn.cl',
    password: 'password123',
    expectedRole: 'JEFE_CARRERA'
  },
  {
    email: 'jefe.departamento@ucn.cl',
    password: 'password123',
    expectedRole: 'JEFE_DEPARTAMENTO'
  }
];

async function testLogin(user) {
  try {
    console.log(`\n🧪 Probando login: ${user.email}`);
    
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: user.email,
      password: user.password
    });

    if (response.data && response.data.success) {
      const userData = response.data.data.user;
      const token = response.data.data.access_token;
      
      console.log(`   ✅ Login exitoso`);
      console.log(`   👤 Usuario: ${userData.nombreCompleto}`);
      console.log(`   🔑 Roles: ${userData.roles.join(', ')}`);
      console.log(`   🎯 Rol esperado: ${user.expectedRole}`);
      console.log(`   🎫 Token: ${token ? 'Recibido' : 'NO recibido'}`);
      
      // Verificar si el rol es el esperado
      if (userData.roles.includes(user.expectedRole)) {
        console.log(`   ✅ Rol correcto`);
      } else {
        console.log(`   ❌ Rol incorrecto`);
      }
      
      return { success: true, token, user: userData };
    } else {
      console.log(`   ❌ Respuesta inesperada del servidor`);
      return { success: false };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAllLogins() {
  console.log('🚀 PROBANDO LOGINS CON USUARIOS DEL SEEDER');
  console.log('==========================================');
  
  const results = [];
  
  for (const user of testUsers) {
    const result = await testLogin(user);
    results.push({ ...user, ...result });
  }
  
  console.log('\n📊 RESUMEN DE RESULTADOS:');
  console.log('=========================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Exitosos: ${successful.length}/${testUsers.length}`);
  console.log(`❌ Fallidos: ${failed.length}/${testUsers.length}`);
  
  if (failed.length > 0) {
    console.log('\n❌ Usuarios que fallaron:');
    failed.forEach(user => {
      console.log(`   • ${user.email}: ${user.error || 'Error desconocido'}`);
    });
  }
  
  if (successful.length === testUsers.length) {
    console.log('\n🎉 ¡TODOS LOS USUARIOS DEL SEEDER FUNCIONAN CORRECTAMENTE!');
    console.log('✅ El frontend puede usar estos datos para login');
  }
}

// Ejecutar las pruebas
testAllLogins().catch(console.error);
