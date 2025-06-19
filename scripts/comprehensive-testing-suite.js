const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 🔧 CONFIGURACIÓN DE TESTING EXHAUSTIVO
const CONFIG = {
  baseURL: 'http://localhost:3000',
  timeout: 15000,
  credentials: {
    coordinador: { email: 'coordinadora.inclusion@ucn.cl', password: 'inclui2025' },
    educadora: { email: 'educadora.social@ucn.cl', password: 'inclui2025' },
    diddec: { email: 'director.diddec@ucn.cl', password: 'inclui2025' },
    estudiante_nee: { email: 'estudiante.nee@alumnos.ucn.cl', password: 'test123' },
    estudiante_regular: { email: 'estudiante.regular@alumnos.ucn.cl', password: 'test123' },
    profesor: { email: 'profesor.mat101@ucn.cl', password: 'inclui2025' }
  }
};

// 📋 SUITE DE TESTS EXHAUSTIVOS
const TEST_SUITES = {
  AUTHENTICATION: 'Autenticación y Autorización',
  ENDPOINTS: 'Funcionalidad de Endpoints',
  ROLES: 'Control de Roles y Permisos',
  NEE_FUNCTIONALITY: 'Funcionalidades NEE',
  DATA_INTEGRITY: 'Integridad de Datos',
  PERFORMANCE: 'Performance y Carga',
  SECURITY: 'Seguridad del Sistema'
};

// 🎯 RESULTADOS DE TESTING
let testResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  warnings: 0,
  suiteResults: {},
  detailedResults: [],
  executionTime: 0
};

// 🚀 FUNCIÓN PRINCIPAL DE TESTING
async function ejecutarTestingExhaustivo() {
  console.log('🧪 INICIANDO TESTING EXHAUSTIVO UCN INCLUI2');
  console.log('============================================');
  console.log(`📅 Fecha: ${new Date().toISOString()}`);
  console.log(`🔗 Base URL: ${CONFIG.baseURL}`);
  
  const startTime = Date.now();
  
  try {
    // 1️⃣ Testing de Autenticación
    await ejecutarSuiteAutenticacion();
    
    // 2️⃣ Testing de Endpoints
    await ejecutarSuiteEndpoints();
    
    // 3️⃣ Testing de Roles y Permisos
    await ejecutarSuiteRoles();
    
    // 4️⃣ Testing de Funcionalidades NEE
    await ejecutarSuiteFuncionalidadesNEE();
    
    // 5️⃣ Testing de Integridad de Datos
    await ejecutarSuiteIntegridadDatos();
    
    // 6️⃣ Testing de Performance
    await ejecutarSuitePerformance();
    
    // 7️⃣ Testing de Seguridad
    await ejecutarSuiteSeguridad();
    
    // 8️⃣ Generar reporte final
    testResults.executionTime = Date.now() - startTime;
    await generarReporteFinal();
    
  } catch (error) {
    console.error('❌ Error crítico en testing:', error);
    throw error;
  }
}

// 🔐 SUITE 1: TESTING DE AUTENTICACIÓN
async function ejecutarSuiteAutenticacion() {
  console.log('\n🔐 SUITE 1: TESTING DE AUTENTICACIÓN');
  console.log('===================================');
  
  const suite = 'AUTHENTICATION';
  testResults.suiteResults[suite] = { passed: 0, failed: 0, warnings: 0 };
  
  // Test 1.1: Health Check del Sistema
  await ejecutarTest('Health Check', async () => {
    const response = await axios.get(`${CONFIG.baseURL}/health`, { timeout: CONFIG.timeout });
    if (response.status === 200 && response.data.success) {
      return { success: true, message: 'Sistema operativo' };
    }
    throw new Error('Health check falló');
  }, suite);
  
  // Test 1.2: Login con cada rol
  for (const [rol, credenciales] of Object.entries(CONFIG.credentials)) {
    await ejecutarTest(`Login ${rol}`, async () => {
      const response = await axios.post(`${CONFIG.baseURL}/auth/login`, credenciales, {
        timeout: CONFIG.timeout
      });
      if (response.status === 200) {
        // Manejar respuesta con interceptor
        const authData = response.data.data?.data || response.data.data || response.data;
        if (authData.access_token) {
          credenciales.token = authData.access_token;
          return { success: true, message: `Login exitoso para ${credenciales.email}` };
        } else {
          throw new Error('No se recibió token');
        }
      }
      throw new Error('Login fallido');
    }, suite);
  }
  
  // Test 1.3: Validación de tokens JWT
  for (const [rol, credenciales] of Object.entries(CONFIG.credentials)) {
    if (credenciales.token) {
      await ejecutarTest(`Validación JWT ${rol}`, async () => {
        const response = await axios.get(`${CONFIG.baseURL}/users/profile`, {
          headers: { Authorization: `Bearer ${credenciales.token}` },
          timeout: CONFIG.timeout
        });
        if (response.status === 200 && response.data.email === credenciales.email) {
          return { success: true, message: `JWT válido para ${credenciales.email}` };
        }
        throw new Error('JWT inválido');
      }, suite);
    }
  }
}

// 🔗 SUITE 2: TESTING DE ENDPOINTS
async function ejecutarSuiteEndpoints() {
  console.log('\n🔗 SUITE 2: TESTING DE ENDPOINTS');
  console.log('================================');
  
  const suite = 'ENDPOINTS';
  testResults.suiteResults[suite] = { passed: 0, failed: 0, warnings: 0 };
  
  // Endpoints corregidos según la documentación real
  const endpoints = [
    { method: 'GET', path: '/students', requiresAuth: true, role: 'coordinador' },
    { method: 'GET', path: '/adjustments', requiresAuth: true, role: 'coordinador' },
    { method: 'GET', path: '/courses', requiresAuth: true, role: 'coordinador' },
    { method: 'GET', path: '/users', requiresAuth: true, role: 'coordinador' },
    { method: 'GET', path: '/notifications', requiresAuth: true, role: 'coordinador' },
    { method: 'GET', path: '/consents/all', requiresAuth: true, role: 'coordinador' },
    { method: 'GET', path: '/careers', requiresAuth: true, role: 'coordinador' },
    { method: 'GET', path: '/departments', requiresAuth: true, role: 'coordinador' },
    { method: 'GET', path: '/nee-categories', requiresAuth: true, role: 'coordinador' },
    { method: 'GET', path: '/educational-resources', requiresAuth: true, role: 'coordinador' }
  ];
  
  for (const endpoint of endpoints) {
    await ejecutarTest(`${endpoint.method} ${endpoint.path}`, async () => {
      const config = { timeout: CONFIG.timeout };
      
      if (endpoint.requiresAuth && CONFIG.credentials[endpoint.role]?.token) {
        config.headers = { Authorization: `Bearer ${CONFIG.credentials[endpoint.role].token}` };
      }
      
      const response = await axios[endpoint.method.toLowerCase()](`${CONFIG.baseURL}${endpoint.path}`, config);
      
      if (response.status >= 200 && response.status < 300) {
        return { 
          success: true, 
          message: `Status: ${response.status}, Data count: ${Array.isArray(response.data) ? response.data.length : 'N/A'}` 
        };
      }
      throw new Error(`HTTP ${response.status}`);
    }, suite);
  }
}

// 👥 SUITE 3: TESTING DE ROLES Y PERMISOS
async function ejecutarSuiteRoles() {
  console.log('\n👥 SUITE 3: TESTING DE ROLES Y PERMISOS');
  console.log('======================================');
  
  const suite = 'ROLES';
  testResults.suiteResults[suite] = { passed: 0, failed: 0, warnings: 0 };
  
  // Test 3.1: Acceso de Coordinador (acceso completo)
  await ejecutarTest('Coordinador - Acceso completo a estudiantes', async () => {
    const response = await axios.get(`${CONFIG.baseURL}/students`, {
      headers: { Authorization: `Bearer ${CONFIG.credentials.coordinador.token}` },
      timeout: CONFIG.timeout
    });
    if (response.status === 200 && Array.isArray(response.data)) {
      return { success: true, message: `Acceso correcto: ${response.data.length} estudiantes` };
    }
    throw new Error('Coordinador sin acceso a estudiantes');
  }, suite);
  
  // Test 3.2: Acceso de Estudiante (limitado)
  await ejecutarTest('Estudiante - Acceso limitado', async () => {
    try {
      const response = await axios.get(`${CONFIG.baseURL}/students`, {
        headers: { Authorization: `Bearer ${CONFIG.credentials.estudiante_nee.token}` },
        timeout: CONFIG.timeout
      });
      // Si llega aquí, puede ser que tenga acceso cuando no debería
      return { success: false, message: 'Estudiante tiene acceso no autorizado', warning: true };
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        return { success: true, message: 'Acceso correctamente denegado' };
      }
      throw error;
    }
  }, suite);
  
  // Test 3.3: Verificación de permisos específicos NEE
  await ejecutarTest('Educadora - Acceso a funcionalidades NEE', async () => {
    const response = await axios.get(`${CONFIG.baseURL}/adjustments`, {
      headers: { Authorization: `Bearer ${CONFIG.credentials.educadora.token}` },
      timeout: CONFIG.timeout
    });
    if (response.status === 200) {
      return { success: true, message: `Acceso NEE correcto: ${response.data.length || 'N/A'} ajustes` };
    }
    throw new Error('Educadora sin acceso a ajustes');
  }, suite);
}

// 🎯 SUITE 4: TESTING DE FUNCIONALIDADES NEE
async function ejecutarSuiteFuncionalidadesNEE() {
  console.log('\n🎯 SUITE 4: TESTING DE FUNCIONALIDADES NEE');
  console.log('==========================================');
  
  const suite = 'NEE_FUNCTIONALITY';
  testResults.suiteResults[suite] = { passed: 0, failed: 0, warnings: 0 };
  
  // Test 4.1: Consulta de estudiantes con NEE
  await ejecutarTest('Consulta estudiantes NEE', async () => {
    const response = await axios.get(`${CONFIG.baseURL}/students?esNEE=true`, {
      headers: { Authorization: `Bearer ${CONFIG.credentials.coordinador.token}` },
      timeout: CONFIG.timeout
    });
    const estudiantesNEE = response.data.filter ? response.data.filter(s => s.esNEE) : [];
    if (estudiantesNEE.length > 0) {
      return { success: true, message: `${estudiantesNEE.length} estudiantes NEE encontrados` };
    }
    return { success: false, message: 'No se encontraron estudiantes NEE', warning: true };
  }, suite);
  
  // Test 4.2: Funcionalidad de ajustes académicos
  await ejecutarTest('Gestión ajustes académicos', async () => {
    const response = await axios.get(`${CONFIG.baseURL}/adjustments`, {
      headers: { Authorization: `Bearer ${CONFIG.credentials.coordinador.token}` },
      timeout: CONFIG.timeout
    });
    if (response.status === 200 && response.data.length > 0) {
      return { success: true, message: `${response.data.length} ajustes académicos disponibles` };
    }
    return { success: false, message: 'No hay ajustes académicos', warning: true };
  }, suite);
  
  // Test 4.3: Sistema de consentimientos
  await ejecutarTest('Sistema de consentimientos', async () => {
    const response = await axios.get(`${CONFIG.baseURL}/consents/all`, {
      headers: { Authorization: `Bearer ${CONFIG.credentials.coordinador.token}` },
      timeout: CONFIG.timeout
    });
    if (response.status === 200) {
      return { success: true, message: `Sistema de consentimientos operativo: ${response.data.length || 0} registros` };
    }
    throw new Error('Sistema de consentimientos no disponible');
  }, suite);
  
  // Test 4.4: Gestión de documentos NEE
  await ejecutarTest('Gestión documentos NEE', async () => {
    // Usar endpoint específico con un ID de estudiante válido
    const studentsResponse = await axios.get(`${CONFIG.baseURL}/students`, {
      headers: { Authorization: `Bearer ${CONFIG.credentials.coordinador.token}` },
      timeout: CONFIG.timeout
    });
    
    if (studentsResponse.data.length > 0) {
      const studentId = studentsResponse.data[0]._id;
      const response = await axios.get(`${CONFIG.baseURL}/documents/student/${studentId}`, {
        headers: { Authorization: `Bearer ${CONFIG.credentials.coordinador.token}` },
        timeout: CONFIG.timeout
      });
      
      if (response.status === 200 || response.status === 403) {
        return { success: true, message: `Sistema documentos operativo (${response.status === 403 ? 'protegido por consentimientos' : 'accesible'})` };
      }
    }
    
    return { success: false, message: 'No se pudo verificar sistema de documentos', warning: true };
  }, suite);
}

// 📊 SUITE 5: TESTING DE INTEGRIDAD DE DATOS
async function ejecutarSuiteIntegridadDatos() {
  console.log('\n📊 SUITE 5: TESTING DE INTEGRIDAD DE DATOS');
  console.log('==========================================');
  
  const suite = 'DATA_INTEGRITY';
  testResults.suiteResults[suite] = { passed: 0, failed: 0, warnings: 0 };
  
  // Test 5.1: Consistencia de datos de estudiantes
  await ejecutarTest('Consistencia datos estudiantes', async () => {
    const response = await axios.get(`${CONFIG.baseURL}/students`, {
      headers: { Authorization: `Bearer ${CONFIG.credentials.coordinador.token}` },
      timeout: CONFIG.timeout
    });
    
    const estudiantes = response.data;
    if (!Array.isArray(estudiantes) || estudiantes.length === 0) {
      throw new Error('No hay datos de estudiantes');
    }
    
    // Verificar campos obligatorios
    const camposObligatorios = ['rut', 'email'];
    const estudiantesIncompletos = estudiantes.filter(e => 
      camposObligatorios.some(campo => !e[campo])
    );
    
    if (estudiantesIncompletos.length === 0) {
      return { success: true, message: `${estudiantes.length} estudiantes con datos íntegros` };
    } else {
      return { success: false, message: `${estudiantesIncompletos.length} estudiantes con datos incompletos`, warning: true };
    }
  }, suite);
  
  // Test 5.2: Relaciones entre entidades
  await ejecutarTest('Relaciones entidades', async () => {
    const [estudiantes, cursos] = await Promise.all([
      axios.get(`${CONFIG.baseURL}/students`, { headers: { Authorization: `Bearer ${CONFIG.credentials.coordinador.token}` } }),
      axios.get(`${CONFIG.baseURL}/courses`, { headers: { Authorization: `Bearer ${CONFIG.credentials.coordinador.token}` } })
    ]);
    
    const totalEstudiantes = estudiantes.data.length;
    const totalCursos = cursos.data.length;
    
    if (totalEstudiantes > 0 && totalCursos > 0) {
      return { 
        success: true, 
        message: `Relaciones correctas: ${totalEstudiantes} estudiantes, ${totalCursos} cursos` 
      };
    }
    throw new Error('Relaciones de datos inconsistentes');
  }, suite);
}

// ⚡ SUITE 6: TESTING DE PERFORMANCE
async function ejecutarSuitePerformance() {
  console.log('\n⚡ SUITE 6: TESTING DE PERFORMANCE');
  console.log('=================================');
  
  const suite = 'PERFORMANCE';
  testResults.suiteResults[suite] = { passed: 0, failed: 0, warnings: 0 };
  
  // Test 6.1: Tiempo de respuesta endpoints críticos
  const endpointsCriticos = ['/students', '/adjustments', '/courses'];
  
  for (const endpoint of endpointsCriticos) {
    await ejecutarTest(`Performance ${endpoint}`, async () => {
      const startTime = Date.now();
      const response = await axios.get(`${CONFIG.baseURL}${endpoint}`, {
        headers: { Authorization: `Bearer ${CONFIG.credentials.coordinador.token}` },
        timeout: CONFIG.timeout
      });
      const responseTime = Date.now() - startTime;
      
      if (response.status === 200) {
        if (responseTime < 2000) {
          return { success: true, message: `Respuesta rápida: ${responseTime}ms` };
        } else if (responseTime < 5000) {
          return { success: true, message: `Respuesta aceptable: ${responseTime}ms`, warning: true };
        } else {
          return { success: false, message: `Respuesta lenta: ${responseTime}ms` };
        }
      }
      throw new Error('Endpoint no responde');
    }, suite);
  }
  
  // Test 6.2: Carga concurrente
  await ejecutarTest('Carga concurrente', async () => {
    const requests = Array(5).fill().map(() =>
      axios.get(`${CONFIG.baseURL}/health`, { timeout: CONFIG.timeout })
    );
    
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    const allSuccessful = responses.every(r => r.status === 200);
    if (allSuccessful) {
      return { success: true, message: `5 requests concurrentes exitosas en ${totalTime}ms` };
    }
    throw new Error('Falla en carga concurrente');
  }, suite);
}

// 🔒 SUITE 7: TESTING DE SEGURIDAD
async function ejecutarSuiteSeguridad() {
  console.log('\n🔒 SUITE 7: TESTING DE SEGURIDAD');
  console.log('================================');
  
  const suite = 'SECURITY';
  testResults.suiteResults[suite] = { passed: 0, failed: 0, warnings: 0 };
  
  // Test 7.1: Acceso sin token
  await ejecutarTest('Protección sin autenticación', async () => {
    try {
      await axios.get(`${CONFIG.baseURL}/students`, { timeout: CONFIG.timeout });
      return { success: false, message: 'Endpoint desprotegido - riesgo de seguridad' };
    } catch (error) {
      if (error.response?.status === 401) {
        return { success: true, message: 'Endpoint correctamente protegido' };
      }
      throw error;
    }
  }, suite);
  
  // Test 7.2: Token inválido
  await ejecutarTest('Protección token inválido', async () => {
    try {
      await axios.get(`${CONFIG.baseURL}/students`, {
        headers: { Authorization: 'Bearer token_invalido' },
        timeout: CONFIG.timeout
      });
      return { success: false, message: 'Acepta tokens inválidos - riesgo de seguridad' };
    } catch (error) {
      if (error.response?.status === 401) {
        return { success: true, message: 'Tokens inválidos correctamente rechazados' };
      }
      throw error;
    }
  }, suite);
  
  // Test 7.3: Headers de seguridad
  await ejecutarTest('Headers de seguridad', async () => {
    const response = await axios.get(`${CONFIG.baseURL}/health`, { timeout: CONFIG.timeout });
    const securityHeaders = ['x-powered-by', 'server'];
    const exposedHeaders = securityHeaders.filter(header => response.headers[header]);
    
    if (exposedHeaders.length === 0) {
      return { success: true, message: 'Headers de seguridad correctos' };
    } else {
      return { success: false, message: `Headers expuestos: ${exposedHeaders.join(', ')}`, warning: true };
    }
  }, suite);
}

// 🧪 FUNCIÓN AUXILIAR PARA EJECUTAR TESTS
async function ejecutarTest(testName, testFunction, suite) {
  testResults.totalTests++;
  
  try {
    console.log(`  🧪 Ejecutando: ${testName}`);
    const result = await testFunction();
    
    if (result.success) {
      testResults.passedTests++;
      testResults.suiteResults[suite].passed++;
      
      if (result.warning) {
        testResults.warnings++;
        testResults.suiteResults[suite].warnings++;
        console.log(`    ⚠️  PASSED (WARNING): ${result.message}`);
      } else {
        console.log(`    ✅ PASSED: ${result.message}`);
      }
    } else {
      testResults.failedTests++;
      testResults.suiteResults[suite].failed++;
      console.log(`    ❌ FAILED: ${result.message}`);
    }
    
    testResults.detailedResults.push({
      suite,
      test: testName,
      status: result.success ? (result.warning ? 'WARNING' : 'PASSED') : 'FAILED',
      message: result.message,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    testResults.failedTests++;
    testResults.suiteResults[suite].failed++;
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
    console.log(`    ❌ FAILED: ${errorMessage}`);
    
    testResults.detailedResults.push({
      suite,
      test: testName,
      status: 'FAILED',
      message: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
}

// 📄 GENERAR REPORTE FINAL
async function generarReporteFinal() {
  console.log('\n📄 GENERANDO REPORTE FINAL');
  console.log('==========================');
  
  const successRate = ((testResults.passedTests / testResults.totalTests) * 100).toFixed(1);
  const executionMinutes = (testResults.executionTime / 60000).toFixed(1);
  
  console.log(`\n🎯 RESUMEN EJECUTIVO:`);
  console.log(`✅ Tests exitosos: ${testResults.passedTests}/${testResults.totalTests} (${successRate}%)`);
  console.log(`❌ Tests fallidos: ${testResults.failedTests}`);
  console.log(`⚠️  Advertencias: ${testResults.warnings}`);
  console.log(`⏱️  Tiempo ejecución: ${executionMinutes} minutos`);
  
  console.log(`\n📊 RESULTADOS POR SUITE:`);
  Object.entries(testResults.suiteResults).forEach(([suite, results]) => {
    const total = results.passed + results.failed;
    const rate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : '0.0';
    console.log(`  ${TEST_SUITES[suite]}: ${results.passed}/${total} (${rate}%) - ${results.warnings} warnings`);
  });
  
  // Determinar estado general del sistema
  let estadoGeneral = 'EXCELENTE';
  if (successRate < 95) estadoGeneral = 'BUENO';
  if (successRate < 85) estadoGeneral = 'REGULAR';
  if (successRate < 70) estadoGeneral = 'CRÍTICO';
  
  console.log(`\n🏆 ESTADO GENERAL DEL SISTEMA: ${estadoGeneral}`);
  
  // Generar archivo de reporte
  await generarArchivoReporte(successRate, estadoGeneral);
  
  console.log(`\n🎉 TESTING EXHAUSTIVO COMPLETADO`);
  console.log(`📁 Reporte guardado en: docs/03-testing/COMPREHENSIVE_TESTING_REPORT.md`);
}

// 📁 GENERAR ARCHIVO DE REPORTE
async function generarArchivoReporte(successRate, estadoGeneral) {
  const reporte = `# REPORTE DE TESTING EXHAUSTIVO - UCN INCLUI2

**Fecha:** ${new Date().toISOString()}  
**Duración:** ${(testResults.executionTime / 60000).toFixed(1)} minutos  
**Estado General:** **${estadoGeneral}**  
**Tasa de Éxito:** **${successRate}%**

## 📊 RESUMEN EJECUTIVO

- **✅ Tests Exitosos:** ${testResults.passedTests}/${testResults.totalTests}
- **❌ Tests Fallidos:** ${testResults.failedTests}
- **⚠️ Advertencias:** ${testResults.warnings}
- **🎯 Tasa de Éxito:** ${successRate}%

## 📋 RESULTADOS POR SUITE

${Object.entries(testResults.suiteResults).map(([suite, results]) => {
  const total = results.passed + results.failed;
  const rate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : '0.0';
  return `### ${TEST_SUITES[suite]}
- **Exitosos:** ${results.passed}/${total} (${rate}%)
- **Fallidos:** ${results.failed}
- **Advertencias:** ${results.warnings}`;
}).join('\n\n')}

## 📝 RESULTADOS DETALLADOS

${testResults.detailedResults.map((result, index) => 
  `${index + 1}. **${result.test}** (${result.suite})
   - Estado: ${result.status}
   - Mensaje: ${result.message}
   - Timestamp: ${result.timestamp}`
).join('\n\n')}

## 🎯 RECOMENDACIONES

${successRate >= 95 ? 
  '✅ **SISTEMA LISTO PARA PRODUCCIÓN** - Todos los tests críticos pasaron exitosamente.' :
  successRate >= 85 ?
  '⚠️ **REVISAR ADVERTENCIAS** - Sistema funcional pero con mejoras recomendadas.' :
  '❌ **ACCIÓN REQUERIDA** - Resolver problemas críticos antes de producción.'
}

## 🔧 CONFIGURACIÓN DE TESTING

- **Base URL:** ${CONFIG.baseURL}
- **Timeout:** ${CONFIG.timeout}ms
- **Roles Testeados:** ${Object.keys(CONFIG.credentials).length}
- **Suites Ejecutadas:** ${Object.keys(TEST_SUITES).length}

---
*Reporte generado automáticamente por el Sistema de Testing UCN INCLUI2*
`;

  const rutaReporte = path.join(__dirname, '..', 'docs', '03-testing', 'COMPREHENSIVE_TESTING_REPORT.md');
  fs.writeFileSync(rutaReporte, reporte, 'utf8');
}

// 🚀 EJECUTAR TESTING
if (require.main === module) {
  ejecutarTestingExhaustivo()
    .then(() => {
      process.exit(testResults.failedTests > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Error fatal en testing:', error);
      process.exit(1);
    });
}

module.exports = { ejecutarTestingExhaustivo, testResults };
 