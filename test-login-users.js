const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Credenciales de prueba actualizadas
const testUsers = [
  {
    label: 'Coordinador',
    email: 'coordinador@ucn.cl',
    password: 'password123',
    role: 'COORDINADOR'
  },
  {
    label: 'Educadora (Incluye)',
    email: 'educadora@ucn.cl',
    password: 'password123',
    role: 'EDUCADORA_SOCIAL'
  },
  {
    label: 'DIDDEC',
    email: 'diddec@ucn.cl',
    password: 'password123',
    role: 'DIDDEC_STAFF'
  },
  {
    label: 'Estudiante',
    email: 'estudiante@alumnos.ucn.cl',
    password: 'password123',
    role: 'ESTUDIANTE'
  },
  {
    label: 'Docente',
    email: 'docente@ucn.cl',
    password: 'password123',
    role: 'DOCENTE'
  },
  {
    label: 'Jefe Carrera',
    email: 'jefe.carrera@ucn.cl',
    password: 'password123',
    role: 'JEFE_CARRERA'
  },
  {
    label: 'Jefe Departamento',
    email: 'jefe.departamento@ucn.cl',
    password: 'password123',
    role: 'JEFE_DEPARTAMENTO'
  }
];

async function testUserLogin(user) {
  try {
    console.log(`\n👤 Probando: ${user.label} (${user.email})`);
    
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: user.email,
      password: user.password
    });

    if (response.data.success) {
      const userData = response.data.data.user;
      const token = response.data.data.access_token;
      
      console.log(`   ✅ Login exitoso`);
      console.log(`   👤 Usuario: ${userData.nombreCompleto}`);
      console.log(`   🔑 Roles: ${userData.roles.join(', ')}`);
      console.log(`   🎫 Token: ${token ? 'Recibido' : 'NO recibido'}`);
      
      return { success: true, token, user: userData };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAllUsers() {
  console.log('🧪 PRUEBA DE USUARIOS DE LOGIN - PUERTO 3001');
  console.log('=' .repeat(60));
  
  let successCount = 0;
  let totalUsers = testUsers.length;
  
  for (const user of testUsers) {
    const result = await testUserLogin(user);
    if (result.success) {
      successCount++;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Delay entre requests
  }
  
  console.log('\n📊 RESUMEN DE PRUEBAS');
  console.log('=' .repeat(30));
  console.log(`✅ Logins exitosos: ${successCount}/${totalUsers}`);
  console.log(`❌ Logins fallidos: ${totalUsers - successCount}/${totalUsers}`);
  
  if (successCount === totalUsers) {
    console.log('\n🎉 TODOS LOS USUARIOS FUNCIONAN CORRECTAMENTE');
    console.log('✅ Frontend puede usar cualquiera de estos usuarios');
    console.log('✅ Botones de prueba en login screen listos para usar');
  } else {
    console.log('\n⚠️ ALGUNOS USUARIOS TIENEN PROBLEMAS');
    console.log('🔧 Revisar configuración del backend');
  }
}

// Ejecutar las pruebas
testAllUsers().catch(console.error);
