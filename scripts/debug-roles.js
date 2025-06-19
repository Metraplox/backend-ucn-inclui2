const axios = require('axios');
const { MongoClient } = require('mongodb');

// Configuración
const BASE_URL = 'http://localhost:3000';
const MONGODB_URI = 'mongodb://localhost:27017';
const DATABASE_NAME = 'ucn_inclui2_test';

async function debugRoles() {
  console.log('🔍 DEBUG: Verificando Problema de Roles y Acceso');
  console.log('================================================');

  const client = new MongoClient(MONGODB_URI);
  let coordinadorToken = null;

  try {
    // 1. Conectar a MongoDB
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    // 2. Verificar roles en la base de datos
    console.log('\n📊 ROLES EN BASE DE DATOS:');
    console.log('===========================');
    
    const users = await db.collection('users').find({}).toArray();
    for (const user of users) {
      console.log(`👤 ${user.email}:`);
      console.log(`   📋 Roles (BD): ${JSON.stringify(user.roles)}`);
      console.log(`   📋 Tipo roles: ${typeof user.roles} (isArray: ${Array.isArray(user.roles)})`);
      console.log(`   ✅ isActive: ${user.isActive}`);
    }

    // 3. Hacer login como coordinador
    console.log('\n🔐 LOGIN COMO COORDINADOR:');
    console.log('===========================');
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'coordinadora.inclusion@ucn.cl',
      password: 'inclui2025'
    });
    
    const authData = loginResponse.data.data?.data || loginResponse.data.data || loginResponse.data;
    coordinadorToken = authData.access_token;
    
    console.log('✅ Login exitoso');
    console.log(`📋 Roles en token: ${JSON.stringify(authData.user.roles)}`);

    // 4. Verificar perfil JWT
    console.log('\n🎫 VERIFICACIÓN DE PERFIL JWT:');
    console.log('==============================');
    
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${coordinadorToken}` }
    });
    
    const profileData = profileResponse.data.data?.data || profileResponse.data.data || profileResponse.data;
    console.log('✅ Perfil JWT exitoso');
    console.log(`📋 Roles en JWT Strategy: ${JSON.stringify(profileData.roles)}`);
    console.log(`📋 Tipo roles JWT: ${typeof profileData.roles} (isArray: ${Array.isArray(profileData.roles)})`);

    // 5. Verificar enum UserRole
    console.log('\n📚 ENUM UserRole ESPERADO:');
    console.log('===========================');
    console.log('COORDINADOR, EDUCADORA_SOCIAL, DIDDEC_STAFF, JEFE_CARRERA, JEFE_DEPARTAMENTO, DOCENTE, ESTUDIANTE');

    // 6. Intentar acceso a endpoint restringido
    console.log('\n🔒 TEST DE ACCESO A /users:');
    console.log('=============================');
    
    try {
      const usersResponse = await axios.get(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${coordinadorToken}` }
      });
      console.log('✅ Acceso a /users EXITOSO');
      console.log(`📊 Usuarios obtenidos: ${usersResponse.data.length || 'N/A'}`);
    } catch (error) {
      console.log('❌ Acceso a /users FALLÓ');
      console.log(`📄 Status: ${error.response?.status}`);
      console.log(`💬 Error: ${error.response?.data?.message || error.message}`);
      
      // Debug detallado del error
      if (error.response?.status === 403) {
        console.log('🔍 ANÁLISIS 403 FORBIDDEN:');
        console.log('  - El JWT es válido (pasa JwtAuthGuard)');
        console.log('  - Pero RolesGuard está bloqueando el acceso');
        console.log('  - Posibles causas:');
        console.log('    1. Valores de roles en BD ≠ valores enum UserRole');
        console.log('    2. Comparación case-sensitive en RolesGuard');
        console.log('    3. Formato incorrecto de roles en JWT Strategy');
      }
    }

    // 7. Verificar valores exactos de roles
    console.log('\n🔬 COMPARACIÓN EXACTA DE ROLES:');
    console.log('================================');
    
    const coordinadorUser = users.find(u => u.email === 'coordinadora.inclusion@ucn.cl');
    if (coordinadorUser) {
      console.log(`BD Role: "${coordinadorUser.roles[0]}" (length: ${coordinadorUser.roles[0].length})`);
      console.log(`Expected: "COORDINADOR" (length: ${'COORDINADOR'.length})`);
      console.log(`Match: ${coordinadorUser.roles[0] === 'COORDINADOR'}`);
      console.log(`Includes: ${coordinadorUser.roles.includes('COORDINADOR')}`);
      
      // Verificar caracteres ocultos
      for (let i = 0; i < coordinadorUser.roles[0].length; i++) {
        const char = coordinadorUser.roles[0].charAt(i);
        const code = coordinadorUser.roles[0].charCodeAt(i);
        console.log(`  Char ${i}: "${char}" (code: ${code})`);
      }
    }

    // 8. Test específico de RolesGuard logic
    console.log('\n⚙️ SIMULACIÓN ROLESGUARD:');
    console.log('=========================');
    
    const requiredRoles = ['COORDINADOR', 'EDUCADORA_SOCIAL'];
    const userRoles = profileData.roles;
    
    console.log(`Required roles: ${JSON.stringify(requiredRoles)}`);
    console.log(`User roles: ${JSON.stringify(userRoles)}`);
    console.log(`User roles type: ${typeof userRoles} (isArray: ${Array.isArray(userRoles)})`);
    
    if (Array.isArray(userRoles)) {
      const hasAccess = requiredRoles.some((role) => userRoles.includes(role));
      console.log(`Should have access: ${hasAccess}`);
      
      // Test manual de includes
      for (const reqRole of requiredRoles) {
        const hasRole = userRoles.includes(reqRole);
        console.log(`  Has "${reqRole}": ${hasRole}`);
      }
    } else {
      console.log('❌ User roles no es un array - problema identificado!');
    }

  } catch (error) {
    console.error('❌ Error en debug:', error.message);
  } finally {
    await client.close();
  }
}

debugRoles(); 