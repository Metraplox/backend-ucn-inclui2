const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔐 Probando login...');
    
    const response = await axios.post('http://localhost:3000/auth/login', {
      email: 'docente@ucn.cl',
      password: 'password123'
    });
    
    console.log('✅ Login exitoso:', {
      status: response.status,
      responseData: response.data
    });
    
    // Verificar estructura de respuesta
    if (response.data && response.data.access_token) {
      console.log('🎫 Token encontrado en respuesta directa');
      return response.data.access_token;
    } else if (response.data && response.data.data && response.data.data.access_token) {
      console.log('🎫 Token encontrado en respuesta.data');
      return response.data.data.access_token;
    } else {
      console.log('❌ No se encontró token en la respuesta');
      console.log('📋 Estructura completa de respuesta:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error en login:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
}

testLogin();
