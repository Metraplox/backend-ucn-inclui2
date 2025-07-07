#!/usr/bin/env node

const axios = require('axios');

async function testDetailedAuth() {
  try {
    // 1. Login
    console.log('🔐 Haciendo login...');
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: 'docente@ucn.cl',
      password: 'password123'
    });
    
    let data = loginResponse.data;
    while (data && typeof data === 'object' && data.data) {
      data = data.data;
    }
    
    const token = data.access_token;
    console.log('✅ Login exitoso');
    
    // 2. Decodificar token
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('📋 Payload del token:', JSON.stringify(payload, null, 2));
    
    // 3. Probar endpoint
    console.log('\n🌐 Probando endpoint /students...');
    try {
      const studentsResponse = await axios.get('http://localhost:3000/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Acceso exitoso:', studentsResponse.status);
    } catch (error) {
      console.log('❌ Error de acceso:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDetailedAuth();
