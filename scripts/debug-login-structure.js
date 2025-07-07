#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testLoginStructure() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'coordinador@ucn.cl',
      password: 'password123'
    });
    
    console.log('=== ESTRUCTURA COMPLETA DE RESPUESTA ===');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testLoginStructure();
