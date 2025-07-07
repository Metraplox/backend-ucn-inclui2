#!/usr/bin/env node

const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/ucn_inclui2_prod';
const SALT_ROUNDS = 10;

async function updateStudentPasswords() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB (ucn_inclui2_prod)');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Estudiante 1: fechaNacimiento 2002-03-15 -> password 15032002
    const password1 = '15032002';
    const hashedPassword1 = await bcrypt.hash(password1, SALT_ROUNDS);
    
    await usersCollection.updateOne(
      { email: 'estudiante1@ucn.cl' },
      { $set: { password_hash: hashedPassword1 } }
    );
    console.log(`✅ Password actualizado para estudiante1@ucn.cl: ${password1}`);
    
    // Estudiante 2: fechaNacimiento 2001-07-22 -> password 22072001
    const password2 = '22072001';
    const hashedPassword2 = await bcrypt.hash(password2, SALT_ROUNDS);
    
    await usersCollection.updateOne(
      { email: 'estudiante2@ucn.cl' },
      { $set: { password_hash: hashedPassword2 } }
    );
    console.log(`✅ Password actualizado para estudiante2@ucn.cl: ${password2}`);
    
    console.log('\n🎉 Contraseñas de estudiantes actualizadas exitosamente');
    console.log('\n📋 CREDENCIALES DE ESTUDIANTES:');
    console.log('==============================');
    console.log('👤 estudiante1@ucn.cl - 15032002 (fecha: 15/03/2002)');
    console.log('👤 estudiante2@ucn.cl - 22072001 (fecha: 22/07/2001)');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  updateStudentPasswords();
}
