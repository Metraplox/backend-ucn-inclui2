const { MongoClient } = require('mongodb');

async function fixStudentUsers() {
  console.log('🔧 ARREGLANDO USUARIOS ESTUDIANTES');
  console.log('================================');
  
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db('ucn_inclui2_test');
    const usersCollection = db.collection('users');
    
    // Buscar estudiantes problemáticos
    const studentEmails = [
      'estudiante.nee@alumnos.ucn.cl',
      'estudiante.regular@alumnos.ucn.cl'
    ];
    
    console.log('\n🔍 Verificando estudiantes problemáticos...');
    
    for (const email of studentEmails) {
      const student = await usersCollection.findOne({ email });
      
      if (student) {
        console.log(`\n👤 Procesando: ${email}`);
        console.log(`   🔑 Roles actuales: ${student.roles || 'NINGUNO'}`);
        console.log(`   ✅ isActive actual: ${student.isActive}`);
        
        // Actualizar usuario con los campos faltantes
        const updateResult = await usersCollection.updateOne(
          { email },
          {
            $set: {
              roles: ['ESTUDIANTE'],
              isActive: true,
              updatedAt: new Date()
            }
          }
        );
        
        if (updateResult.modifiedCount === 1) {
          console.log(`   ✅ Usuario actualizado exitosamente`);
          console.log(`   🆕 Roles: ['ESTUDIANTE']`);
          console.log(`   🆕 isActive: true`);
        } else {
          console.log(`   ❌ Error actualizando usuario`);
        }
      } else {
        console.log(`\n❌ Usuario no encontrado: ${email}`);
      }
    }
    
    // Verificación final
    console.log('\n🔍 VERIFICACIÓN FINAL:');
    console.log('====================');
    
    for (const email of studentEmails) {
      const student = await usersCollection.findOne({ email });
      if (student) {
        console.log(`\n👤 ${email}:`);
        console.log(`   🔑 Roles: ${student.roles.join(', ')}`);
        console.log(`   ✅ isActive: ${student.isActive}`);
        console.log(`   🔐 Tiene password_hash: ${student.password_hash ? 'SÍ' : 'NO'}`);
      }
    }
    
    console.log('\n🎉 PROCESO COMPLETADO');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.close();
    console.log('\n🔒 Conexión cerrada');
  }
}

fixStudentUsers().catch(console.error); 