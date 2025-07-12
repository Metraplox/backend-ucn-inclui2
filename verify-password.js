// Script para verificar el hash de contraseña
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function verifyPassword() {
  const client = new MongoClient('mongodb://localhost:27017/ucn_inclui2_db');
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db('ucn_inclui2_db');
    const collection = db.collection('users');
    
    const coordinador = await collection.findOne({ email: 'coordinador@ucn.cl' });
    
    if (coordinador) {
      console.log('🔍 Verificando contraseña del coordinador...');
      console.log(`📧 Email: ${coordinador.email}`);
      console.log(`🔐 Hash almacenado: ${coordinador.password_hash}`);
      
      // Probar diferentes contraseñas
      const passwords = ['password123', 'inclui2025', 'admin', '123456'];
      
      for (const pwd of passwords) {
        const isValid = await bcrypt.compare(pwd, coordinador.password_hash);
        console.log(`  🔑 "${pwd}": ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
      }
      
      // Generar un nuevo hash para comparar
      console.log('\n🧪 Generando nuevo hash de "password123":');
      const newHash = await bcrypt.hash('password123', 10);
      console.log(`📝 Nuevo hash: ${newHash}`);
      
      const testComparison = await bcrypt.compare('password123', newHash);
      console.log(`✅ Verificación del nuevo hash: ${testComparison}`);
      
    } else {
      console.log('❌ No se encontró el usuario coordinador');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

verifyPassword();
