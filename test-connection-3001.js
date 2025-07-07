// Test de conexión frontend-backend en puerto 3001
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testConnection() {
    console.log('🔗 PROBANDO CONEXIÓN FRONTEND-BACKEND EN PUERTO 3001');
    console.log('=' .repeat(60));
    
    try {
        // 1. Test health endpoint
        console.log('\n📊 1. Probando endpoint de salud...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health check exitoso:', healthResponse.data);
        
        // 2. Test login
        console.log('\n🔐 2. Probando login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'coordinador@ucn.cl',
            password: 'password123'
        });
        
        console.log('✅ Login exitoso');
        console.log('Token recibido:', loginResponse.data.data?.token ? 'SÍ' : 'NO');
        console.log('Usuario:', loginResponse.data.data?.user?.email);
        console.log('Rol:', loginResponse.data.data?.user?.role);
        
        // 3. Test endpoint protegido
        const token = loginResponse.data.data.token;
        if (token) {
            console.log('\n🔒 3. Probando endpoint protegido...');
            const studentsResponse = await axios.get(`${BASE_URL}/students`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Endpoint protegido funcionando');
            console.log('Respuesta:', studentsResponse.status);
        }
        
        console.log('\n🎉 TODAS LAS PRUEBAS EXITOSAS');
        console.log('✅ Backend funcionando correctamente en puerto 3001');
        console.log('✅ Frontend puede conectarse sin problemas');
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.response?.data || error.message);
        console.log('\n📋 ESTADO DE LA CONEXIÓN:');
        console.log('- Backend puerto 3001:', error.code === 'ECONNREFUSED' ? '❌ NO DISPONIBLE' : '✅ DISPONIBLE');
        
        if (error.response?.status === 401) {
            console.log('- Autenticación: ❌ PROBLEMA CON TOKEN');
        } else if (error.response?.status) {
            console.log(`- Status HTTP: ${error.response.status}`);
        }
    }
}

testConnection();
