#!/usr/bin/env node

const axios = require('axios');
const bcrypt = require('bcrypt');

const API_BASE = 'http://localhost:3000';

// Test directo del login con un usuario específico
async function testSpecificLogin() {
  const testUser = {
    email: 'coordinadora@ucn.cl',
    password: 'password123'
  };
  
  console.log('🔍 TEST ESPECÍFICO DE LOGIN');
  console.log('===========================');
  console.log(`📧 Email: ${testUser.email}`);
  console.log(`🔑 Password: ${testUser.password}`);
  
  try {
    console.log('\n🌐 Enviando request de login...');
    
    const response = await axios.post(`${API_BASE}/auth/login`, testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ LOGIN EXITOSO!');
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ LOGIN FALLÓ');
    console.log('📊 Status:', error.response?.status);
    console.log('📋 Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('🔍 Error Message:', error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔍 ANÁLISIS DEL ERROR 401:');
      console.log('- Las credenciales son incorrectas');
      console.log('- El usuario no existe');
      console.log('- El password no coincide');
      console.log('- Problema en el hash del password');
    }
  }
}

// Test del hash del password
async function testPasswordHash() {
  console.log('\n🔍 TEST DEL HASH DE PASSWORD');
  console.log('=============================');
  
  const password = 'password123';
  const existingHash = '$2b$10$JlO830kFfP/PAcWiqr6keOq2kqABvroccwvLTdz4SWPec13NSS0ta';
  
  console.log(`🔑 Password original: ${password}`);
  console.log(`🔐 Hash en DB: ${existingHash}`);
  
  try {
    const isValid = await bcrypt.compare(password, existingHash);
    console.log(`✅ Hash válido: ${isValid}`);
    
    // Generar nuevo hash para comparar
    const newHash = await bcrypt.hash(password, 10);
    console.log(`🆕 Nuevo hash: ${newHash}`);
    
    const newIsValid = await bcrypt.compare(password, newHash);
    console.log(`✅ Nuevo hash válido: ${newIsValid}`);
    
  } catch (error) {
    console.log('❌ Error en hash:', error.message);
  }
}

async function main() {
  await testPasswordHash();
  await testSpecificLogin();
}

if (require.main === module) {
  main();
}
