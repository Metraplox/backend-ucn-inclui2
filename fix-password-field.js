// Script para renombrar el campo password a password_hash en todos los usuarios
const { MongoClient } = require('mongodb');

async function updatePasswordField() {
  const client = new MongoClient('mongodb://localhost:27017/ucn_inclui2_db');
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db('ucn_inclui2_db');
    const collection = db.collection('users');
    
    // Obtener todos los usuarios que tienen 'password' pero no 'password_hash'
    const usersToUpdate = await collection.find({ 
      password: { $exists: true },
      password_hash: { $exists: false }
    }).toArray();
    
    console.log(`📊 Usuarios a actualizar: ${usersToUpdate.length}`);
    
    if (usersToUpdate.length > 0) {
      // Actualizar cada usuario para renombrar el campo
      for (const user of usersToUpdate) {
        await collection.updateOne(
          { _id: user._id },
          {
            $set: { password_hash: user.password },
            $unset: { password: "" }
          }
        );
        console.log(`✅ Actualizado usuario: ${user.email}`);
      }
      
      console.log('🎉 Todos los usuarios actualizados correctamente');
    } else {
      console.log('ℹ️ No hay usuarios para actualizar');
    }
    
    // Verificar que la actualización fue exitosa
    const verification = await collection.findOne({ email: 'coordinador@ucn.cl' });
    console.log('\n🔍 Verificación del usuario coordinador:');
    console.log(`  - password_hash: ${verification.password_hash ? '[EXISTE]' : '[NO EXISTE]'}`);
    console.log(`  - password: ${verification.password ? '[EXISTE]' : '[NO EXISTE]'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

updatePasswordField();
