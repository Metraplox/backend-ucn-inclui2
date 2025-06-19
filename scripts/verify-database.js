const { MongoClient } = require('mongodb');

const MONGO_URL = 'mongodb://localhost:27017';

async function verifyDatabase() {
  console.log('🔍 VERIFICANDO BASE DE DATOS MONGODB');
  console.log('=====================================');
  
  try {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    // Listar bases de datos
    const admin = client.db().admin();
    const dbs = await admin.listDatabases();
    console.log('\n📂 Bases de datos disponibles:');
    dbs.databases.forEach(db => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Verificar ucn_inclui2_test (la base de datos real)
    const db = client.db('ucn_inclui2_test');
    const collections = await db.listCollections().toArray();
    console.log('\n📚 Colecciones en ucn_inclui2_test:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Contar usuarios
    if (collections.find(c => c.name === 'users')) {
      const userCount = await db.collection('users').countDocuments();
      console.log(`\n👥 Total de usuarios: ${userCount}`);
      
      if (userCount > 0) {
        console.log('\n📋 Usuarios en base de datos:');
        const users = await db.collection('users').find({}, { projection: { email: 1, roles: 1, nombreCompleto: 1 } }).toArray();
        users.forEach(user => {
          console.log(`  - ${user.email} (${user.roles?.join(', ') || 'sin roles'}) - ${user.nombreCompleto || 'sin nombre'}`);
        });
      }
    } else {
      console.log('❌ Colección "users" no encontrada');
    }
    
    await client.close();
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyDatabase(); 