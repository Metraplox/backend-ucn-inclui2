const axios = require('axios');

// Configuración base
const BASE_URL = 'http://localhost:3000';
const timeout = 5000;

// Usuarios de prueba según documentación
const testUsers = {
    coordinadora: { email: 'coordinadora@ucn.cl', password: 'Test123!' },
    educadora: { email: 'educadora@ucn.cl', password: 'Test123!' },
    diddec: { email: 'diddec@ucn.cl', password: 'Test123!' }
};

let tokens = {};

// Utilidad para hacer peticiones
async function makeRequest(method, endpoint, data = null, token = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            timeout,
            headers: {}
        };
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        return { success: true, status: response.status, data: response.data };
    } catch (error) {
        const status = error.response?.status || 0;
        const message = error.response?.data?.message || error.message;
        return { success: false, status, message, error: error.code };
    }
}

// Test de autenticación
async function testAuth() {
    console.log('\n🔐 TESTING AUTHENTICATION');
    console.log('==========================');
    
    for (const [role, credentials] of Object.entries(testUsers)) {
        try {
            const result = await makeRequest('POST', '/auth/login', credentials);
            
            if (result.success && result.data?.data?.data?.access_token) {
                tokens[role] = result.data.data.data.access_token;
                console.log(`✅ ${role}: Login exitoso`);
            } else {
                console.log(`❌ ${role}: Login fallido - ${result.message}`);
            }
        } catch (error) {
            console.log(`❌ ${role}: Error - ${error.message}`);
        }
    }
}

// Test de endpoints críticos
async function testCriticalEndpoints() {
    console.log('\n📋 TESTING ENDPOINTS CRÍTICOS');
    console.log('===============================');
    
    const criticalTests = [
        { endpoint: '/', method: 'GET', description: 'Health Check', auth: false },
        { endpoint: '/users/profile', method: 'GET', description: 'Perfil Usuario', auth: 'coordinadora' },
        { endpoint: '/students', method: 'GET', description: 'Lista Estudiantes', auth: 'coordinadora' },
        { endpoint: '/students/profile', method: 'GET', description: 'Perfil Estudiante [CRÍTICO]', auth: 'coordinadora' },
        { endpoint: '/adjustments', method: 'GET', description: 'Lista Ajustes', auth: 'coordinadora' },
        { endpoint: '/departments', method: 'GET', description: 'Lista Departamentos', auth: 'coordinadora' },
        { endpoint: '/careers', method: 'GET', description: 'Lista Carreras', auth: 'coordinadora' },
        { endpoint: '/courses', method: 'GET', description: 'Lista Cursos', auth: 'coordinadora' },
        { endpoint: '/categories', method: 'GET', description: 'Lista Categorías', auth: 'coordinadora' },
        { endpoint: '/resources', method: 'GET', description: 'Lista Recursos', auth: 'coordinadora' },
        { endpoint: '/notifications', method: 'GET', description: 'Notificaciones', auth: 'coordinadora' }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of criticalTests) {
        const token = test.auth ? tokens[test.auth] : null;
        const result = await makeRequest(test.method, test.endpoint, null, token);
        
        if (result.success) {
            console.log(`✅ ${test.description}: Status ${result.status}`);
            passed++;
        } else {
            console.log(`❌ ${test.description}: ${result.status} - ${result.message}`);
            failed++;
        }
    }
    
    console.log(`\n📊 RESUMEN: ${passed} exitosos, ${failed} fallidos`);
    return { passed, failed };
}

// Test de endpoints problemáticos conocidos
async function testProblematicEndpoints() {
    console.log('\n🔍 TESTING ENDPOINTS PROBLEMÁTICOS');
    console.log('===================================');
    
    const problematicTests = [
        { endpoint: '/documents', method: 'GET', description: 'Documents Base (404 esperado)' },
        { endpoint: '/consents', method: 'GET', description: 'Consents Base (404 esperado)' },
        { endpoint: '/nee-categories', method: 'GET', description: 'NEE Categories (404 esperado)' },
        { endpoint: '/educational-resources', method: 'GET', description: 'Educational Resources (404 esperado)' }
    ];
    
    for (const test of problematicTests) {
        const result = await makeRequest(test.method, test.endpoint, null, tokens.coordinadora);
        
        if (result.status === 404) {
            console.log(`⚠️  ${test.description}: Confirmado 404 (ruta no implementada)`);
        } else if (result.success) {
            console.log(`✅ ${test.description}: Funciona! Status ${result.status}`);
        } else {
            console.log(`❌ ${test.description}: ${result.status} - ${result.message}`);
        }
    }
}

// Función principal
async function runTests() {
    console.log('🚀 INICIANDO VALIDACIÓN DE ENDPOINTS UCN INCLUI2');
    console.log('=================================================');
    console.log(`Fecha: ${new Date().toISOString()}`);
    console.log(`URL Base: ${BASE_URL}`);
    
    try {
        // Verificar conectividad
        const healthCheck = await makeRequest('GET', '/');
        if (!healthCheck.success) {
            console.log('❌ ERROR: Servidor no disponible en', BASE_URL);
            console.log('   Asegúrate de que el servidor esté corriendo con: npm run start:dev');
            return;
        }
        
        console.log('✅ Servidor disponible');
        
        // Ejecutar tests
        await testAuth();
        const results = await testCriticalEndpoints();
        await testProblematicEndpoints();
        
        // Resumen final
        console.log('\n📝 RESUMEN FINAL');
        console.log('=================');
        console.log(`Estado: ${results.passed > results.failed ? '✅ ACEPTABLE' : '❌ REQUIERE ATENCIÓN'}`);
        console.log(`Endpoints funcionando: ${results.passed}`);
        console.log(`Endpoints con problemas: ${results.failed}`);
        console.log(`Tasa de éxito: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
        
        if (results.failed > 0) {
            console.log('\n⚠️  RECOMENDACIONES:');
            console.log('1. Verificar que todos los usuarios tengan roles asignados');
            console.log('2. Revisar el endpoint /students/profile (problema crítico conocido)');
            console.log('3. Validar configuración de JWT y guards');
        }
        
    } catch (error) {
        console.log('❌ ERROR CRÍTICO:', error.message);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests, makeRequest }; 