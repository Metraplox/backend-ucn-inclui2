#!/usr/bin/env node

const axios = require('axios');

async function testDirectLogin() {
  try {
    console.log('🔍 PROBANDO LOGIN DIRECTO CONTRA BACKEND');
    console.log('==========================================');
    
    const response = await axios.post('http://localhost:3000/auth/login', {
      email: 'coordinador@ucn.cl',
      password: 'password123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ RESPUESTA EXITOSA:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ ERROR EN LOGIN:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error completo:', error.message);
    }
  }
}

testDirectLogin();
