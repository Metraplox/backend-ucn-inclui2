// Script para poblar la base de datos CORRECTA que usa el backend (ucn_inclui2_prod)
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function populateCorrectDatabase() {
  // El backend usa ucn_inclui2_prod, no ucn_inclui2_db
  const client = new MongoClient('mongodb://localhost:27017/ucn_inclui2_prod');
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB (base de datos correcta: ucn_inclui2_prod)');
    
    const db = client.db('ucn_inclui2_prod');
    const collection = db.collection('users');
    
    // Verificar si ya hay usuarios
    const existingCount = await collection.countDocuments();
    console.log(`📊 Usuarios existentes en ucn_inclui2_prod: ${existingCount}`);
    
    // Limpiar usuarios existentes
    if (existingCount > 0) {
      await collection.deleteMany({});
      console.log('🧹 Base de datos limpiada');
    }
    
    // Insertar usuarios de prueba con password_hash correcto
    console.log('🌱 Insertando usuarios de prueba en ucn_inclui2_prod...');
    const defaultPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        email: 'coordinador@ucn.cl',
        nombreCompleto: 'Ana López Coordinadora',
        password_hash: defaultPassword,
        roles: ['COORDINADOR'],
        isActive: true
      },
      {
        email: 'estudiante1@ucn.cl',
        nombreCompleto: 'Juan Pérez Estudiante',
        password_hash: defaultPassword,
        roles: ['ESTUDIANTE'],
        isActive: true
      },
      {
        email: 'docente@ucn.cl',
        nombreCompleto: 'María González Docente',
        password_hash: defaultPassword,
        roles: ['DOCENTE'],
        isActive: true
      },
      {
        email: 'diddec@ucn.cl',
        nombreCompleto: 'Carlos Martínez DIDDEC',
        password_hash: defaultPassword,
        roles: ['DIDDEC_STAFF'],
        isActive: true
      },
      {
        email: 'educadora@ucn.cl',
        nombreCompleto: 'Laura Silva Educadora',
        password_hash: defaultPassword,
        roles: ['EDUCADORA_SOCIAL'],
        isActive: true
      },
      {
        email: 'jefe.carrera@ucn.cl',
        nombreCompleto: 'Roberto Hernández Jefe Carrera',
        password_hash: defaultPassword,
        roles: ['JEFE_CARRERA'],
        isActive: true
      },
      {
        email: 'jefe.departamento@ucn.cl',
        nombreCompleto: 'Patricia Morales Jefe Departamento',
        password_hash: defaultPassword,
        roles: ['JEFE_DEPARTAMENTO'],
        isActive: true
      }
    ];
    
    const result = await collection.insertMany(users);
    console.log(`✅ Insertados ${result.insertedCount} usuarios en ucn_inclui2_prod`);
    
    // Verificar inserción
    const newCount = await collection.countDocuments();
    console.log(`📊 Total usuarios después de inserción: ${newCount}`);
    
    // Verificar un usuario específico
    const coordinador = await collection.findOne({ email: 'coordinador@ucn.cl' });
    console.log('\n🔍 Verificación del coordinador:');
    console.log(`  📧 Email: ${coordinador.email}`);
    console.log(`  🔐 password_hash: ${coordinador.password_hash ? 'EXISTE' : 'NO EXISTE'}`);
    console.log(`  👥 Roles: ${coordinador.roles.join(', ')}`);
    console.log(`  ✅ Base de datos: ucn_inclui2_prod (CORRECTA)`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

populateCorrectDatabase();
