const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// 🔧 CONFIGURACIÓN DE ARREGLO DE CONTRASEÑAS
const CONFIG = {
  mongodb: {
    uri: 'mongodb://localhost:27017',
    database: 'ucn_inclui2_test'
  },
  saltRounds: 10,
  defaultPasswords: {
    'inclui2025': ['coordinadora.inclusion@ucn.cl', 'educadora.social@ucn.cl', 'director.diddec@ucn.cl', 
                   'jefe.disc@ucn.cl', 'jefe.dii@ucn.cl', 'jefe.dim@ucn.cl', 'jefe.icci@ucn.cl', 
                   'jefe.ici@ucn.cl', 'profesor.mat101@ucn.cl', 'profesor.fis110@ucn.cl', 
                   'profesor.inf100@ucn.cl', 'profesor.inf134@ucn.cl', 'profesor.inf225@ucn.cl', 
                   'profesor.ici201@ucn.cl'],
    'test123': ['estudiante.nee@alumnos.ucn.cl', 'estudiante.regular@alumnos.ucn.cl']
  }
};

async function fixPasswordHashes() {
  console.log('🔐 ARREGLANDO HASHES DE CONTRASEÑAS FALTANTES');
  console.log('============================================');
  
  const client = new MongoClient(CONFIG.mongodb.uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db(CONFIG.mongodb.database);
    const usersCollection = db.collection('users');
    
    // Obtener todos los usuarios sin hash de contraseña
    const usersWithoutHash = await usersCollection.find({ 
      $or: [
        { password_hash: { $exists: false } },
        { password_hash: null },
        { password_hash: undefined }
      ]
    }).toArray();
    
    console.log(`\n👥 Usuarios sin hash de contraseña: ${usersWithoutHash.length}`);
    
    let updatedCount = 0;
    
    for (const user of usersWithoutHash) {
      let password = 'inclui2025'; // Password por defecto
      
      // Determinar la contraseña correcta según el email
      if (CONFIG.defaultPasswords['test123'].includes(user.email)) {
        password = 'test123';
      }
      
      console.log(`\n🔧 Procesando: ${user.email}`);
      console.log(`   🔑 Asignando contraseña: ${password}`);
      
      try {
        // Generar hash de contraseña
        const passwordHash = await bcrypt.hash(password, CONFIG.saltRounds);
        
        // Actualizar usuario con el hash
        const result = await usersCollection.updateOne(
          { _id: user._id },
          { 
            $set: { 
              password_hash: passwordHash,
              updatedAt: new Date()
            }
          }
        );
        
        if (result.modifiedCount === 1) {
          console.log(`   ✅ Hash actualizado exitosamente`);
          updatedCount++;
          
          // Verificar que funciona
          const isValid = await bcrypt.compare(password, passwordHash);
          console.log(`   🧪 Verificación: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);
        } else {
          console.log(`   ❌ Error actualizando hash`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error procesando ${user.email}:`, error.message);
      }
    }
    
    console.log(`\n🎉 PROCESO COMPLETADO`);
    console.log(`   📊 Usuarios actualizados: ${updatedCount}/${usersWithoutHash.length}`);
    
    // Verificación final
    console.log('\n🔍 VERIFICACIÓN FINAL:');
    const finalUsers = await usersCollection.find({}).toArray();
    
    for (const user of finalUsers.slice(0, 3)) {
      const hasHash = user.password_hash ? 'SÍ' : 'NO';
      console.log(`   👤 ${user.email}: Hash ${hasHash}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.close();
    console.log('\n🔒 Conexión cerrada');
  }
}

// Ejecutar inmediatamente
fixPasswordHashes().catch(console.error); 