// Script de prueba temporal para verificar inserción de usuarios nuevos
const { MongoClient } = require('mongodb');

async function testNewUserInsert() {
  const client = new MongoClient('mongodb://localhost:27017/ucn_inclui2');
  
  try {
    await client.connect();
    const db = client.db('ucn_inclui2');
    const collection = db.collection('users');
    
    console.log('🧪 Eliminando un usuario para probar inserción...');
    const deleted = await collection.deleteOne({ email: 'educadora@ucn.cl' });
    console.log(`   Usuario eliminado: ${deleted.deletedCount > 0 ? 'SÍ' : 'NO'}`);
    
    console.log(`📊 Usuarios después de eliminación: ${await collection.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

testNewUserInsert();
