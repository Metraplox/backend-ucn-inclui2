#!/usr/bin/env node

const axios = require('axios');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const BASE_URL = 'http://localhost:3000';
const MONGODB_URI = 'mongodb://localhost:27017/ucn_inclui2_prod';

const testUsers = [
  {
    email: 'coordinador@ucn.cl',
    password: 'password123',
    role: 'COORDINADOR',
    expectedEndpoints: ['/students', '/adjustments', '/notifications']
  },
  {
    email: 'educadora@ucn.cl',
    password: 'password123',
    role: 'EDUCADORA_SOCIAL',
    expectedEndpoints: ['/students', '/adjustments', '/notifications']
  },
  {
    email: 'diddec@ucn.cl',
    password: 'password123',
    role: 'DIDDEC_STAFF',
    expectedEndpoints: ['/students', '/diddec/statistics', '/notifications']
  },
  {
    email: 'estudiante@alumnos.ucn.cl',
    password: 'password123',
    role: 'ESTUDIANTE',
    expectedEndpoints: ['/students/profile', '/notifications']
  },
  {
    email: 'docente@ucn.cl',
    password: 'password123',
    role: 'DOCENTE',
    expectedEndpoints: ['/students', '/notifications']
  },
  {
    email: 'jefe.carrera@ucn.cl',
    password: 'password123',
    role: 'JEFE_CARRERA',
    expectedEndpoints: ['/students', '/notifications']
  },
  {
    email: 'jefe.departamento@ucn.cl',
    password: 'password123',
    role: 'JEFE_DEPARTAMENTO',
    expectedEndpoints: ['/students', '/notifications']
  }
];

let testResults = [];

async function loginUser(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password
    });
    
    // Navegar por la estructura anidada del backend
    let data = response.data;
    while (data && typeof data === 'object' && data.data) {
      data = data.data;
    }
    
    return data.access_token;
  } catch (error) {
    throw new Error(`Login falló: ${error.response?.data?.message || error.message}`);
  }
}

async function testEndpoint(endpoint, token, userRole) {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return {
      endpoint,
      status: response.status,
      success: true,
      data: response.data ? 'Data received' : 'No data'
    };
  } catch (error) {
    return {
      endpoint,
      status: error.response?.status || 0,
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

async function ensureStudentProfile() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    
    // Buscar el usuario estudiante
    const usersCollection = db.collection('users');
    const student = await usersCollection.findOne({ email: 'estudiante@alumnos.ucn.cl' });
    
    if (!student) {
      console.log('❌ Usuario estudiante no encontrado');
      return false;
    }
    
    // Verificar si ya tiene perfil en la colección students
    const studentsCollection = db.collection('students');
    const existingProfile = await studentsCollection.findOne({ userId: student._id });
    
    if (!existingProfile) {
      console.log('🔧 Creando perfil de estudiante...');
      const studentProfile = {
        userId: student._id,
        rut: '12345678-9',
        firstName: 'Juan',
        lastName: 'Pérez Estudiante',
        email: 'estudiante@alumnos.ucn.cl',
        phone: '+56912345678',
        carrera: 'Ingeniería en Computación e Informática',
        año: 3,
        semestre: 6,
        isActive: true,
        needsSpecialSupport: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await studentsCollection.insertOne(studentProfile);
      console.log('✅ Perfil de estudiante creado');
    } else {
      console.log('✅ Perfil de estudiante ya existe');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error verificando perfil estudiante:', error.message);
    return false;
  } finally {
    await client.close();
  }
}

async function runProductionTests() {
  console.log('🚀 VERIFICACIÓN COMPLETA PARA PRODUCCIÓN');
  console.log('==========================================');
  
  // Paso 1: Asegurar datos base
  console.log('\n📋 PASO 1: Verificando datos base...');
  const profileCreated = await ensureStudentProfile();
  if (!profileCreated) {
    console.log('❌ No se pudo crear perfil de estudiante');
  }
  
  // Paso 2: Probar cada usuario y sus endpoints
  console.log('\n🔐 PASO 2: Probando autenticación y endpoints...');
  
  for (const user of testUsers) {
    console.log(`\n👤 Probando usuario: ${user.email} (${user.role})`);
    
    try {
      // Login
      const token = await loginUser(user.email, user.password);
      console.log('  ✅ Login exitoso');
      
      testResults.push({
        user: user.email,
        role: user.role,
        login: true,
        endpoints: []
      });
      
      // Probar endpoints
      for (const endpoint of user.expectedEndpoints) {
        const result = await testEndpoint(endpoint, token, user.role);
        testResults[testResults.length - 1].endpoints.push(result);
        
        if (result.success) {
          console.log(`  ✅ ${endpoint}: ${result.status}`);
        } else {
          console.log(`  ❌ ${endpoint}: ${result.status} - ${result.error}`);
        }
      }
      
    } catch (error) {
      console.log(`  ❌ Login falló: ${error.message}`);
      testResults.push({
        user: user.email,
        role: user.role,
        login: false,
        error: error.message,
        endpoints: []
      });
    }
  }
  
  // Paso 3: Resumen de resultados
  console.log('\n📊 RESUMEN DE RESULTADOS PARA PRODUCCIÓN');
  console.log('==========================================');
  
  let totalUsers = testResults.length;
  let successfulLogins = testResults.filter(r => r.login).length;
  let totalEndpoints = 0;
  let successfulEndpoints = 0;
  
  testResults.forEach(result => {
    totalEndpoints += result.endpoints.length;
    successfulEndpoints += result.endpoints.filter(e => e.success).length;
  });
  
  console.log(`👥 Usuarios probados: ${successfulLogins}/${totalUsers}`);
  console.log(`🌐 Endpoints funcionando: ${successfulEndpoints}/${totalEndpoints}`);
  
  if (successfulLogins === totalUsers && successfulEndpoints === totalEndpoints) {
    console.log('\n🎉 SISTEMA LISTO PARA PRODUCCIÓN AL 100%');
  } else {
    console.log('\n⚠️ PROBLEMAS DETECTADOS - REQUIERE ATENCIÓN');
    console.log('\n🔧 PROBLEMAS ESPECÍFICOS:');
    
    testResults.forEach(result => {
      if (!result.login) {
        console.log(`❌ ${result.user}: Login falló - ${result.error}`);
      } else {
        result.endpoints.forEach(endpoint => {
          if (!endpoint.success) {
            console.log(`❌ ${result.user} -> ${endpoint.endpoint}: ${endpoint.status} - ${endpoint.error}`);
          }
        });
      }
    });
  }
  
  return {
    totalUsers,
    successfulLogins,
    totalEndpoints,
    successfulEndpoints,
    readyForProduction: successfulLogins === totalUsers && successfulEndpoints === totalEndpoints
  };
}

if (require.main === module) {
  runProductionTests().then(results => {
    process.exit(results.readyForProduction ? 0 : 1);
  }).catch(error => {
    console.error('❌ Error en pruebas:', error);
    process.exit(1);
  });
}
