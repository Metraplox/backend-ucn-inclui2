// Script para crear usuarios de prueba con contraseñas conocidas
// Fecha: 18-06-2025

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const CONFIG = {
  mongodb: {
    uri: 'mongodb://localhost:27017',
    database: 'ucn_inclui2_test'
  }
};

async function createTestUsers() {
  let client;
  
  try {
    console.log('🔑 CREANDO USUARIOS DE PRUEBA - UCN INCLUI2');
    console.log('==========================================\n');
    
    // Conectar a MongoDB
    client = new MongoClient(CONFIG.mongodb.uri);
    await client.connect();
    const db = client.db(CONFIG.mongodb.database);
    
    console.log('✅ Conectado a MongoDB\n');
    
    // Contraseña común para todos los usuarios de prueba
    const commonPassword = 'Test123!';
    const hashedPassword = await bcrypt.hash(commonPassword, 12);
    
    // Usuarios de prueba
    const testUsers = [
      {
        nombreCompleto: 'Coordinadora Inclusión UCN',
        email: 'coordinadora@ucn.cl',
        password_hash: hashedPassword,
        roles: ['COORDINADOR'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombreCompleto: 'Educadora Social UCN',
        email: 'educadora@ucn.cl',
        password_hash: hashedPassword,
        roles: ['EDUCADORA_SOCIAL'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombreCompleto: 'Director DIDDEC',
        email: 'diddec@ucn.cl',
        password_hash: hashedPassword,
        roles: ['DIDDEC_STAFF'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombreCompleto: 'Jefe Departamento Informática',
        email: 'jefe.informatica@ucn.cl',
        password_hash: hashedPassword,
        roles: ['JEFE_DEPARTAMENTO'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombreCompleto: 'Jefe Carrera ICI',
        email: 'jefe.carrera.ici@ucn.cl',
        password_hash: hashedPassword,
        roles: ['JEFE_CARRERA'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombreCompleto: 'Profesor Matemáticas',
        email: 'profesor@ucn.cl',
        password_hash: hashedPassword,
        roles: ['DOCENTE'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombreCompleto: 'Estudiante NEE Test',
        email: 'estudiante@alumnos.ucn.cl',
        password_hash: hashedPassword,
        roles: ['ESTUDIANTE'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Limpiar usuarios existentes
    console.log('🧹 Limpiando usuarios existentes...');
    await db.collection('users').deleteMany({});
    console.log('✅ Usuarios limpiados\n');
    
    // Crear usuarios
    console.log('👥 Creando usuarios de prueba:');
    console.log('─'.repeat(50));
    
    for (const user of testUsers) {
      try {
        await db.collection('users').insertOne(user);
        console.log(`✅ ${user.roles[0]}: ${user.email}`);
        console.log(`   Contraseña: ${commonPassword}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  Usuario ${user.email} ya existe`);
        } else {
          console.log(`❌ Error creando ${user.email}:`, error.message);
        }
      }
    }
    
    console.log('\n📊 RESUMEN:');
    console.log('─'.repeat(50));
    console.log(`✅ Usuarios creados exitosamente`);
    console.log(`🔑 Contraseña común: ${commonPassword}`);
    console.log(`📧 Emails de prueba:`);
    testUsers.forEach(u => console.log(`   - ${u.email} (${u.roles[0]})`));
    
    console.log('\n✨ USUARIOS DE PRUEBA LISTOS PARA TESTING');
    
  } catch (error) {
    console.error('❌ ERROR:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔒 Conexión cerrada');
    }
  }
}

// Ejecutar script
createTestUsers(); 