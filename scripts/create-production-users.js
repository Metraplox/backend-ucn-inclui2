#!/usr/bin/env node

const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/ucn_inclui2_test';
const SALT_ROUNDS = 10;

const productionUsers = [
  {
    email: 'coordinador@ucn.cl',
    password: 'password123',
    firstName: 'Coordinador',
    lastName: 'Programa Incluye',
    roles: ['COORDINADOR'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'educadora@ucn.cl',
    password: 'password123',
    firstName: 'Educadora',
    lastName: 'Social',
    roles: ['EDUCADORA_SOCIAL'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'diddec@ucn.cl',
    password: 'password123',
    firstName: 'Staff',
    lastName: 'DIDDEC',
    roles: ['DIDDEC_STAFF'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'estudiante@alumnos.ucn.cl',
    password: 'password123',
    firstName: 'Estudiante',
    lastName: 'NEE',
    roles: ['ESTUDIANTE'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'docente@ucn.cl',
    password: 'password123',
    firstName: 'Docente',
    lastName: 'Profesor',
    roles: ['DOCENTE'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'jefe.carrera@ucn.cl',
    password: 'password123',
    firstName: 'Jefe',
    lastName: 'de Carrera',
    roles: ['JEFE_CARRERA'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'jefe.departamento@ucn.cl',
    password: 'password123',
    firstName: 'Jefe',
    lastName: 'de Departamento',
    roles: ['JEFE_DEPARTAMENTO'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function createProductionUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    await usersCollection.deleteMany({ 
      email: { $in: productionUsers.map(u => u.email) }
    });
    console.log('🗑️ Usuarios de producción anteriores eliminados');
    
    for (const user of productionUsers) {
      const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
      
      const userDocument = {
        ...user,
        password: hashedPassword
      };
      
      await usersCollection.insertOne(userDocument);
      console.log(`✅ Usuario creado: ${user.email} (${user.roles.join(', ')})`);
    }
    
    console.log('\n🎉 Todos los usuarios de producción creados exitosamente');
    console.log('\n📋 CREDENCIALES DE ACCESO:');
    console.log('=========================');
    productionUsers.forEach(user => {
      console.log(`👤 ${user.email} - ${user.password} (${user.roles.join(', ')})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  createProductionUsers();
}
