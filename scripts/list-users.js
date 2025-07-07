#!/usr/bin/env node

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/ucn_inclui2_prod';

async function listUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB (ucn_inclui2_prod)');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    const users = await usersCollection.find({}).toArray();
    
    console.log(`\n📋 USUARIOS EN BASE DE DATOS (${users.length} total):`);
    console.log('==============================================');
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Email: ${user.email}`);
      console.log(`   Nombre: ${user.nombreCompleto || user.firstName + ' ' + user.lastName || 'N/A'}`);
      console.log(`   Roles: ${user.roles?.join(', ') || user.role || 'N/A'}`);
      console.log(`   Activo: ${user.isActive}`);
      console.log(`   Password Hash: ${user.password_hash ? 'SÍ' : 'NO'}`);
      console.log(`   Password: ${user.password ? 'SÍ' : 'NO'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  listUsers();
}
