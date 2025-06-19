const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Simular exactamente lo que hace RolesGuard
function simulateRolesGuard(requiredRoles, userRoles) {
  console.log('🔬 SIMULACIÓN EXACTA DE ROLESGUARD:');
  console.log('==================================');
  
  console.log(`Required roles: ${JSON.stringify(requiredRoles)}`);
  console.log(`User roles: ${JSON.stringify(userRoles)}`);
  console.log(`User roles type: ${typeof userRoles} (isArray: ${Array.isArray(userRoles)})`);
  
  // Paso 1: Verificar si no hay roles requeridos
  if (!requiredRoles || requiredRoles.length === 0) {
    console.log('✅ Sin roles requeridos, acceso permitido');
    return true;
  }
  
  // Paso 2: Verificar si el usuario no existe o roles no es array
  if (!userRoles || !Array.isArray(userRoles)) {
    console.log('❌ Usuario sin roles válidos');
    return false;
  }
  
  // Paso 3: Verificar si tiene al menos uno de los roles requeridos
  console.log('\n🔍 Verificación rol por rol:');
  for (const reqRole of requiredRoles) {
    const hasRole = userRoles.includes(reqRole);
    console.log(`  "${reqRole}": ${hasRole ? '✅' : '❌'}`);
    if (hasRole) {
      console.log(`\n✅ ACCESO CONCEDIDO - Usuario tiene rol: ${reqRole}`);
      return true;
    }
  }
  
  console.log('\n❌ ACCESO DENEGADO - Usuario no tiene ningún rol requerido');
  return false;
}

async function debugRolesManually() {
  console.log('🔧 DEBUG MANUAL DEL PROBLEMA DE ROLES');
  console.log('=====================================');

  try {
    // 1. Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'coordinadora.inclusion@ucn.cl',
      password: 'inclui2025'
    });
    
    const authData = loginResponse.data.data?.data || loginResponse.data.data || loginResponse.data;
    const token = authData.access_token;
    const userRoles = authData.user.roles;
    
    console.log(`🔐 Login exitoso - Roles: ${JSON.stringify(userRoles)}`);
    
    // 2. Definir los roles requeridos para GET /users según el controlador
    // @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
    const requiredRoles = ['COORDINADOR', 'EDUCADORA_SOCIAL'];
    
    // 3. Simular RolesGuard
    const shouldHaveAccess = simulateRolesGuard(requiredRoles, userRoles);
    
    console.log(`\n📋 RESULTADO DE SIMULACIÓN: ${shouldHaveAccess ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO'}`);
    
    // 4. Probar endpoint real
    console.log('\n🌐 PRUEBA ENDPOINT REAL:');
    console.log('=========================');
    
    try {
      const usersResponse = await axios.get(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Endpoint real: ACCESO PERMITIDO');
    } catch (error) {
      console.log(`❌ Endpoint real: ACCESO DENEGADO (${error.response?.status})`);
    }
    
    // 5. Análisis de discrepancia
    console.log('\n📊 ANÁLISIS:');
    console.log('=============');
    if (shouldHaveAccess) {
      console.log('🤔 La simulación dice que DEBERÍA funcionar pero el endpoint real falla');
      console.log('💡 Posibles causas:');
      console.log('   1. Hay otro guard adicional interferiendo');
      console.log('   2. Los valores del enum no coinciden con los esperados');
      console.log('   3. Problema en el decorador @Roles');
      console.log('   4. Problema en la compilación/cache de NestJS');
    } else {
      console.log('✅ La simulación coincide con el resultado real');
    }

  } catch (error) {
    console.error('❌ Error en debug:', error.message);
  }
}

debugRolesManually(); 