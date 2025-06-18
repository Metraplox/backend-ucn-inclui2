const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// 🔧 CONFIGURACIÓN
const CONFIG = {
  mongodb: {
    uri: 'mongodb://localhost:27017',
    database: 'ucn_inclui2_test'
  },
  testCredentials: {
    defaultPassword: 'inclui2025', // Password común para testing
    testPassword: 'test123'        // Password alternativo
  }
};

let client;

async function conectarBD() {
  try {
    client = new MongoClient(CONFIG.mongodb.uri);
    await client.connect();
    console.log('✅ Conectado a MongoDB para verificación de credenciales');
    return client.db(CONFIG.mongodb.database);
  } catch (error) {
    console.error('❌ Error conectando a BD:', error);
    throw error;
  }
}

// 🔑 VERIFICAR Y CORREGIR CREDENCIALES
async function verificarCredenciales() {
  const db = await conectarBD();
  
  console.log('\n🔑 VERIFICANDO CREDENCIALES DE ACCESO PARA TESTING');
  console.log('=================================================');

  try {
    // 1️⃣ Obtener todos los usuarios
    const usuarios = await db.collection('users').find({}).toArray();
    console.log(`\n📋 Usuarios encontrados: ${usuarios.length}`);
    
    // 2️⃣ Verificar contraseñas y corregir si es necesario
    const actualizaciones = [];
    const credencialesValidas = [];
    
    for (const usuario of usuarios) {
      console.log(`\n👤 Verificando usuario: ${usuario.email}`);
      
      // Verificar si la contraseña actual es válida
      let passwordCorrecta = false;
      
      try {
        // Probar contraseña por defecto
        if (await bcrypt.compare(CONFIG.testCredentials.defaultPassword, usuario.password)) {
          passwordCorrecta = true;
          console.log(`   ✅ Password válida: ${CONFIG.testCredentials.defaultPassword}`);
        }
        // Probar contraseña alternativa
        else if (await bcrypt.compare(CONFIG.testCredentials.testPassword, usuario.password)) {
          passwordCorrecta = true;
          console.log(`   ✅ Password válida: ${CONFIG.testCredentials.testPassword}`);
        }
      } catch (error) {
        console.log(`   ⚠️ Error verificando password hash: ${error.message}`);
      }
      
      // Si no tiene una contraseña válida, actualizarla
      if (!passwordCorrecta) {
        console.log(`   🔧 Actualizando password para acceso de testing...`);
        const newPasswordHash = await bcrypt.hash(CONFIG.testCredentials.defaultPassword, 10);
        
        actualizaciones.push({
          updateOne: {
            filter: { _id: usuario._id },
            update: { 
              $set: { 
                password: newPasswordHash,
                passwordUpdatedForTesting: true,
                lastPasswordUpdate: new Date()
              }
            }
          }
        });
        
        credencialesValidas.push({
          email: usuario.email,
          password: CONFIG.testCredentials.defaultPassword,
          role: usuario.role,
          name: usuario.nombre || usuario.name || 'Sin nombre'
        });
      } else {
        // Agregar a la lista de credenciales válidas
        credencialesValidas.push({
          email: usuario.email,
          password: CONFIG.testCredentials.defaultPassword,
          role: usuario.role,
          name: usuario.nombre || usuario.name || 'Sin nombre'
        });
      }
    }
    
    // 3️⃣ Aplicar actualizaciones si hay alguna
    if (actualizaciones.length > 0) {
      await db.collection('users').bulkWrite(actualizaciones);
      console.log(`\n✅ ${actualizaciones.length} usuarios actualizados con contraseñas de testing`);
    }
    
    // 4️⃣ Generar lista completa de credenciales para testing
    console.log('\n📋 CREDENCIALES PARA TESTING:');
    console.log('=============================');
    
    credencialesValidas.forEach((cred, index) => {
      console.log(`\n${index + 1}. ${cred.name} (${cred.role})`);
      console.log(`   📧 Email: ${cred.email}`);
      console.log(`   🔑 Password: ${cred.password}`);
    });
    
    // 5️⃣ Crear estudiantes de prueba con credenciales conocidas
    await crearEstudiantesDePrueba(db);
    
    // 6️⃣ Generar archivo de credenciales para el equipo de testing
    await generarArchivoCredenciales(credencialesValidas);
    
    console.log('\n🎉 ¡VERIFICACIÓN DE CREDENCIALES COMPLETADA!');
    console.log('===========================================');
    
  } catch (error) {
    console.error('❌ Error durante verificación:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('🔒 Conexión cerrada');
    }
  }
}

// 👨‍🎓 Crear estudiantes de prueba con credenciales conocidas
async function crearEstudiantesDePrueba(db) {
  console.log('\n👨‍🎓 Creando estudiantes de prueba...');
  
  const estudiantesPrueba = [
    {
      email: 'estudiante.nee@alumnos.ucn.cl',
      password: await bcrypt.hash('test123', 10),
      role: 'estudiante',
      nombre: 'María José',
      apellidos: 'González Pérez',
      rut: '12.345.678-9',
      esEstudiantePrueba: true,
      tieneNEE: true
    },
    {
      email: 'estudiante.regular@alumnos.ucn.cl', 
      password: await bcrypt.hash('test123', 10),
      role: 'estudiante',
      nombre: 'Carlos Eduardo',
      apellidos: 'Martínez Silva',
      rut: '98.765.432-1',
      esEstudiantePrueba: true,
      tieneNEE: false
    }
  ];
  
  try {
    // Verificar si ya existen
    for (const estudiante of estudiantesPrueba) {
      const existe = await db.collection('users').findOne({ email: estudiante.email });
      if (!existe) {
        estudiante.createdAt = new Date();
        estudiante.updatedAt = new Date();
        await db.collection('users').insertOne(estudiante);
        console.log(`   ✅ Estudiante de prueba creado: ${estudiante.email}`);
      } else {
        console.log(`   ℹ️ Estudiante ya existe: ${estudiante.email}`);
      }
    }
  } catch (error) {
    console.error(`   ❌ Error creando estudiantes de prueba: ${error.message}`);
  }
}

// 📄 Generar archivo de credenciales para el equipo
async function generarArchivoCredenciales(credenciales) {
  const fs = require('fs');
  const path = require('path');
  
  const contenido = `# CREDENCIALES PARA TESTING - UCN INCLUI2
# ==========================================
# 
# Archivo generado automáticamente para testing exhaustivo
# Fecha: ${new Date().toISOString()}
# 
# IMPORTANTE: Este archivo contiene credenciales de testing únicamente
# NO usar en producción

## USUARIOS DEL SISTEMA

${credenciales.map((cred, index) => `
### ${index + 1}. ${cred.name} (${cred.role})
- **Email:** \`${cred.email}\`
- **Password:** \`${cred.password}\`
- **Rol:** ${cred.role}
`).join('')}

## ESTUDIANTES DE PRUEBA ADICIONALES

### Estudiante con NEE
- **Email:** \`estudiante.nee@alumnos.ucn.cl\`
- **Password:** \`test123\`
- **Características:** Estudiante con necesidades educativas especiales

### Estudiante Regular
- **Email:** \`estudiante.regular@alumnos.ucn.cl\`
- **Password:** \`test123\`
- **Características:** Estudiante sin NEE

## CASOS DE PRUEBA RECOMENDADOS

1. **Testing de Autenticación:**
   - Login con cada rol
   - Verificar permisos específicos
   - Probar endpoints protegidos

2. **Testing de Funcionalidades NEE:**
   - Crear ajustes académicos
   - Subir documentos
   - Generar reportes

3. **Testing de Roles:**
   - Coordinador: Acceso completo
   - Educadora Social: Gestión NEE
   - DIDDEC Staff: Reportes y estadísticas
   - Estudiantes: Vista limitada

## ENDPOINTS DE PRUEBA

- **Health Check:** GET /health
- **Login:** POST /auth/login
- **Swagger UI:** GET /api
- **Estudiantes:** GET /students
- **Ajustes:** GET /adjustments

---
Generado por: Sistema de Testing UCN INCLUI2
`;

  const rutaArchivo = path.join(__dirname, '..', 'docs', '03-testing', 'CREDENCIALES_TESTING.md');
  
  try {
    fs.writeFileSync(rutaArchivo, contenido, 'utf8');
    console.log(`\n📄 Archivo de credenciales creado: ${rutaArchivo}`);
  } catch (error) {
    console.error(`   ❌ Error creando archivo: ${error.message}`);
  }
}

// 🚀 EJECUTAR SCRIPT
if (require.main === module) {
  verificarCredenciales()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { verificarCredenciales }; 