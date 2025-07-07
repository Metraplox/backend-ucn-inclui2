const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3000/auth/login', {
      email: 'coordinador@test.ucn.cl',
      password: 'Test123!'
    });
    
    console.log('✅ Login exitoso:', response.data);
  } catch (error) {
    console.log('❌ Error de login:', error.response?.data || error.message);
  }
}

testLogin();
