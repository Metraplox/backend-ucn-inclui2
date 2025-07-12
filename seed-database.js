// Seeder definitivo para usuarios de prueba UCN INCLUI2
// Última actualización: 10/07/2025

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

/**
 * SEEDER OFICIAL UCN INCLUI2
 * 
 * Este es el único script autorizado para poblar usuarios de prueba.
 * Usa la configuración estándar de base de datos: ucn_inclui2
 * 
 * Comportamiento:
 * - NO limpia la base de datos
 * - Verifica si cada usuario ya existe antes de insertarlo
 * - Solo inserta usuarios que no existen (evita duplicados)
 * - Muestra resumen de usuarios nuevos vs existentes
 * 
 * Contraseña de todos los usuarios: password123
 */

// Configuración estándar de base de datos
const MONGO_URI = 'mongodb://localhost:27017/ucn_inclui2';
const DATABASE_NAME = 'ucn_inclui2';

async function seedDatabase() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    console.log(`📍 URI: ${MONGO_URI}`);
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('users');
    
    // Verificar usuarios existentes
    const existingCount = await collection.countDocuments();
    console.log(`📊 Usuarios existentes: ${existingCount}`);
    
    // Insertar usuarios de prueba (solo si no existen)
    console.log('🌱 Verificando e insertando usuarios de prueba...');
    const defaultPasswordHash = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        email: 'coordinador@ucn.cl',
        nombreCompleto: 'Ana López Coordinadora',
        password_hash: defaultPasswordHash,
        roles: ['COORDINADOR'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'estudiante1@ucn.cl',
        nombreCompleto: 'Juan Pérez Estudiante',
        password_hash: defaultPasswordHash,
        roles: ['ESTUDIANTE'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'docente@ucn.cl',
        nombreCompleto: 'María González Docente',
        password_hash: defaultPasswordHash,
        roles: ['DOCENTE'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'diddec@ucn.cl',
        nombreCompleto: 'Carlos Martínez DIDDEC',
        password_hash: defaultPasswordHash,
        roles: ['DIDDEC_STAFF'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'educadora@ucn.cl',
        nombreCompleto: 'Laura Silva Educadora',
        password_hash: defaultPasswordHash,
        roles: ['EDUCADORA_SOCIAL'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'jefe.carrera@ucn.cl',
        nombreCompleto: 'Roberto Hernández Jefe Carrera',
        password_hash: defaultPasswordHash,
        roles: ['JEFE_CARRERA'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'jefe.departamento@ucn.cl',
        nombreCompleto: 'Patricia Morales Jefe Departamento',
        password_hash: defaultPasswordHash,
        roles: ['JEFE_DEPARTAMENTO'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Insertar solo usuarios que no existen
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const user of users) {
      const existingUser = await collection.findOne({ email: user.email });
      
      if (existingUser) {
        console.log(`⏭️  Usuario ya existe: ${user.email} (${user.roles[0]})`);
        skippedCount++;
      } else {
        await collection.insertOne(user);
        console.log(`✅ Usuario creado: ${user.email} (${user.roles[0]})`);
        insertedCount++;
      }
    }
    
    console.log(`\n📈 Resumen:`);
    console.log(`   ✅ Usuarios nuevos: ${insertedCount}`);
    console.log(`   ⏭️  Usuarios existentes: ${skippedCount}`);
    console.log(`   📊 Total en BD: ${await collection.countDocuments()}`);
    
    // Verificar un usuario específico
    const coordinador = await collection.findOne({ email: 'coordinador@ucn.cl' });
    if (coordinador) {
      console.log('\n🔍 Verificación del coordinador:');
      console.log(`  📧 Email: ${coordinador.email}`);
      console.log(`  🔐 password_hash: ${coordinador.password_hash ? 'EXISTE' : 'NO EXISTE'}`);
      console.log(`  👥 Roles: ${coordinador.roles.join(', ')}`);
      console.log(`  ✅ Base de datos: ${DATABASE_NAME} (ESTÁNDAR)`);
    }
    
    console.log('\n🎯 USUARIOS DE PRUEBA DISPONIBLES:');
    console.log('┌─────────────────────────────┬────────────────────┬─────────────┐');
    console.log('│ Email                       │ Rol                │ Password    │');
    console.log('├─────────────────────────────┼────────────────────┼─────────────┤');
    
    // Mostrar todos los usuarios de prueba (existentes + nuevos)
    const testUsers = await collection.find({ 
      email: { $in: users.map(u => u.email) }
    }).toArray();
    
    testUsers.forEach(user => {
      const email = user.email.padEnd(27);
      const role = user.roles[0].padEnd(18);
      console.log(`│ ${email} │ ${role} │ password123 │`);
    });
    console.log('└─────────────────────────────┴────────────────────┴─────────────┘');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n🎉 Seeder completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en seeder:', error.message);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
