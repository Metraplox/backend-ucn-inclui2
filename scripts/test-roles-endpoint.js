const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testRolesEndpoint() {
  console.log('🔒 TEST DIRECTO DEL ENDPOINT /users');
  console.log('===================================');

  try {
    // 1. Login como coordinador
    console.log('1. Haciendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'coordinadora.inclusion@ucn.cl',
      password: 'inclui2025'
    });
    
    const authData = loginResponse.data.data?.data || loginResponse.data.data || loginResponse.data;
    const token = authData.access_token;
    
    console.log('✅ Login exitoso');
    console.log(`📋 Roles obtenidos: ${JSON.stringify(authData.user.roles)}`);

    // 2. Test perfil (debe funcionar)
    console.log('\n2. Probando GET /users/profile...');
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Perfil funciona correctamente');

    // 3. Test endpoint /users (el que falla)
    console.log('\n3. Probando GET /users...');
    const usersResponse = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ /users funciona correctamente');
    console.log(`📊 Número de usuarios: ${usersResponse.data.data?.length || usersResponse.data.length || 'N/A'}`);

  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
    
    if (error.response?.status === 403) {
      console.log('\n🔍 Problema confirmado: 403 Forbidden en /users');
      console.log('✅ JWT válido (perfil funciona)');
      console.log('❌ RolesGuard bloqueando acceso');
    }
  }
}

testRolesEndpoint(); 