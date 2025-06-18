const { MongoClient } = require('mongodb');

async function debugRoles() {
  console.log('🔍 DEBUG: Verificando Roles de Usuarios');
  
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db('ucn_inclui2_test');
    const users = await db.collection('users').find({}).toArray();
    
    console.log(`\n👥 Total usuarios: ${users.length}`);
    console.log('\n📋 ROLES POR USUARIO:');
    console.log('====================');
    
    for (const user of users) {
      console.log(`\n👤 ${user.email}:`);
      console.log(`   🔑 Roles: ${user.roles ? user.roles.join(', ') : 'SIN ROLES'}`);
      console.log(`   ✅ Activo: ${user.isActive}`);
      console.log(`   📧 Email válido: ${user.email.includes('@')}`);
    }
    
    // Verificar roles específicos
    console.log('\n🎯 VERIFICACIÓN ESPECÍFICA:');
    console.log('==========================');
    
    const coordinator = users.find(u => u.email === 'coordinadora.inclusion@ucn.cl');
    if (coordinator) {
      console.log(`📧 Coordinador roles: ${coordinator.roles}`);
      console.log(`📧 Tipo de roles: ${typeof coordinator.roles}`);
      console.log(`📧 Es array?: ${Array.isArray(coordinator.roles)}`);
    }
    
    // Mostrar enum de roles esperados
    console.log('\n📚 ROLES ESPERADOS EN EL SISTEMA:');
    console.log('================================');
    console.log('- COORDINADOR');
    console.log('- EDUCADORA_SOCIAL');
    console.log('- DIDDEC_STAFF');
    console.log('- JEFE_CARRERA');
    console.log('- JEFE_DEPARTAMENTO');
    console.log('- DOCENTE');
    console.log('- ESTUDIANTE');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔒 Conexión cerrada');
  }
}

debugRoles(); 