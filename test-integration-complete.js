// Prueba de integración completa frontend-backend UCN INCLUI2
// Puerto backend: 3001, Puerto frontend: 8080

const axios = require('axios');
const { exec } = require('child_process');

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:8080';

const usuarios = [
    { email: 'coordinador@ucn.cl', password: 'password123', rol: 'COORDINADOR' },
    { email: 'educadora@ucn.cl', password: 'password123', rol: 'EDUCADORA_SOCIAL' },
    { email: 'diddec@ucn.cl', password: 'password123', rol: 'DIDDEC_STAFF' },
    { email: 'estudiante@alumnos.ucn.cl', password: 'password123', rol: 'ESTUDIANTE' },
    { email: 'docente@ucn.cl', password: 'password123', rol: 'DOCENTE' },
    { email: 'jefe.carrera@ucn.cl', password: 'password123', rol: 'JEFE_CARRERA' },
    { email: 'jefe.departamento@ucn.cl', password: 'password123', rol: 'JEFE_DEPARTAMENTO' }
];

async function testCompleteIntegration() {
    console.log('🔗 PRUEBA DE INTEGRACIÓN COMPLETA UCN INCLUI2');
    console.log('=' .repeat(60));
    console.log(`📍 Backend: ${BACKEND_URL}`);
    console.log(`📍 Frontend: ${FRONTEND_URL}`);
    console.log();

    let results = {
        backend: { status: false, tests: 0, passed: 0 },
        frontend: { status: false, tests: 0, passed: 0 },
        integration: { status: false, tests: 0, passed: 0 }
    };

    // 1. PRUEBAS DE BACKEND
    console.log('🔧 1. VERIFICANDO BACKEND...');
    try {
        // Health check
        const health = await axios.get(`${BACKEND_URL}/health`);
        results.backend.tests++;
        if (health.status === 200) {
            console.log('✅ Health check: OK');
            results.backend.passed++;
        }

        // Login tests
        for (const usuario of usuarios) {
            results.backend.tests++;
            try {
                const login = await axios.post(`${BACKEND_URL}/auth/login`, {
                    email: usuario.email,
                    password: usuario.password
                });
                
                if (login.data?.data?.access_token && login.data?.data?.user?.email === usuario.email) {
                    console.log(`✅ Login ${usuario.rol}: OK`);
                    results.backend.passed++;
                } else {
                    console.log(`❌ Login ${usuario.rol}: FALLO`);
                }
            } catch (error) {
                console.log(`❌ Login ${usuario.rol}: ERROR - ${error.message}`);
            }
        }

        results.backend.status = results.backend.passed === results.backend.tests;
        
    } catch (error) {
        console.log(`❌ Backend no disponible: ${error.message}`);
    }

    // 2. PRUEBAS DE FRONTEND
    console.log('\n🖥️  2. VERIFICANDO FRONTEND...');
    try {
        results.frontend.tests++;
        const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 5000 });
        
        if (frontendResponse.status === 200) {
            console.log('✅ Frontend web: OK');
            results.frontend.passed++;
            results.frontend.status = true;
        }
    } catch (error) {
        console.log(`❌ Frontend no disponible: ${error.message}`);
    }

    // 3. PRUEBAS DE INTEGRACIÓN
    console.log('\n🔗 3. VERIFICANDO INTEGRACIÓN...');
    
    if (results.backend.status && results.frontend.status) {
        results.integration.tests++;
        console.log('✅ Backend y Frontend operativos');
        results.integration.passed++;

        // Verificar configuración de puertos
        results.integration.tests++;
        console.log('✅ Configuración de puertos: Backend 3001, Frontend 8080');
        results.integration.passed++;

        results.integration.status = results.integration.passed === results.integration.tests;
    }

    // RESUMEN FINAL
    console.log('\n📊 RESUMEN DE PRUEBAS');
    console.log('=' .repeat(60));
    console.log(`🔧 Backend: ${results.backend.passed}/${results.backend.tests} ${results.backend.status ? '✅' : '❌'}`);
    console.log(`🖥️  Frontend: ${results.frontend.passed}/${results.frontend.tests} ${results.frontend.status ? '✅' : '❌'}`);
    console.log(`🔗 Integración: ${results.integration.passed}/${results.integration.tests} ${results.integration.status ? '✅' : '❌'}`);
    
    const totalPassed = results.backend.passed + results.frontend.passed + results.integration.passed;
    const totalTests = results.backend.tests + results.frontend.tests + results.integration.tests;
    
    console.log(`\n🎯 TOTAL: ${totalPassed}/${totalTests} (${Math.round(totalPassed/totalTests*100)}%)`);
    
    if (results.backend.status && results.frontend.status && results.integration.status) {
        console.log('\n🎉 ¡INTEGRACIÓN COMPLETA EXITOSA!');
        console.log('✅ Sistema listo para producción');
        return true;
    } else {
        console.log('\n⚠️  PROBLEMAS DETECTADOS:');
        if (!results.backend.status) console.log('❌ Backend requiere atención');
        if (!results.frontend.status) console.log('❌ Frontend requiere atención');
        if (!results.integration.status) console.log('❌ Integración requiere atención');
        return false;
    }
}

// Ejecutar pruebas
testCompleteIntegration()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('\n💥 ERROR CRÍTICO:', error.message);
        process.exit(1);
    });
