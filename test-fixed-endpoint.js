const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testStudentProfileEndpoint() {
    console.log('🧪 PRUEBA FINAL DEL ENDPOINT /students/profile');
    console.log('==============================================');
    
    try {
        // 1. Login con usuario estudiante
        console.log('🔐 Paso 1: Autenticación...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'estudiante@alumnos.ucn.cl',
            password: 'Test123!'
        });
        
        const token = loginResponse.data?.data?.data?.access_token;
        if (!token) {
            console.log('❌ No se obtuvo token de autenticación');
            return;
        }
        
        console.log('✅ Login exitoso');
        
        // 2. Probar endpoint /students/profile
        console.log('\\n📄 Paso 2: Probando /students/profile...');
        
        const profileResponse = await axios.get(`${BASE_URL}/students/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ ÉXITO: El endpoint funciona correctamente');
        console.log('📋 Datos del perfil:');
        console.log(`   Nombre: ${profileResponse.data.nombres} ${profileResponse.data.apellidos}`);
        console.log(`   Email: ${profileResponse.data.email}`);
        console.log(`   RUT: ${profileResponse.data.rut}`);
        console.log(`   Carrera ID: ${profileResponse.data.carreraId}`);
        console.log(`   User ID: ${profileResponse.data.userId}`);
        
        console.log('\\n🎯 RESULTADO FINAL: ✅ ENDPOINT COMPLETAMENTE FUNCIONAL');
        
    } catch (error) {
        console.log('❌ ERROR EN LA PRUEBA:');
        console.log(`   Status: ${error.response?.status || 'N/A'}`);
        console.log(`   Mensaje: ${error.response?.data?.message || error.message}`);
        console.log('\\n🎯 RESULTADO FINAL: ❌ EL ENDPOINT AÚN TIENE PROBLEMAS');
    }
}

// Ejecutar prueba
testStudentProfileEndpoint(); 