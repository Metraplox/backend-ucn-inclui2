const { MongoClient } = require('mongodb');

async function checkDatabases() {
  console.log('🔍 Verificando bases de datos en MongoDB');
  
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    // Listar todas las bases de datos
    const admin = client.db().admin();
    const databases = await admin.listDatabases();
    
    console.log('\n📊 Bases de datos disponibles:');
    databases.databases.forEach(db => {
      console.log(`  📁 ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Verificar específicamente ucn_inclui2_prod
    const prodDb = client.db('ucn_inclui2_prod');
    const collections = await prodDb.listCollections().toArray();
    
    console.log('\n🗂️ Colecciones en ucn_inclui2_prod:');
    if (collections.length === 0) {
      console.log('  ❌ No hay colecciones en la base de datos');
    } else {
      for (const col of collections) {
        const count = await prodDb.collection(col.name).countDocuments();
        console.log(`  📄 ${col.name}: ${count} documentos`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔒 Conexión cerrada');
  }
}

checkDatabases(); 