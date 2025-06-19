const axios = require('axios');
const { MongoClient } = require('mongodb');

const BASE_URL = 'http://localhost:3000';
const MONGO_URL = 'mongodb://localhost:27017/ucn_inclui2_test';

async function debugStudentIdProblem() {
    console.log('🔍 DEBUG ESPECÍFICO: PROBLEMA STUDENT ID');
    console.log('=======================================');
    
    const mongoClient = new MongoClient(MONGO_URL);
    await mongoClient.connect();
    const db = mongoClient.db();
    
    try {
        // 1. Verificar datos en BD
        console.log('📊 Paso 1: Verificando datos en BD...');
        const user = await db.collection('users').findOne({ 
            email: 'estudiante@alumnos.ucn.cl' 
        });
        
        if (!user) {
            console.log('❌ Usuario no encontrado en BD');
            return;
        }
        
        console.log('👤 Usuario encontrado:');
        console.log(`   ID: ${user._id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   StudentId: ${user.studentId || 'NO DEFINIDO'}`);
        console.log(`   Roles: [${user.roles?.join(', ') || 'undefined'}]`);
        
        // 2. Login y verificar token payload
        console.log('\\n🔐 Paso 2: Login y análisis de token...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'estudiante@alumnos.ucn.cl',
            password: 'Test123!'
        });
        
        const token = loginResponse.data?.data?.data?.access_token;
        if (!token) {
            console.log('❌ No se obtuvo token');
            return;
        }
        
        console.log('✅ Token obtenido');
        
        // Decodificar token JWT (base64)
        const [header, payload, signature] = token.split('.');
        const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
        
        console.log('🔓 Payload del token JWT:');
        console.log(`   sub (user ID): ${decodedPayload.sub}`);
        console.log(`   email: ${decodedPayload.email}`);
        console.log(`   iat: ${new Date(decodedPayload.iat * 1000).toISOString()}`);
        console.log(`   exp: ${new Date(decodedPayload.exp * 1000).toISOString()}`);
        
        // 3. Verificar qué recibe el endpoint
        console.log('\\n📡 Paso 3: Probando endpoint con headers detallados...');
        
        try {
            const response = await axios.get(`${BASE_URL}/students/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });
            
            console.log('✅ ÉXITO: Endpoint funcionó');
            console.log('📋 Datos recibidos:', response.data);
            
        } catch (error) {
            console.log('❌ ERROR en endpoint:');
            console.log(`   Status: ${error.response?.status}`);
            console.log(`   Error: ${error.response?.data?.message || error.message}`);
            console.log(`   Stack: ${error.response?.data?.stack || 'No disponible'}`);
            
            // Diagnóstico específico
            if (error.response?.status === 500) {
                console.log('\\n🔬 DIAGNÓSTICO ERROR 500:');
                
                // Verificar si studentId existe en usuario
                if (!user.studentId) {
                    console.log('🎯 CAUSA: Usuario no tiene studentId definido');
                    console.log('💡 SOLUCIÓN: Agregar studentId al usuario');
                    
                    // Buscar estudiante correspondiente
                    const student = await db.collection('students').findOne({ 
                        email: user.email.toLowerCase() 
                    });
                    
                    if (student) {
                        console.log(`   📋 Estudiante encontrado: ${student._id}`);
                        console.log('   🔧 Actualizando usuario con studentId...');
                        
                        await db.collection('users').updateOne(
                            { _id: user._id },
                            { $set: { studentId: student._id } }
                        );
                        
                        console.log('   ✅ Usuario actualizado, reintentar endpoint');
                    } else {
                        console.log('   ❌ No hay estudiante para este usuario');
                    }
                } else {
                    console.log('🤔 Usuario SÍ tiene studentId, problema podría ser:');
                    console.log('   1. Servidor no reiniciado');
                    console.log('   2. Error en findOne()');
                    console.log('   3. StudentId apunta a estudiante inexistente');
                    
                    // Verificar si el estudiante existe
                    const student = await db.collection('students').findOne({ 
                        _id: user.studentId 
                    });
                    
                    if (student) {
                        console.log('   ✅ Estudiante referenciado existe');
                    } else {
                        console.log('   ❌ StudentId apunta a estudiante inexistente');
                    }
                }
            }
        }
        
    } finally {
        await mongoClient.close();
    }
}

// Ejecutar debug
debugStudentIdProblem()
    .then(() => console.log('\\n✅ Debug completado'))
    .catch(error => console.error('\\n❌ Error en debug:', error.message)); 