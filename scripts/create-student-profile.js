#!/usr/bin/env node

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/ucn_inclui2_prod';

async function createStudentProfile() {
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
    
    // Verificar si ya existe un perfil de estudiante
    const existingStudent = await studentsCollection.findOne({ userId: studentUser._id });
    
    if (existingStudent) {
      console.log('✅ Perfil de estudiante ya existe');
      return;
    }
    
    // Crear perfil de estudiante
    const studentProfile = {
      userId: studentUser._id,
      email: studentUser.email,
      firstName: studentUser.firstName,
      lastName: studentUser.lastName,
      nombreCompleto: `${studentUser.firstName} ${studentUser.lastName}`,
      rut: '12345678-9',
      carrera: 'Ingeniería en Computación e Informática',
      semestre: '2025-1',
      añoIngreso: 2023,
      isActive: true,
      nee: {
        tipoNEE: 'Dificultades de Aprendizaje',
        descripcion: 'Estudiante con dificultades de concentración y procesamiento de información',
        requiereApoyo: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await studentsCollection.insertOne(studentProfile);
    console.log('✅ Perfil de estudiante creado:', result.insertedId);
    
    console.log('\n📋 PERFIL CREADO:');
    console.log('================');
    console.log(`👤 Nombre: ${studentProfile.nombreCompleto}`);
    console.log(`📧 Email: ${studentProfile.email}`);
    console.log(`🎓 Carrera: ${studentProfile.carrera}`);
    console.log(`📚 Semestre: ${studentProfile.semestre}`);
    console.log(`🏥 NEE: ${studentProfile.nee.tipoNEE}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  createStudentProfile();
}
