const axios = require('axios');

async function testRoles() {
  console.log('🔍 Testing /students endpoint to see RolesGuard debug...\n');
  
  try {
    // Login
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: 'coordinadora@ucn.cl',
      password: 'Test123!'
    });
    
    const token = loginResponse.data?.data?.data?.access_token;
    console.log('✅ Token obtenido, haciendo petición a /students...\n');
    
    // Test students endpoint (esto debería mostrar debug en consola del servidor)
    const response = await axios.get('http://localhost:3000/students', {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true
    });
    
    console.log('📊 Resultado:');
    console.log(`Status: ${response.status}`);
    console.log(`Message: ${response.data?.message || 'No message'}`);
    console.log('\n👀 Revisa la consola del servidor para ver el debug del RolesGuard');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRoles(); 