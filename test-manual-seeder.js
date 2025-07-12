// Test manual del seeder para verificar funcionamiento
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function testSeeder() {
  const client = new MongoClient('mongodb://localhost:27017/ucn_inclui2_db');
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db();
    const collection = db.collection('users');
    
    // Verificar usuarios existentes
    const existingUsers = await collection.countDocuments();
    console.log(`📊 Usuarios existentes: ${existingUsers}`);
    
    if (existingUsers > 0) {
      console.log('📋 Usuarios en base de datos:');
      const users = await collection.find({}, { projection: { email: 1, nombreCompleto: 1, roles: 1 } }).toArray();
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.nombreCompleto}) - Roles: ${user.roles.join(', ')}`);
      });
      return;
    }
    
    // Limpiar usuarios existentes primero
    await collection.deleteMany({});
    console.log('🧹 Base de datos limpiada');
    
    // Insertar usuarios de prueba
    console.log('🌱 Insertando usuarios de prueba...');
    const defaultPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        email: 'coordinador@ucn.cl',
        nombreCompleto: 'Ana López Coordinadora',
        password: defaultPassword,
        roles: ['COORDINADOR'],
        isActive: true
      },
      {
        email: 'estudiante1@ucn.cl',
        nombreCompleto: 'Juan Pérez Estudiante',
        password: defaultPassword,
        roles: ['ESTUDIANTE'],
        isActive: true
      },
      {
        email: 'docente@ucn.cl',
        nombreCompleto: 'María González Docente',
        password: defaultPassword,
        roles: ['DOCENTE'],
        isActive: true
      },
      {
        email: 'diddec@ucn.cl',
        nombreCompleto: 'Carlos Martínez DIDDEC',
        password: defaultPassword,
        roles: ['DIDDEC_STAFF'],
        isActive: true
      },
      {
        email: 'educadora@ucn.cl',
        nombreCompleto: 'Laura Silva Educadora',
        password: defaultPassword,
        roles: ['EDUCADORA_SOCIAL'],
        isActive: true
      },
      {
        email: 'jefe.carrera@ucn.cl',
        nombreCompleto: 'Roberto Hernández Jefe Carrera',
        password: defaultPassword,
        roles: ['JEFE_CARRERA'],
        isActive: true
      },
      {
        email: 'jefe.departamento@ucn.cl',
        nombreCompleto: 'Patricia Morales Jefe Departamento',
        password: defaultPassword,
        roles: ['JEFE_DEPARTAMENTO'],
        isActive: true
      }
    ];
    
    const result = await collection.insertMany(users);
    console.log(`✅ Insertados ${result.insertedCount} usuarios`);
    
    // Verificar inserción
    const newCount = await collection.countDocuments();
    console.log(`📊 Total usuarios después de inserción: ${newCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

testSeeder();
