const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function debugPasswordHashes() {
  console.log('🔐 DEBUG: Password Hashes Verification');
  
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    // Usar la base de datos correcta según .env
    const db = client.db('ucn_inclui2_test');
    const users = await db.collection('users').find({}).toArray();
    
    console.log(`\n👥 Total usuarios encontrados: ${users.length}`);
    
    // Verificar coordinadora específicamente
    const coordinator = users.find(u => u.email === 'coordinadora.inclusion@ucn.cl');
    
    if (coordinator) {
      console.log('\n🎯 Verificando coordinadora.inclusion@ucn.cl:');
      console.log('📧 Email:', coordinator.email);
      console.log('🆔 ID:', coordinator._id);
      console.log('🔑 Hash almacenado:', coordinator.password_hash);
      
      // Probar la contraseña
      const testPassword = 'inclui2025';
      console.log(`🧪 Probando contraseña: "${testPassword}"`);
      
      if (coordinator.password_hash) {
        const isValid = await bcrypt.compare(testPassword, coordinator.password_hash);
        console.log('✅ ¿Contraseña válida?', isValid ? 'SÍ' : 'NO');
        
        if (!isValid) {
          // Crear nuevo hash para verificar
          const newHash = await bcrypt.hash(testPassword, 10);
          console.log('🔧 Nuevo hash que debería ser:', newHash);
          
          // Probar si el nuevo hash funciona
          const testNewHash = await bcrypt.compare(testPassword, newHash);
          console.log('🧪 ¿Nuevo hash válido?', testNewHash ? 'SÍ' : 'NO');
        }
      } else {
        console.log('❌ No hay hash de contraseña almacenado');
      }
    } else {
      console.log('❌ Usuario coordinadora.inclusion@ucn.cl no encontrado');
    }
    
    // Verificar algunos usuarios más
    console.log('\n📋 Estado de todos los usuarios:');
    for (const user of users.slice(0, 5)) {
      console.log(`\n👤 ${user.email}:`);
      console.log(`   🔑 Hash: ${user.password_hash ? 'PRESENTE' : 'FALTANTE'}`);
      console.log(`   📅 Creado: ${user.createdAt}`);
      console.log(`   ✅ Activo: ${user.isActive}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('🔒 Conexión cerrada');
  }
}

debugPasswordHashes(); 