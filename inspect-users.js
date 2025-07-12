// Script para inspeccionar los datos de usuario en MongoDB
const { MongoClient } = require('mongodb');

async function inspectUsers() {
  const client = new MongoClient('mongodb://localhost:27017/ucn_inclui2_db');
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db('ucn_inclui2_db');
    const collection = db.collection('users');
    
    // Obtener un usuario de ejemplo para ver su estructura
    const coordinador = await collection.findOne({ email: 'coordinador@ucn.cl' });
    
    if (coordinador) {
      console.log('📊 Estructura del usuario coordinador:');
      console.log(JSON.stringify(coordinador, null, 2));
      
      console.log('\n🔑 Campos relacionados con contraseña:');
      Object.keys(coordinador).forEach(key => {
        if (key.toLowerCase().includes('pass') || key.toLowerCase().includes('hash')) {
          console.log(`  - ${key}: ${coordinador[key] ? '[EXISTE]' : '[NO EXISTE]'}`);
        }
      });
    } else {
      console.log('❌ No se encontró el usuario coordinador');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

inspectUsers();
