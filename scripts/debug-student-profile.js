#!/usr/bin/env node

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/ucn_inclui2_prod';

async function debugStudentProfile() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    const studentsCollection = db.collection('students');
    
    // Buscar el usuario estudiante
    const studentUser = await usersCollection.findOne({ email: 'estudiante@alumnos.ucn.cl' });
    console.log('\n👤 USUARIO ESTUDIANTE:');
    console.log('======================');
    if (studentUser) {
      console.log(`ID: ${studentUser._id}`);
      console.log(`Email: ${studentUser.email}`);
      console.log(`Nombre: ${studentUser.nombreCompleto}`);
      console.log(`Roles: ${studentUser.roles.join(', ')}`);
    } else {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    // Buscar perfiles de estudiante
    const studentProfiles = await studentsCollection.find({}).toArray();
    console.log('\n📚 PERFILES DE ESTUDIANTE EN BD:');
    console.log('================================');
    console.log(`Total perfiles: ${studentProfiles.length}`);
    
    studentProfiles.forEach((student, index) => {
      console.log(`\n${index + 1}. Perfil:`);
      console.log(`   ID: ${student._id}`);
      console.log(`   UserID: ${student.userId || 'N/A'}`);
      console.log(`   Email: ${student.email || 'N/A'}`);
      console.log(`   RUT: ${student.rut || 'N/A'}`);
      console.log(`   Nombre: ${student.nombreCompleto || student.firstName + ' ' + student.lastName || 'N/A'}`);
    });
    
    // Buscar perfil específico para este usuario
    const matchingProfile = await studentsCollection.findOne({ userId: studentUser._id });
    console.log('\n🎯 PERFIL VINCULADO AL USUARIO:');
    console.log('===============================');
    if (matchingProfile) {
      console.log('✅ Perfil encontrado y vinculado correctamente');
      console.log(`   ID: ${matchingProfile._id}`);
      console.log(`   RUT: ${matchingProfile.rut}`);
      console.log(`   Carrera: ${matchingProfile.carrera || 'N/A'}`);
    } else {
      console.log('❌ No hay perfil vinculado a este usuario');
      
      // Intentar vincular un perfil existente
      console.log('\n🔧 INTENTANDO REPARAR VINCULACIÓN...');
      const existingProfile = await studentsCollection.findOne({ email: 'estudiante@alumnos.ucn.cl' });
      
      if (existingProfile) {
        console.log('✅ Perfil existente encontrado por email');
        
        // Actualizar para vincular con el usuario
        const updateResult = await studentsCollection.updateOne(
          { _id: existingProfile._id },
          { $set: { userId: studentUser._id } }
        );
        
        if (updateResult.modifiedCount > 0) {
          console.log('✅ Perfil vinculado exitosamente');
        } else {
          console.log('❌ No se pudo vincular el perfil');
        }
      } else {
        console.log('❌ No hay perfil existente para vincular');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  debugStudentProfile();
}
