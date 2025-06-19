const axios = require('axios');
const { MongoClient } = require('mongodb');

const BASE_URL = 'http://localhost:3000';
const MONGO_URL = 'mongodb://localhost:27017/ucn_inclui2_test';

async function connectDB() {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    return client.db();
}

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

async function diagnoseProblem() {
    console.log('🔍 DIAGNÓSTICO DEL PROBLEMA /students/profile');
    console.log('===============================================\n');
    
    const db = await connectDB();
    
    // 1. Verificar usuarios con rol ESTUDIANTE
    console.log('1. 👥 Verificando usuarios con rol ESTUDIANTE...');
    const studentUsers = await db.collection('users').find({ 
        roles: { $in: ['ESTUDIANTE'] } 
    }).toArray();
    
    console.log(`   Encontrados: ${studentUsers.length} usuarios estudiantes`);
    studentUsers.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user._id})`);
    });
    
    // 2. Verificar estudiantes en colección students
    console.log('\n2. 🎓 Verificando registros en colección students...');
    const students = await db.collection('students').find({}).toArray();
    console.log(`   Encontrados: ${students.length} estudiantes en BD`);
    students.slice(0, 3).forEach(student => {
        console.log(`   - ${student.email || 'Sin email'} (ID: ${student._id})`);
    });
    
    // 3. Verificar correlación userId-studentId
    console.log('\n3. 🔗 Verificando correlación usuarios-estudiantes...');
    for (const user of studentUsers) {
        const student = await db.collection('students').findOne({ 
            email: user.email.toLowerCase() 
        });
        
        if (student) {
            console.log(`   ✅ ${user.email}: Usuario y estudiante existen`);
        } else {
            console.log(`   ❌ ${user.email}: Usuario existe pero NO hay registro de estudiante`);
        }
    }
    
    return { studentUsers, students };
}

async function createMissingStudentUser() {
    console.log('\n4. 🛠️  CREANDO USUARIO ESTUDIANTE DE PRUEBA...');
    
    const db = await connectDB();
    
    // Verificar si ya existe
    const existingUser = await db.collection('users').findOne({ 
        email: 'estudiante.test@alumnos.ucn.cl' 
    });
    
    if (existingUser) {
        console.log('   ✅ Usuario estudiante ya existe');
        return existingUser;
    }
    
    // Crear usuario estudiante
    const studentUser = {
        email: 'estudiante.test@alumnos.ucn.cl',
        nombreCompleto: 'Estudiante Test NEE',
        roles: ['ESTUDIANTE'],
        isActive: true,
        isProfileComplete: true,
        password_hash: '$2b$10$rI7ZqhZQZqhZQZqhZQZqhOe', // Hash dummy para Test123!
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    const userResult = await db.collection('users').insertOne(studentUser);
    console.log(`   ✅ Usuario creado con ID: ${userResult.insertedId}`);
    
    return { ...studentUser, _id: userResult.insertedId };
}

async function createStudentProfile(user) {
    console.log('\n5. 👨‍🎓 CREANDO PERFIL DE ESTUDIANTE...');
    
    const db = await connectDB();
    
    // Verificar si ya existe el perfil
    const existingStudent = await db.collection('students').findOne({ 
        email: user.email.toLowerCase() 
    });
    
    if (existingStudent) {
        console.log('   ✅ Perfil de estudiante ya existe');
        return existingStudent;
    }
    
    // Buscar una carrera válida
    const career = await db.collection('careers').findOne({});
    if (!career) {
        console.log('   ❌ No se encontró ninguna carrera para asociar');
        throw new Error('No hay carreras disponibles');
    }
    
    // Crear perfil de estudiante
    const studentProfile = {
        nombres: 'Estudiante Test',
        apellidos: 'NEE Prueba',
        email: user.email.toLowerCase(),
        rut: '12345678-9',
        telefono: '+56912345678',
        carreraId: career._id,
        semester: '2025-1',
        hasSpecialNeeds: true,
        specialNeedsType: 'Dislexia',
        semesterInfo: {
            currentSemester: '2025-1',
            entryYear: 2025,
            academicStatus: 'regular'
        },
        neeDetails: {
            primaryDiagnosis: 'Dislexia',
            categories: ['Aprendizaje'],
            supportLevel: 'moderado',
            additionalNotes: 'Estudiante de prueba para testing'
        },
        isActive: true,
        userId: user._id,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    const studentResult = await db.collection('students').insertOne(studentProfile);
    console.log(`   ✅ Perfil de estudiante creado con ID: ${studentResult.insertedId}`);
    
    // Actualizar usuario con referencia al estudiante
    await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { studentId: studentResult.insertedId } }
    );
    
    console.log('   ✅ Usuario actualizado con referencia al estudiante');
    
    return { ...studentProfile, _id: studentResult.insertedId };
}

async function testStudentProfile() {
    console.log('\n6. 🧪 PROBANDO ENDPOINT /students/profile...');
    
    // Login como estudiante
    const loginResult = await makeRequest('POST', '/auth/login', {
        email: 'estudiante.test@alumnos.ucn.cl',
        password: 'Test123!'
    });
    
    if (!loginResult.success) {
        console.log(`   ❌ Login falló: ${loginResult.message}`);
        return false;
    }
    
    const token = loginResult.data?.data?.data?.access_token;
    if (!token) {
        console.log('   ❌ No se obtuvo token de autenticación');
        return false;
    }
    
    console.log('   ✅ Login exitoso');
    
    // Probar endpoint de perfil
    const profileResult = await makeRequest('GET', '/students/profile', null, token);
    
    if (profileResult.success) {
        console.log('   ✅ Endpoint /students/profile funciona correctamente');
        console.log(`   📋 Datos del perfil: ${profileResult.data.nombres} ${profileResult.data.apellidos}`);
        return true;
    } else {
        console.log(`   ❌ Endpoint falló: ${profileResult.status} - ${profileResult.message}`);
        return false;
    }
}

async function runFix() {
    try {
        console.log('🚀 INICIANDO REPARACIÓN DE /students/profile');
        console.log('==============================================\n');
        
        // Diagnóstico
        const { studentUsers, students } = await diagnoseProblem();
        
        // Crear usuario si es necesario
        const user = await createMissingStudentUser();
        
        // Crear perfil si es necesario
        const student = await createStudentProfile(user);
        
        // Probar endpoint
        const success = await testStudentProfile();
        
        console.log('\n📝 RESUMEN FINAL');
        console.log('================');
        if (success) {
            console.log('✅ PROBLEMA SOLUCIONADO: /students/profile funciona correctamente');
        } else {
            console.log('❌ PROBLEMA PERSISTE: Revisar logs del servidor para más detalles');
        }
        
    } catch (error) {
        console.error('❌ ERROR CRÍTICO:', error.message);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    runFix().catch(console.error);
}

module.exports = { runFix, diagnoseProblem }; 