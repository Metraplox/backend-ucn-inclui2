const axios = require('axios');

// Configuración base
const BASE_URL = 'http://localhost:3000';
const MONGODB_URI = 'mongodb://localhost:27017';
const DATABASE_NAME = 'ucn_inclui2_test';

// Credenciales de testing (según memoria)
const CREDENTIALS = {
  coordinador: { email: 'coordinadora.inclusion@ucn.cl', password: 'inclui2025' },
  educadora: { email: 'educadora.social@ucn.cl', password: 'inclui2025' },
  diddec: { email: 'director.diddec@ucn.cl', password: 'inclui2025' },
  docente: { email: 'profesor.mat101@ucn.cl', password: 'inclui2025' },
  estudiante: { email: 'estudiante.nee@alumnos.ucn.cl', password: 'test123' },
  estudiante_regular: { email: 'estudiante.regular@alumnos.ucn.cl', password: 'test123' }
};

// Tokens almacenados
let tokens = {};

class RealEndpointsTester {
  constructor() {
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      suites: {}
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green  
      error: '\x1b[31m',   // Red
      warning: '\x1b[33m', // Yellow
      reset: '\x1b[0m'     // Reset
    };
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async test(description, testFunction, suiteName = 'General') {
    this.testResults.total++;
    
    if (!this.testResults.suites[suiteName]) {
      this.testResults.suites[suiteName] = { total: 0, passed: 0, failed: 0, tests: [] };
    }
    this.testResults.suites[suiteName].total++;

    try {
      await testFunction();
      this.testResults.passed++;
      this.testResults.suites[suiteName].passed++;
      this.testResults.suites[suiteName].tests.push({ description, status: 'PASS' });
      this.log(`✅ ${description}`, 'success');
      return true;
    } catch (error) {
      this.testResults.failed++;
      this.testResults.suites[suiteName].failed++;
      this.testResults.suites[suiteName].tests.push({ 
        description, 
        status: 'FAIL', 
        error: error.message 
      });
      this.log(`❌ ${description}: ${error.message}`, 'error');
      return false;
    }
  }

  async login(role, credentials) {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    if (response.status !== 200) {
      throw new Error(`Login failed for ${role} - Status: ${response.status}`);
    }
    
    // Manejar double wrapping de datos por interceptor
    const authData = response.data.data?.data || response.data.data || response.data;
    
    if (!authData.access_token) {
      throw new Error(`No access token received for ${role}`);
    }
    
    tokens[role] = authData.access_token;
    return authData.access_token;
  }

  getAuthHeaders(role) {
    return { Authorization: `Bearer ${tokens[role]}` };
  }

  async runAllTests() {
    this.log('🚀 INICIANDO TESTING DE ENDPOINTS REALES UCN INCLUI2', 'info');
    this.log('=====================================================', 'info');

    // SUITE 1: Verificación de Servicios Base
    this.log('\n📊 SUITE 1: VERIFICACIÓN DE SERVICIOS BASE', 'info');
    this.log('============================================', 'info');

    await this.test('Health Check - Servidor NestJS activo', async () => {
      const response = await axios.get(`${BASE_URL}/`);
      if (response.status !== 200) throw new Error('Servidor no responde');
    }, 'Servicios Base');

    await this.test('MongoDB - Base de datos accesible', async () => {
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db(DATABASE_NAME);
      const collections = await db.listCollections().toArray();
      await client.close();
      if (collections.length === 0) throw new Error('Base de datos vacía');
    }, 'Servicios Base');

    // SUITE 2: Autenticación Completa
    this.log('\n🔐 SUITE 2: AUTENTICACIÓN Y AUTORIZACIÓN', 'info');
    this.log('========================================', 'info');

    for (const [role, creds] of Object.entries(CREDENTIALS)) {
      await this.test(`Login ${role} - ${creds.email}`, async () => {
        await this.login(role, creds);
      }, 'Autenticación');
    }

    // SUITE 3: Validación de Perfil de Usuario  
    this.log('\n👤 SUITE 3: VALIDACIÓN JWT Y PERFIL', 'info');
    this.log('==================================', 'info');

    await this.test('GET /users/profile - Perfil coordinador', async () => {
      const response = await axios.get(`${BASE_URL}/users/profile`, {
        headers: this.getAuthHeaders('coordinador')
      });
      const profileData = response.data.data?.data || response.data.data || response.data;
      if (response.status !== 200 || !profileData.email) {
        throw new Error('Perfil no retorna datos válidos');
      }
    }, 'Validación JWT');

    await this.test('GET /users/profile - Perfil estudiante', async () => {
      const response = await axios.get(`${BASE_URL}/users/profile`, {
        headers: this.getAuthHeaders('estudiante')
      });
      const profileData = response.data.data?.data || response.data.data || response.data;
      if (response.status !== 200 || !profileData.email) {
        throw new Error('Perfil estudiante no funciona');
      }
    }, 'Validación JWT');

    // SUITE 4: Endpoints Básicos con Autenticación
    this.log('\n🌐 SUITE 4: ENDPOINTS BÁSICOS AUTENTICADOS', 'info');
    this.log('==========================================', 'info');

    await this.test('POST /auth/roles - Información de roles del sistema', async () => {
      const response = await axios.post(`${BASE_URL}/auth/roles`);
      const roleData = response.data.data?.data || response.data.data || response.data;
      if (response.status !== 200 || !roleData.roles) {
        throw new Error('Endpoint de roles no funciona');
      }
    }, 'Endpoints Básicos');

    await this.test('GET /careers - Lista de carreras', async () => {
      const response = await axios.get(`${BASE_URL}/careers`, {
        headers: this.getAuthHeaders('estudiante')
      });
      if (response.status !== 200) throw new Error('Carreras no accesibles');
    }, 'Endpoints Básicos');

    await this.test('GET /departments - Lista de departamentos', async () => {
      const response = await axios.get(`${BASE_URL}/departments`, {
        headers: this.getAuthHeaders('estudiante')
      });
      if (response.status !== 200) throw new Error('Departamentos no accesibles');
    }, 'Endpoints Básicos');

    await this.test('GET /categories - Categorías de ajustes', async () => {
      const response = await axios.get(`${BASE_URL}/categories`, {
        headers: this.getAuthHeaders('estudiante')
      });
      if (response.status !== 200) throw new Error('Categorías no accesibles');
    }, 'Endpoints Básicos');

    await this.test('GET /notifications - Sistema de notificaciones', async () => {
      const response = await axios.get(`${BASE_URL}/notifications`, {
        headers: this.getAuthHeaders('coordinador')
      });
      if (response.status !== 200) throw new Error('Notificaciones no funcionan');
    }, 'Endpoints Básicos');

    // SUITE 5: Control de Acceso por Roles
    this.log('\n🔒 SUITE 5: CONTROL DE ACCESO POR ROLES', 'info');
    this.log('======================================', 'info');

    await this.test('GET /users - Acceso coordinador (permitido)', async () => {
      const response = await axios.get(`${BASE_URL}/users`, {
        headers: this.getAuthHeaders('coordinador')
      });
      if (response.status !== 200) throw new Error('Coordinador debería tener acceso');
    }, 'Control de Acceso');

    await this.test('GET /users - Acceso educadora (permitido)', async () => {
      const response = await axios.get(`${BASE_URL}/users`, {
        headers: this.getAuthHeaders('educadora')
      });
      if (response.status !== 200) throw new Error('Educadora debería tener acceso');
    }, 'Control de Acceso');

    await this.test('GET /users - Acceso estudiante (prohibido)', async () => {
      try {
        await axios.get(`${BASE_URL}/users`, {
          headers: this.getAuthHeaders('estudiante')
        });
        throw new Error('Estudiante NO debería tener acceso');
      } catch (error) {
        if (error.response?.status !== 403) {
          throw new Error(`Esperaba 403, obtuvo ${error.response?.status}`);
        }
      }
    }, 'Control de Acceso');

    await this.test('GET /students - Acceso coordinador', async () => {
      const response = await axios.get(`${BASE_URL}/students`, {
        headers: this.getAuthHeaders('coordinador')
      });
      if (response.status !== 200) throw new Error('Coordinador debería ver estudiantes');
    }, 'Control de Acceso');

    await this.test('GET /adjustments - Acceso docente', async () => {
      const response = await axios.get(`${BASE_URL}/adjustments`, {
        headers: this.getAuthHeaders('docente')
      });
      if (response.status !== 200) throw new Error('Docente debería ver ajustes');
    }, 'Control de Acceso');

    // SUITE 6: Endpoints Académicos
    this.log('\n📚 SUITE 6: FUNCIONALIDAD ACADÉMICA', 'info');
    this.log('==================================', 'info');

    await this.test('GET /courses - Lista de cursos', async () => {
      const response = await axios.get(`${BASE_URL}/courses`, {
        headers: this.getAuthHeaders('docente')
      });
      if (response.status !== 200) throw new Error('Cursos no accesibles');
    }, 'Académico');

    await this.test('GET /academic-history - Historial académico', async () => {
      const response = await axios.get(`${BASE_URL}/academic-history`, {
        headers: this.getAuthHeaders('coordinador')
      });
      if (response.status !== 200) throw new Error('Historial académico falla');
    }, 'Académico');

    await this.test('GET /staff-adjustments - Ajustes de staff', async () => {
      const response = await axios.get(`${BASE_URL}/staff-adjustments`, {
        headers: this.getAuthHeaders('coordinador')
      });
      if (response.status !== 200) throw new Error('Ajustes de staff fallan');
    }, 'Académico');

    // SUITE 7: Consentimientos y Documentos
    this.log('\n📋 SUITE 7: CONSENTIMIENTOS Y DOCUMENTOS', 'info');
    this.log('======================================', 'info');

    await this.test('GET /consents/all - Todos los consentimientos', async () => {
      const response = await axios.get(`${BASE_URL}/consents/all`, {
        headers: this.getAuthHeaders('coordinador')
      });
      if (response.status !== 200) throw new Error('Consentimientos generales fallan');
    }, 'Consentimientos');

    await this.test('GET /consents/student/my-consents - Mis consentimientos', async () => {
      const response = await axios.get(`${BASE_URL}/consents/student/my-consents`, {
        headers: this.getAuthHeaders('estudiante')
      });
      if (response.status !== 200) throw new Error('Consentimientos estudiante fallan');
    }, 'Consentimientos');

    await this.test('GET /documents - Lista de documentos', async () => {
      const response = await axios.get(`${BASE_URL}/documents`, {
        headers: this.getAuthHeaders('coordinador')
      });
      if (response.status !== 200) throw new Error('Documentos no accesibles');
    }, 'Consentimientos');

    await this.test('GET /resources - Recursos educativos', async () => {
      const response = await axios.get(`${BASE_URL}/resources`, {
        headers: this.getAuthHeaders('coordinador')
      });
      if (response.status !== 200) throw new Error('Recursos no accesibles');
    }, 'Consentimientos');

    // SUITE 8: DIDDEC y Reportes
    this.log('\n📊 SUITE 8: DIDDEC Y REPORTES', 'info');
    this.log('============================', 'info');

    await this.test('GET /diddec/statistics?semester=2025-1 - Estadísticas', async () => {
      const response = await axios.get(`${BASE_URL}/diddec/statistics?semester=2025-1`, {
        headers: this.getAuthHeaders('diddec')
      });
      if (response.status !== 200) throw new Error('Estadísticas DIDDEC fallan');
    }, 'DIDDEC');

    await this.test('GET /diddec/reports - Reportes DIDDEC', async () => {
      const response = await axios.get(`${BASE_URL}/diddec/reports`, {
        headers: this.getAuthHeaders('diddec')
      });
      if (response.status !== 200) throw new Error('Reportes DIDDEC fallan');
    }, 'DIDDEC');

    await this.test('GET /diddec/resources - Recursos DIDDEC', async () => {
      const response = await axios.get(`${BASE_URL}/diddec/resources`, {
        headers: this.getAuthHeaders('diddec')
      });
      if (response.status !== 200) throw new Error('Recursos DIDDEC fallan');
    }, 'DIDDEC');

    // SUITE 9: Administración y Sincronización
    this.log('\n🔄 SUITE 9: ADMINISTRACIÓN Y SINCRONIZACIÓN', 'info');
    this.log('==========================================', 'info');

    await this.test('GET /sync - Estado de sincronización', async () => {
      const response = await axios.get(`${BASE_URL}/sync`, {
        headers: this.getAuthHeaders('coordinador')
      });
      if (response.status !== 200) throw new Error('Sincronización no accesible');
    }, 'Administración');

    await this.test('GET /admin/hawaii-cache - Cache Hawaii UCN', async () => {
      const response = await axios.get(`${BASE_URL}/admin/hawaii-cache`, {
        headers: this.getAuthHeaders('coordinador')
      });
      if (response.status !== 200) throw new Error('Cache Hawaii no accesible');
    }, 'Administración');

    await this.test('GET /semester-sync - Sincronización semestral', async () => {
      const response = await axios.get(`${BASE_URL}/semester-sync`, {
        headers: this.getAuthHeaders('coordinador')
      });
      if (response.status !== 200) throw new Error('Sync semestral no accesible');
    }, 'Administración');

    // Generar reporte final
    this.generateFinalReport();
  }

  generateFinalReport() {
    const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
    
    this.log('\n🎯 RESUMEN FINAL DEL TESTING', 'info');
    this.log('============================', 'info');
    this.log(`📊 Total de tests: ${this.testResults.total}`, 'info');
    this.log(`✅ Tests exitosos: ${this.testResults.passed}`, 'success');
    this.log(`❌ Tests fallidos: ${this.testResults.failed}`, 'error');
    this.log(`📈 Tasa de éxito: ${successRate}%`, successRate >= 80 ? 'success' : 'warning');

    this.log('\n📋 RESUMEN POR SUITE:', 'info');
    this.log('====================', 'info');
    
    for (const [suiteName, suite] of Object.entries(this.testResults.suites)) {
      const suiteRate = ((suite.passed / suite.total) * 100).toFixed(1);
      this.log(`${suiteName}: ${suite.passed}/${suite.total} (${suiteRate}%)`, 
        suiteRate >= 80 ? 'success' : 'warning');
    }

    // Estado final
    if (successRate >= 90) {
      this.log('\n🎉 ESTADO: EXCELENTE - Sistema listo para producción', 'success');
    } else if (successRate >= 75) {
      this.log('\n✅ ESTADO: BUENO - Requiere correcciones menores', 'warning');
    } else if (successRate >= 50) {
      this.log('\n⚠️ ESTADO: REGULAR - Requiere correcciones importantes', 'warning');
    } else {
      this.log('\n🚨 ESTADO: CRÍTICO - Requiere revisión completa', 'error');
    }
  }
}

// Ejecutar testing
async function main() {
  const tester = new RealEndpointsTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Error crítico durante el testing:', error.message);
    process.exit(1);
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = RealEndpointsTester; 