const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAuthRoles() {
  console.log('🔍 TEST DEL ENDPOINT /auth/roles');
  console.log('=================================');

  try {
    const response = await axios.post(`${BASE_URL}/auth/roles`);
    console.log('✅ Endpoint /auth/roles funciona');
    console.log('📋 Roles del sistema:');
    
    const roleData = response.data.data?.data || response.data.data || response.data;
    
    if (roleData.roles) {
      roleData.roles.forEach((role, index) => {
        console.log(`  ${index + 1}. ${role.role} - ${role.description}`);
      });
    } else {
      console.log('❌ No se encontraron roles en la respuesta');
      console.log('Raw response:', JSON.stringify(response.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
  }
}

testAuthRoles(); 