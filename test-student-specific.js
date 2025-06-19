const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function makeRequest(method, endpoint, data = null, token = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            timeout: 5000,
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

async function testStudentProfileEndpoint() {
    console.log('🧪 TESTING ESPECÍFICO DEL ENDPOINT /students/profile');
    console.log('====================================================\n');
    
    // 1. Login como estudiante real
    console.log('1. 🎓 Intentando login como estudiante...');
    const loginResult = await makeRequest('POST', '/auth/login', {
        email: 'estudiante.test@alumnos.ucn.cl',
        password: 'Test123!'
    });
    
    if (!loginResult.success) {
        console.log(`   ❌ Login falló: ${loginResult.message}`);
        console.log('   💡 El usuario estudiante no existe o la contraseña es incorrecta');
        return false;
    }
    
    const token = loginResult.data?.data?.data?.access_token;
    if (!token) {
        console.log('   ❌ No se obtuvo token de autenticación');
        return false;
    }
    
    console.log('   ✅ Login exitoso como estudiante');
    console.log(`   🔑 Token obtenido: ${token.substring(0, 20)}...`);
    
    // 2. Probar endpoint de perfil
    console.log('\n2. 📄 Probando endpoint /students/profile...');
    const profileResult = await makeRequest('GET', '/students/profile', null, token);
    
    if (profileResult.success) {
        console.log('   ✅ Endpoint /students/profile funciona correctamente!');
        console.log(`   📋 Datos del perfil:`);
        console.log(`       Nombre: ${profileResult.data.nombres} ${profileResult.data.apellidos}`);
        console.log(`       Email: ${profileResult.data.email}`);
        console.log(`       RUT: ${profileResult.data.rut}`);
        console.log(`       Carrera ID: ${profileResult.data.carreraId}`);
        console.log(`       Semestre: ${profileResult.data.semester}`);
        console.log(`       NEE: ${profileResult.data.hasSpecialNeeds ? 'Sí' : 'No'}`);
        
        return true;
    } else {
        console.log(`   ❌ Endpoint falló: ${profileResult.status} - ${profileResult.message}`);
        
        // Diagnóstico adicional
        if (profileResult.status === 403) {
            console.log('   💡 Error 403: El usuario no tiene rol ESTUDIANTE');
        } else if (profileResult.status === 404) {
            console.log('   💡 Error 404: No se encontró perfil de estudiante para este usuario');
        } else if (profileResult.status === 500) {
            console.log('   💡 Error 500: Problema interno del servidor');
            console.log('       - Verificar que el usuario tenga rol ESTUDIANTE correcto');
            console.log('       - Verificar que exista el perfil de estudiante vinculado');
            console.log('       - Revisar logs del servidor para más detalles');
        }
        
        return false;
    }
}

async function testAlternativeStudents() {
    console.log('\n3. 🔍 Probando con otros usuarios estudiantes existentes...');
    
    const alternativeStudents = [
        { email: 'estudiante@alumnos.ucn.cl', password: 'Test123!' },
        { email: 'juan.perez@estudiante.ucn.cl', password: 'Test123!' },
        { email: 'maria.rodriguez@estudiante.ucn.cl', password: 'Test123!' }
    ];
    
    for (const student of alternativeStudents) {
        console.log(`\n   Probando: ${student.email}`);
        
        const loginResult = await makeRequest('POST', '/auth/login', student);
        
        if (loginResult.success) {
            const token = loginResult.data?.data?.data?.access_token;
            console.log('     ✅ Login exitoso');
            
            const profileResult = await makeRequest('GET', '/students/profile', null, token);
            
            if (profileResult.success) {
                console.log('     ✅ Perfil obtenido exitosamente!');
                console.log(`     📋 ${profileResult.data.nombres} ${profileResult.data.apellidos}`);
                return true;
            } else {
                console.log(`     ❌ Perfil falló: ${profileResult.status}`);
            }
        } else {
            console.log(`     ❌ Login falló: ${loginResult.status}`);
        }
    }
    
    return false;
}

async function runStudentTest() {
    try {
        console.log('🚀 VALIDACIÓN ESPECÍFICA DEL ENDPOINT /students/profile');
        console.log('======================================================\n');
        
        // Test principal
        const success = await testStudentProfileEndpoint();
        
        // Si falla, probar alternativas
        if (!success) {
            const alternativeSuccess = await testAlternativeStudents();
            
            if (!alternativeSuccess) {
                console.log('\n❌ DIAGNÓSTICO FINAL');
                console.log('===================');
                console.log('El endpoint /students/profile no funciona con ningún usuario estudiante.');
                console.log('Posibles causas:');
                console.log('1. No existen usuarios con rol ESTUDIANTE válidos');
                console.log('2. Los usuarios estudiantes no tienen perfiles vinculados');
                console.log('3. Hay un bug en el código del endpoint');
                console.log('4. La base de datos no está configurada correctamente');
            }
        }
        
        console.log('\n📊 RESULTADO FINAL');
        console.log('===================');
        if (success || alternativeSuccess) {
            console.log('✅ ENDPOINT /students/profile FUNCIONA CORRECTAMENTE');
            console.log('El problema del error 500 ha sido resuelto.');
        } else {
            console.log('❌ ENDPOINT /students/profile AÚN TIENE PROBLEMAS');
            console.log('Se requiere investigación adicional del código.');
        }
        
    } catch (error) {
        console.error('❌ ERROR EN LA VALIDACIÓN:', error.message);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    runStudentTest().catch(console.error);
}

module.exports = { runStudentTest }; 