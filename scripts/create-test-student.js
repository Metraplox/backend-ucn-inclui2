#!/usr/bin/env node

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/ucn_inclui2_prod';

async function createTestStudent() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB');
    
    const db = client.db();
    const studentsCollection = db.collection('students');
    const usersCollection = db.collection('users');
    
    // Buscar el usuario estudiante
    const studentUser = await usersCollection.findOne({ email: 'estudiante@alumnos.ucn.cl' });
    if (!studentUser) {
      console.log('❌ Usuario estudiante no encontrado');
      return;
    }
    
    console.log('👤 Usuario estudiante encontrado:', studentUser._id);
    
    // Verificar si ya existe un perfil de estudiante
    const existingStudent = await studentsCollection.findOne({ email: studentUser.email });
    if (existingStudent) {
      console.log('✅ Perfil de estudiante ya existe');
      return;
    }
    
    // Crear perfil de estudiante de prueba
    const studentProfile = {
      _id: studentUser._id, // Mismo ID que el usuario
      rut: '12.345.678-9',
      email: studentUser.email,
      firstName: 'Estudiante',
      lastName: 'NEE',
      nombreCompleto: studentUser.nombreCompleto,
      fechaNacimiento: new Date('1999-05-15'),
      telefono: '+56 9 1234 5678',
      direccion: 'Calle Falsa 123, Antofagasta',
      
      // Información académica
      codigoEstudiante: 'EST001',
      careerName: 'Ingeniería Informática',
      semestreActual: 5,
      promedioGeneral: 6.2,
      creditosAprobados: 120,
      creditosTotales: 240,
      situacionAcademica: 'REGULAR',
      
      // Información NEE
      neeCategories: ['DISCAPACIDAD_VISUAL'],
      neeDescription: 'Discapacidad visual parcial',
      diagnosticoProfesional: true,
      fechaDiagnostico: new Date('2023-03-15'),
      observacionesGenerales: 'Requiere material en formato digital ampliado',
      
      // Estado y fechas
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Información adicional requerida por el schema
      currentSemester: '202510',
      yearAdmission: 2021,
      additionalInfo: {
        emergencyContact: {
          name: 'María López',
          relationship: 'Madre',
          phone: '+56 9 8765 4321'
        }
      }
    };
    
    await studentsCollection.insertOne(studentProfile);
    console.log('✅ Perfil de estudiante creado exitosamente');
    console.log('📋 Detalles del estudiante:');
    console.log(`   Email: ${studentProfile.email}`);
    console.log(`   Código: ${studentProfile.codigoEstudiante}`);
    console.log(`   Carrera: ${studentProfile.careerName}`);
    console.log(`   NEE: ${studentProfile.neeCategories.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  createTestStudent();
}

module.exports = { createTestStudent };
