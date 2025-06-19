const axios = require('axios');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const BASE_URL = 'http://localhost:3000';
const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'ucn_inclui2_test';

// Colores para consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(level, message) {
  const timestamp = new Date().toISOString();
  const levelColors = {
    INFO: colors.blue,
    SUCCESS: colors.green,
    ERROR: colors.red,
    WARNING: colors.yellow
  };
  console.log(`${levelColors[level]}[${level}]${colors.reset} ${timestamp} - ${message}`);
}

async function connectToMongo() {
  try {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    log('SUCCESS', 'Conectado a MongoDB');
    return client.db(DB_NAME);
  } catch (error) {
    log('ERROR', `Error conectando a MongoDB: ${error.message}`);
    throw error;
  }
}

async function debugUser(email) {
  log('INFO', `🔍 DEBUGGEANDO USUARIO: ${email}`);
  
  const db = await connectToMongo();
  const user = await db.collection('users').findOne({ email });
  
  if (!user) {
    log('ERROR', '❌ Usuario no encontrado en base de datos');
    return false;
  }
  
  log('SUCCESS', '✅ Usuario encontrado en BD');
  log('INFO', `  - ID: ${user._id}`);
  log('INFO', `  - Nombre: ${user.nombreCompleto}`);
  log('INFO', `  - Roles: ${JSON.stringify(user.roles)}`);
  log('INFO', `  - Activo: ${user.isActive}`);
  log('INFO', `  - Tiene password_hash: ${!!user.password_hash}`);
  log('INFO', `  - Hash length: ${user.password_hash ? user.password_hash.length : 0}`);
  
  return user;
}

async function testPasswordHash(password, hash) {
  log('INFO', '🔐 Testando hash de contraseña...');
  
  try {
    const isValid = await bcrypt.compare(password, hash);
    if (isValid) {
      log('SUCCESS', '✅ Contraseña válida según bcrypt');
    } else {
      log('ERROR', '❌ Contraseña inválida según bcrypt');
    }
    return isValid;
  } catch (error) {
    log('ERROR', `❌ Error en bcrypt.compare: ${error.message}`);
    return false;
  }
}

async function testServerHealth() {
  log('INFO', '🏥 Verificando salud del servidor...');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    log('SUCCESS', '✅ Servidor respondiendo');
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('ERROR', '❌ Servidor no está corriendo');
    } else {
      log('WARNING', `⚠️ Endpoint /health no disponible: ${error.response?.status || error.message}`);
    }
    return false;
  }
}

async function testLoginEndpoint(email, password) {
  log('INFO', `🚪 Testando login para: ${email}`);
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password
    }, {
      timeout: 10000,
      validateStatus: () => true // Acepta cualquier status
    });
    
    log('INFO', `Status: ${response.status}`);
    
    if (response.status === 200 || response.status === 201) {
      // Manejar estructura anidada: response.data.data.data.access_token
      let token = null;
      if (response.data?.data?.data?.access_token) {
        token = response.data.data.data.access_token;
      } else if (response.data?.data?.access_token) {
        token = response.data.data.access_token;
      } else if (response.data?.access_token) {
        token = response.data.access_token;
      }
      
      if (token) {
        log('SUCCESS', '✅ Login exitoso - Token extraído correctamente');
        return token;
      } else {
        log('ERROR', '❌ Login devolvió 200 pero token no encontrado en estructura');
        log('ERROR', `Estructura recibida: ${JSON.stringify(response.data, null, 2)}`);
        return null;
      }
    } else {
      log('ERROR', `❌ Login falló: ${response.status} - ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    log('ERROR', `❌ Error en login: ${error.message}`);
    if (error.response) {
      log('ERROR', `Response data: ${JSON.stringify(error.response.data)}`);
    }
    return null;
  }
}

async function testEndpointWithAuth(endpoint, token) {
  log('INFO', `🔑 Testando endpoint con auth: ${endpoint}`);
  
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      validateStatus: () => true
    });
    
    log('INFO', `Status: ${response.status}`);
    
    if (response.status === 200) {
      log('SUCCESS', `✅ Endpoint ${endpoint} accesible`);
      return true;
    } else {
      log('ERROR', `❌ Endpoint ${endpoint} falló: ${response.status}`);
      log('ERROR', `Error: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    log('ERROR', `❌ Error en ${endpoint}: ${error.message}`);
    return false;
  }
}

async function runCompleteDebug() {
  log('INFO', `${colors.bold}🔍 INICIANDO DEBUG COMPLETO DE AUTENTICACIÓN${colors.reset}`);
  
  const testCredentials = [
    { email: 'coordinadora@ucn.cl', password: 'Test123!' },
    { email: 'educadora@ucn.cl', password: 'Test123!' },
    { email: 'diddec@ucn.cl', password: 'Test123!' }
  ];
  
  // 1. Verificar servidor
  const serverOk = await testServerHealth();
  if (!serverOk) {
    log('ERROR', '🛑 Servidor no disponible. Terminando debug.');
    return;
  }
  
  // 2. Para cada usuario de prueba
  for (const cred of testCredentials) {
    log('INFO', `\n${colors.bold}=== DEBUGGEANDO: ${cred.email} ===${colors.reset}`);
    
    // 2.1 Verificar usuario en BD
    const user = await debugUser(cred.email);
    if (!user) continue;
    
    // 2.2 Verificar hash de contraseña
    if (user.password_hash) {
      await testPasswordHash(cred.password, user.password_hash);
    }
    
    // 2.3 Probar login
    const token = await testLoginEndpoint(cred.email, cred.password);
    
    // 2.4 Si hay token, probar endpoints
    if (token) {
      const endpoints = ['/users/profile', '/departments', '/categories'];
      for (const endpoint of endpoints) {
        await testEndpointWithAuth(endpoint, token);
      }
    }
    
    log('INFO', `\n${colors.yellow}--- Fin debug para ${cred.email} ---${colors.reset}`);
  }
  
  log('INFO', `\n${colors.bold}🏁 DEBUG COMPLETO FINALIZADO${colors.reset}`);
}

// Ejecutar
if (require.main === module) {
  runCompleteDebug().catch(console.error);
}

module.exports = { runCompleteDebug, debugUser, testLoginEndpoint }; 