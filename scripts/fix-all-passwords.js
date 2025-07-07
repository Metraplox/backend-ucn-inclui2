#!/usr/bin/env node

const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/ucn_inclui2_prod';
const SALT_ROUNDS = 10;

async function fixAllPasswords() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB (ucn_inclui2_prod)');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Usuarios con password123
    const staffUsers = [
      'coordinadora@ucn.cl',
      'educadora@ucn.cl', 
      'diddec@ucn.cl',
      'jefe.informatica@ucn.cl',
      'jefe.carrera.ici@ucn.cl',
      'docente1@ucn.cl'
    ];
    
    console.log('🔧 Actualizando passwords del staff...');
    const staffPassword = 'password123';
    const staffHash = await bcrypt.hash(staffPassword, SALT_ROUNDS);
    
    for (const email of staffUsers) {
      await usersCollection.updateOne(
        { email: email },
        { $set: { password_hash: staffHash } }
      );
      console.log(`✅ ${email} - password123`);
    }
    
    // Estudiantes con fecha de nacimiento
    console.log('\n🎓 Actualizando passwords de estudiantes...');
    
    // Estudiante 1: fecha 2002-03-15 -> 15032002
    const student1Password = '15032002';
    const student1Hash = await bcrypt.hash(student1Password, SALT_ROUNDS);
    await usersCollection.updateOne(
      { email: 'estudiante1@ucn.cl' },
      { $set: { password_hash: student1Hash } }
    );
    console.log(`✅ estudiante1@ucn.cl - ${student1Password}`);
    
    // Estudiante 2: fecha 2001-07-22 -> 22072001
    const student2Password = '22072001';
    const student2Hash = await bcrypt.hash(student2Password, SALT_ROUNDS);
    await usersCollection.updateOne(
      { email: 'estudiante2@ucn.cl' },
      { $set: { password_hash: student2Hash } }
    );
    console.log(`✅ estudiante2@ucn.cl - ${student2Password}`);
    
    console.log('\n🎉 TODOS LOS PASSWORDS ACTUALIZADOS');
    console.log('\n📋 CREDENCIALES FINALES:');
    console.log('========================');
    console.log('👨‍💼 STAFF (password: password123):');
    staffUsers.forEach(email => {
      console.log(`   👤 ${email}`);
    });
    console.log('\n🎓 ESTUDIANTES (password: fecha nacimiento):');
    console.log(`   👤 estudiante1@ucn.cl - ${student1Password}`);
    console.log(`   👤 estudiante2@ucn.cl - ${student2Password}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  fixAllPasswords();
}
