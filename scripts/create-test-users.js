// Script para crear usuarios de prueba con las credenciales exactas que usa validate-production-flows.js
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/ucn_inclui2_test';
const SALT_ROUNDS = 10;

const testUsers = [
  {
    email: 'coordinador@test.ucn.cl',
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'Coordinador',
    role: 'COORDINACION',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'docente@test.ucn.cl', 
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'Docente',
    role: 'DOCENTE',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'estudiante@test.ucn.cl',
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'Estudiante', 
    role: 'ESTUDIANTE',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'jefatura@test.ucn.cl',
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'Jefatura',
    role: 'JEFATURA',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'diddec@test.ucn.cl',
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'DIDDEC',
    role: 'DIDDEC',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function createTestUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Eliminar usuarios de prueba existentes
    await usersCollection.deleteMany({ 
      email: { $in: testUsers.map(u => u.email) }
    });
    console.log('🗑️ Usuarios de prueba anteriores eliminados');
    
    // Crear usuarios con passwords hasheados
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      const userToInsert = {
        ...userData,
        password: hashedPassword
      };
      
      await usersCollection.insertOne(userToInsert);
      console.log(`✅ Usuario creado: ${userData.email} (${userData.role})`);
    }
    
    console.log('🎉 Todos los usuarios de prueba creados exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createTestUsers();
