#!/usr/bin/env node

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000';
const TEST_CREDENTIALS = {
  coordinador: { email: 'coordinador@ucn.cl', password: 'password123' },
  educadora: { email: 'educadora@ucn.cl', password: 'password123' },
  diddec: { email: 'diddec@ucn.cl', password: 'password123' },
  estudiante: { email: 'estudiante@alumnos.ucn.cl', password: 'password123' },
  docente: { email: 'docente@ucn.cl', password: 'password123' },
  jefe_carrera: { email: 'jefe.carrera@ucn.cl', password: 'password123' },
  jefe_departamento: { email: 'jefe.departamento@ucn.cl', password: 'password123' }
};

// Endpoints que cada dashboard necesita
const DASHBOARD_ENDPOINTS = {
  estudiante: [
    '/students/profile',
    '/adjustments/history',
    '/courses/student'
  ],
  docente: [
    '/students',
    '/adjustments',
    '/courses'
  ],
  coordinador: [
    '/students',
    '/adjustments',
    '/statistics'
  ],
  educadora: [
    '/students',
    '/adjustments'
  ],
  diddec: [
    '/diddec/statistics',
    '/students',
    '/adjustments'
  ],
  jefe_carrera: [
    '/students',
    '/adjustments',
    '/careers/teachers'
  ],
  jefe_departamento: [
    '/students',
    '/adjustments',
    '/careers/teachers'
  ]
};

async function testLogin(role, credentials) {
  try {
    console.log(`\n🔍 PROBANDO LOGIN: ${role}`);
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    
    if (response.data?.data?.data?.access_token) {
      console.log(`✅ Login exitoso para ${role}`);
      return response.data.data.data.access_token;
    } else {
      console.log(`❌ Login fallido para ${role}: estructura de respuesta incorrecta`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Login fallido para ${role}: ${error.message}`);
    return null;
  }
}

async function testEndpoint(endpoint, token, role) {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`  ✅ ${endpoint} - Status: ${response.status}`);
    return true;
  } catch (error) {
    if (error.response) {
      console.log(`  ❌ ${endpoint} - Status: ${error.response.status} - ${error.response.data?.message || 'Error desconocido'}`);
    } else {
      console.log(`  ❌ ${endpoint} - Error de conexión: ${error.message}`);
    }
    return false;
  }
}

async function testDashboard(role) {
  console.log(`\n🎯 PROBANDO DASHBOARD: ${role.toUpperCase()}`);
  console.log('='.repeat(50));
  
  const credentials = TEST_CREDENTIALS[role];
  if (!credentials) {
    console.log(`❌ No hay credenciales para ${role}`);
    return;
  }
  
  // 1. Login
  const token = await testLogin(role, credentials);
  if (!token) {
    console.log(`❌ No se puede continuar sin token para ${role}`);
    return;
  }
  
  // 2. Probar endpoints
  const endpoints = DASHBOARD_ENDPOINTS[role] || [];
  console.log(`\n📋 PROBANDO ${endpoints.length} ENDPOINTS:`);
  
  let successCount = 0;
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint, token, role);
    if (success) successCount++;
  }
  
  console.log(`\n📊 RESULTADO: ${successCount}/${endpoints.length} endpoints funcionando`);
  
  if (successCount === endpoints.length) {
    console.log(`🎉 Dashboard ${role} - COMPLETAMENTE FUNCIONAL`);
  } else {
    console.log(`⚠️ Dashboard ${role} - REQUIERE ATENCIÓN (${endpoints.length - successCount} endpoints fallando)`);
  }
  
  return successCount === endpoints.length;
}

async function main() {
  console.log('🔍 VALIDACIÓN COMPLETA DE DASHBOARDS PARA PRODUCCIÓN');
  console.log('='.repeat(60));
  console.log('Verificando que todos los dashboards estén conectados al backend...\n');
  
  const roles = Object.keys(DASHBOARD_ENDPOINTS);
  const results = {};
  
  for (const role of roles) {
    results[role] = await testDashboard(role);
    console.log('\n' + '-'.repeat(60));
  }
  
  console.log('\n🎯 RESUMEN FINAL:');
  console.log('='.repeat(60));
  
  let totalFunctional = 0;
  for (const [role, isWorking] of Object.entries(results)) {
    const status = isWorking ? '✅ FUNCIONAL' : '❌ REQUIERE ATENCIÓN';
    console.log(`${role.padEnd(15)} - ${status}`);
    if (isWorking) totalFunctional++;
  }
  
  console.log(`\n📊 TOTAL: ${totalFunctional}/${roles.length} dashboards completamente funcionales`);
  
  if (totalFunctional === roles.length) {
    console.log('🎉 SISTEMA LISTO PARA PRODUCCIÓN - Todos los dashboards funcionando');
  } else {
    console.log('⚠️ SISTEMA REQUIERE CORRECCIONES antes de producción');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
