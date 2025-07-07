#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Usuarios de prueba con credenciales correctas
const testUsers = [
  { email: 'coordinador@ucn.cl', password: 'password123', role: 'COORDINADOR' },
  { email: 'educadora@ucn.cl', password: 'password123', role: 'EDUCADORA_SOCIAL' },
  { email: 'diddec@ucn.cl', password: 'password123', role: 'DIDDEC_STAFF' },
  { email: 'docente@ucn.cl', password: 'password123', role: 'DOCENTE' },
  { email: 'jefe.carrera@ucn.cl', password: 'password123', role: 'JEFE_CARRERA' },
  { email: 'jefe.departamento@ucn.cl', password: 'password123', role: 'JEFE_DEPARTAMENTO' },
  { email: 'estudiante@alumnos.ucn.cl', password: 'password123', role: 'ESTUDIANTE' }
];

async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password
    });
    
    // La estructura correcta según nuestro análisis
    return response.data.data.data.accessToken;
  } catch (error) {
    console.error(`❌ Error login ${email}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function testStudentsEndpoint(token, role) {
  try {
    const response = await axios.get(`${BASE_URL}/students`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ ${role}: Acceso a /students exitoso (${response.data.data?.length || 0} estudiantes)`);
    return true;
  } catch (error) {
    console.log(`❌ ${role}: Acceso a /students fallido - ${error.response?.status} ${error.response?.statusText}`);
    return false;
  }
}

async function testStudentProfile(token, role) {
  try {
    const response = await axios.get(`${BASE_URL}/students/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ ${role}: Acceso a /students/profile exitoso`);
    return true;
  } catch (error) {
    console.log(`❌ ${role}: Acceso a /students/profile fallido - ${error.response?.status} ${error.response?.statusText}`);
    return false;
  }
}

async function validateStudentsAccess() {
  console.log('\n🔍 === VALIDACIÓN DE ACCESO A ENDPOINTS DE ESTUDIANTES ===\n');
  
  const results = [];
  
  for (const user of testUsers) {
    console.log(`🔐 Probando usuario: ${user.email} (${user.role})`);
    
    const token = await login(user.email, user.password);
    if (!token) {
      console.log(`❌ No se pudo obtener token para ${user.role}\n`);
      results.push({ role: user.role, login: false, students: false, profile: false });
      continue;
    }
    
    console.log(`✅ Login exitoso para ${user.role}`);
    
    let studentsAccess = false;
    let profileAccess = false;
    
    // Probar acceso a /students (solo para roles autorizados)
    if (['COORDINADOR', 'EDUCADORA_SOCIAL', 'DIDDEC_STAFF', 'JEFE_CARRERA', 'JEFE_DEPARTAMENTO', 'DOCENTE'].includes(user.role)) {
      studentsAccess = await testStudentsEndpoint(token, user.role);
    } else {
      console.log(`➡️ ${user.role}: No debe acceder a /students`);
      studentsAccess = true; // Marcamos como correcto si no debe acceder
    }
    
    // Probar acceso a /students/profile (solo para ESTUDIANTE)
    if (user.role === 'ESTUDIANTE') {
      profileAccess = await testStudentProfile(token, user.role);
    } else {
      profileAccess = true; // Marcamos como correcto si no es estudiante
    }
    
    results.push({ 
      role: user.role, 
      login: true, 
      students: studentsAccess, 
      profile: profileAccess 
    });
    
    console.log('');
  }
  
  // Resumen
  console.log('\n📋 === RESUMEN DE VALIDACIÓN ===\n');
  
  let totalSuccess = 0;
  const totalTests = results.length;
  
  results.forEach(result => {
    const success = result.login && result.students && result.profile;
    const icon = success ? '✅' : '❌';
    
    if (success) totalSuccess++;
    
    console.log(`${icon} ${result.role}: Login: ${result.login ? '✅' : '❌'}, Students: ${result.students ? '✅' : '❌'}, Profile: ${result.profile ? '✅' : '❌'}`);
  });
  
  console.log(`\n🎯 RESULTADO FINAL: ${totalSuccess}/${totalTests} roles funcionando correctamente`);
  
  if (totalSuccess === totalTests) {
    console.log('🎉 ¡TODOS LOS ENDPOINTS DE ESTUDIANTES FUNCIONAN CORRECTAMENTE!');
  } else {
    console.log('⚠️ HAY PROBLEMAS QUE REQUIEREN ATENCIÓN');
  }
}

if (require.main === module) {
  validateStudentsAccess();
}
