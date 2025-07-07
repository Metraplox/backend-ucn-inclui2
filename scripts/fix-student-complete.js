#!/usr/bin/env node

// Script para corregir datos del estudiante en MongoDB
// Problema: email incorrecto y roles en minúsculas

db = db.getSiblingDB('ucn_inclui2_prod');

print('🔧 Corrigiendo datos del estudiante...');

// 1. Actualizar roles de estudiantes de minúsculas a mayúsculas
print('📝 Actualizando roles de estudiantes...');
const studentsWithWrongRole = db.users.find({ roles: 'estudiante' });
studentsWithWrongRole.forEach(user => {
  print(`Corrigiendo rol de ${user.email}: estudiante -> ESTUDIANTE`);
  db.users.updateOne(
    { _id: user._id },
    { 
      $set: { 
        roles: ['ESTUDIANTE'],
        updatedAt: new Date()
      }
    }
  );
});

// 2. Crear usuario estudiante con el email que espera el frontend
print('👤 Creando usuario estudiante@alumnos.ucn.cl...');

// Primero verificar si ya existe
const existingStudent = db.users.findOne({ email: 'estudiante@alumnos.ucn.cl' });
if (existingStudent) {
  print('✅ Usuario estudiante@alumnos.ucn.cl ya existe');
} else {
  // Crear nuevo usuario estudiante
  const newStudentUser = {
    _id: ObjectId('652000000000000000000015'),
    email: 'estudiante@alumnos.ucn.cl',
    password_hash: '$2b$10$JlO830kFfP/PAcWiqr6keOq2kqABvroccwvLTdz4SWPec13NSS0ta', // password123
    nombreCompleto: 'Estudiante de Prueba',
    roles: ['ESTUDIANTE'],
    isActive: true,
    isProfileComplete: true,
    studentId: ObjectId('653000000000000000000005'),
    additionalResponsibilities: {
      isDepartmentHead: false,
      isCareerHead: false,
      isDIDDECStaff: false,
      departmentIds: [],
      careerIds: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  db.users.insertOne(newStudentUser);
  print('✅ Usuario estudiante@alumnos.ucn.cl creado');
  
  // Crear perfil de estudiante correspondiente
  const newStudentProfile = {
    _id: ObjectId('653000000000000000000005'),
    userId: ObjectId('652000000000000000000015'),
    email: 'estudiante@alumnos.ucn.cl',
    nombres: 'Estudiante',
    apellidos: 'de Prueba',
    nombreCompleto: 'Estudiante de Prueba',
    rut: '12345678-0',
    telefono: '+56912345678',
    semestre: '2025-1',
    anioIngreso: 2023,
    carreraId: ObjectId('651000000000000000000001'), // Ingeniería en Computación
    isActive: true,
    necesidadesEducativasEspeciales: 'Déficit Atencional con Hiperactividad (TDAH)',
    informacionContacto: 'Contacto de emergencia: Padre - 56987654321',
    fechaNacimiento: new Date('2002-03-15'),
    consentimientoFirmado: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  db.students.insertOne(newStudentProfile);
  print('✅ Perfil de estudiante creado');
}

// 3. Verificar resultado
print('\n📋 Verificando configuración final...');
const finalUser = db.users.findOne({ email: 'estudiante@alumnos.ucn.cl' });
const finalProfile = db.students.findOne({ email: 'estudiante@alumnos.ucn.cl' });

if (finalUser && finalProfile) {
  print('✅ CONFIGURACIÓN CORRECTA:');
  print(`👤 Usuario: ${finalUser.email}`);
  print(`🔑 Roles: ${finalUser.roles}`);
  print(`📖 Student ID: ${finalUser.studentId}`);
  print(`👨‍🎓 Perfil ID: ${finalProfile._id}`);
  print(`📧 Perfil Email: ${finalProfile.email}`);
  print(`🎯 Relación correcta: ${finalUser.studentId.toString() === finalProfile._id.toString()}`);
} else {
  print('❌ Error en la configuración');
}

print('\n🎉 Script completado!');
