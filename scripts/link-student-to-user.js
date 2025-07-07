#!/usr/bin/env node

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/ucn_inclui2_prod';

async function linkStudentToUser() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    const studentsCollection = db.collection('students');
    
    // Buscar el usuario estudiante
    const studentUser = await usersCollection.findOne({ email: 'estudiante@alumnos.ucn.cl' });
    
    if (!studentUser) {
      console.log('❌ Usuario estudiante no encontrado');
      return;
    }
    
    console.log('✅ Usuario estudiante encontrado:', studentUser._id);
    console.log('📧 Email:', studentUser.email);
    console.log('🔑 Roles:', studentUser.roles);
    console.log('📖 Student ID actual:', studentUser.studentId);
    
    // Buscar el perfil de estudiante correspondiente
    const studentProfile = await studentsCollection.findOne({ userId: studentUser._id });
    
    if (!studentProfile) {
      console.log('❌ Perfil de estudiante no encontrado');
      console.log('🔧 Ejecutando script de creación de perfil...');
      
      // Crear perfil de estudiante básico
      const studentProfileData = {
        userId: studentUser._id,
        email: studentUser.email,
        nombres: 'Juan Carlos',
        apellidos: 'Pérez García',
        nombreCompleto: 'Juan Carlos Pérez García',
        rut: '12345678-9',
        semestre: '2025-1',
        anioIngreso: 2023,
        isActive: true,
        necesidadesEducativasEspeciales: 'Dificultades de concentración y procesamiento de información',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await studentsCollection.insertOne(studentProfileData);
      console.log('✅ Perfil de estudiante creado:', result.insertedId);
      
      // Actualizar el usuario con el studentId
      await usersCollection.updateOne(
        { _id: studentUser._id },
        { 
          $set: { 
            studentId: result.insertedId.toString(),
            updatedAt: new Date()
          } 
        }
      );
      
      console.log('✅ Usuario actualizado con studentId:', result.insertedId.toString());
      
    } else {
      console.log('✅ Perfil de estudiante encontrado:', studentProfile._id);
      console.log('👤 Nombre:', studentProfile.nombreCompleto);
      
      // Verificar si el usuario tiene el studentId correcto
      if (!studentUser.studentId || studentUser.studentId !== studentProfile._id.toString()) {
        console.log('🔧 Actualizando studentId en el usuario...');
        
        await usersCollection.updateOne(
          { _id: studentUser._id },
          { 
            $set: { 
              studentId: studentProfile._id.toString(),
              updatedAt: new Date()
            } 
          }
        );
        
        console.log('✅ Usuario actualizado con studentId:', studentProfile._id.toString());
      } else {
        console.log('✅ StudentId ya está correctamente configurado');
      }
    }
    
    // Verificar resultado final
    const updatedUser = await usersCollection.findOne({ email: 'estudiante@alumnos.ucn.cl' });
    const finalStudentProfile = await studentsCollection.findOne({ userId: updatedUser._id });
    
    console.log('\n📋 CONFIGURACIÓN FINAL:');
    console.log('======================');
    console.log('👤 Usuario ID:', updatedUser._id);
    console.log('📧 Email:', updatedUser.email);
    console.log('🔑 Roles:', updatedUser.roles);
    console.log('📖 Student ID:', updatedUser.studentId);
    console.log('👨‍🎓 Perfil ID:', finalStudentProfile?._id);
    console.log('✅ Relación correcta:', updatedUser.studentId === finalStudentProfile?._id.toString());
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  linkStudentToUser();
}
