#!/usr/bin/env node

const axios = require('axios');
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/ucn_inclui2_prod';
const BASE_URL = 'http://localhost:3000';

async function diagnoseRoleIssues() {
  console.log('🔍 DIAGNÓSTICO DE ROLES PARA PRODUCCIÓN');
  console.log('======================================');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Obtener todos los usuarios
    const users = await usersCollection.find({}).toArray();
    
    console.log('\n📋 ROLES EN BASE DE DATOS:');
    users.forEach(user => {
      console.log(`${user.email}: ${JSON.stringify(user.roles)}`);
    });
    
    // Probar autenticación y roles en JWT
    console.log('\n🔐 ROLES EN JWT TOKENS:');
    
    for (const user of users) {
      if (user.email.includes('@ucn.cl') || user.email.includes('@alumnos.ucn.cl')) {
        try {
          const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: user.email,
            password: 'password123'
          });
          
          let data = response.data;
          while (data && typeof data === 'object' && data.data) {
            data = data.data;
          }
          
          // Decodificar JWT (simple decode, no verificación)
          const token = data.access_token;
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          
          console.log(`${user.email}: ${JSON.stringify(payload.roles)}`);
          
        } catch (error) {
          console.log(`${user.email}: Error - ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

diagnoseRoleIssues();
