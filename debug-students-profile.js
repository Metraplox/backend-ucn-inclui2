const { MongoClient } = require('mongodb');
const axios = require('axios');

const MONGO_URL = 'mongodb://localhost:27017/ucn_inclui2_test';
const BASE_URL = 'http://localhost:3000';

/**
 * DEBUGGER PROFESIONAL - ENDPOINT /students/profile
 * Análisis sistemático del error 500
 */

class StudentsProfileDebugger {
    constructor() {
        this.mongoClient = null;
        this.db = null;
    }

    async init() {
        this.mongoClient = new MongoClient(MONGO_URL);
        await this.mongoClient.connect();
        this.db = this.mongoClient.db();
        
        console.log('🔍 DEBUGGER PROFESIONAL INICIADO');
        console.log('================================');
        console.log(`MongoDB: ${MONGO_URL}`);
        console.log(`API: ${BASE_URL}`);
        console.log('');
    }

    async makeRequest(method, endpoint, data = null, token = null) {
        try {
            const config = {
                method,
                url: `${BASE_URL}${endpoint}`,
                timeout: 10000,
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
            const errorData = error.response?.data || {};
            return { success: false, status, message, errorData, error: error.code };
        }
    }

    async step1_AnalizeDatabase() {
        console.log('🔍 PASO 1: ANÁLISIS DE BASE DE DATOS');
        console.log('===================================');
        
        // 1.1 Verificar usuarios estudiantes
        const users = await this.db.collection('users').find({ 
            roles: { $in: ['ESTUDIANTE'] } 
        }).toArray();
        
        console.log(`📊 Usuarios con rol ESTUDIANTE: ${users.length}`);
        users.forEach((user, i) => {
            console.log(`   ${i+1}. ${user.email}`);
            console.log(`      ID: ${user._id}`);
            console.log(`      Roles: [${user.roles?.join(', ') || 'undefined'}]`);
            console.log(`      Activo: ${user.isActive}`);
            console.log(`      StudentId vinculado: ${user.studentId || 'NO'}`);
            console.log('');
        });
        
        // 1.2 Verificar estudiantes
        const students = await this.db.collection('students').find({}).toArray();
        console.log(`📊 Registros en colección 'students': ${students.length}`);
        students.forEach((student, i) => {
            console.log(`   ${i+1}. ${student.email || 'Sin email'}`);
            console.log(`      ID: ${student._id}`);
            console.log(`      UserID vinculado: ${student.userId || 'NO'}`);
            console.log(`      Nombre: ${student.nombres} ${student.apellidos}`);
            console.log('');
        });
        
        // 1.3 Verificar vinculaciones
        console.log('🔗 ANÁLISIS DE VINCULACIONES:');
        for (const user of users) {
            const studentByEmail = await this.db.collection('students').findOne({ 
                email: user.email.toLowerCase() 
            });
            
            const studentByUserId = user.studentId ? 
                await this.db.collection('students').findOne({ userId: user.studentId }) : 
                null;
            
            console.log(`   Usuario: ${user.email}`);
            console.log(`   - Estudiante por email: ${studentByEmail ? '✅ SÍ' : '❌ NO'}`);
            console.log(`   - Estudiante por userId: ${studentByUserId ? '✅ SÍ' : '❌ NO'}`);
            
            if (studentByEmail && !studentByUserId) {
                console.log(`   ⚠️  PROBLEMA: Estudiante existe por email pero no por userId`);
            }
            console.log('');
        }
    }

    async step2_TestAuthentication() {
        console.log('🔐 PASO 2: ANÁLISIS DE AUTENTICACIÓN');
        console.log('===================================');
        
        // Buscar un usuario estudiante válido
        const studentUser = await this.db.collection('users').findOne({ 
            roles: { $in: ['ESTUDIANTE'] },
            isActive: true 
        });
        
        if (!studentUser) {
            console.log('❌ NO HAY USUARIOS ESTUDIANTE ACTIVOS PARA PROBAR');
            return null;
        }
        
        console.log(`🎓 Probando autenticación con: ${studentUser.email}`);
        
        // Intentar login
        const loginResult = await this.makeRequest('POST', '/auth/login', {
            email: studentUser.email,
            password: 'Test123!' // Password por defecto de testing
        });
        
        if (!loginResult.success) {
            console.log(`❌ LOGIN FALLÓ: ${loginResult.status} - ${loginResult.message}`);
            return null;
        }
        
        const token = loginResult.data?.data?.data?.access_token;
        if (!token) {
            console.log('❌ NO SE OBTUVO TOKEN');
            return null;
        }
        
        console.log('✅ LOGIN EXITOSO');
        console.log(`🔑 Token: ${token.substring(0, 30)}...`);
        
        return { user: studentUser, token };
    }

    async step3_TestProfileEndpoint(authData) {
        console.log('📄 PASO 3: ANÁLISIS DEL ENDPOINT /students/profile');
        console.log('=================================================');
        
        if (!authData) {
            console.log('❌ NO HAY DATOS DE AUTENTICACIÓN VÁLIDOS');
            return;
        }
        
        const { user, token } = authData;
        
        // Probar el endpoint
        console.log(`🧪 Probando GET /students/profile con usuario: ${user.email}`);
        
        const result = await this.makeRequest('GET', '/students/profile', null, token);
        
        console.log(`📊 RESULTADO:`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Éxito: ${result.success ? '✅' : '❌'}`);
        
        if (result.success) {
            console.log(`   ✅ ENDPOINT FUNCIONANDO CORRECTAMENTE`);
            console.log(`   📋 Datos retornados:`);
            console.log(`       Nombre: ${result.data.nombres} ${result.data.apellidos}`);
            console.log(`       Email: ${result.data.email}`);
            console.log(`       RUT: ${result.data.rut}`);
        } else {
            console.log(`   ❌ ERROR DETECTADO:`);
            console.log(`   Mensaje: ${result.message}`);
            console.log(`   Datos adicionales:`, result.errorData);
            
            // Análisis del error
            this.diagnoseError(result, user);
        }
    }

    diagnoseError(result, user) {
        console.log('\n🔬 DIAGNÓSTICO DETALLADO DEL ERROR:');
        console.log('==================================');
        
        switch (result.status) {
            case 401:
                console.log('❌ ERROR 401 - NO AUTORIZADO');
                console.log('   - El token JWT es inválido o expiró');
                console.log('   - Verificar que el token se esté enviando correctamente');
                break;
                
            case 403:
                console.log('❌ ERROR 403 - PROHIBIDO');
                console.log('   - El usuario no tiene el rol ESTUDIANTE');
                console.log(`   - Roles actuales del usuario: [${user.roles?.join(', ') || 'undefined'}]`);
                console.log('   - Verificar configuración de roles en la BD');
                break;
                
            case 404:
                console.log('❌ ERROR 404 - NO ENCONTRADO');
                console.log('   - No existe perfil de estudiante para este email');
                console.log(`   - Email buscado: ${user.email}`);
                console.log('   - Verificar que exista registro en colección students');
                break;
                
            case 500:
                console.log('❌ ERROR 500 - ERROR INTERNO DEL SERVIDOR');
                console.log('   POSIBLES CAUSAS:');
                console.log('   1. Error en el método findByEmail del StudentsService');
                console.log('   2. Problema de conexión con MongoDB');
                console.log('   3. Error en la query de búsqueda');
                console.log('   4. Problema con el decorador @CurrentUser');
                console.log('   5. Datos corruptos en la base de datos');
                
                // Análisis específico para error 500
                this.analyzeError500(user);
                break;
                
            default:
                console.log(`❌ ERROR DESCONOCIDO: ${result.status}`);
                console.log(`   Mensaje: ${result.message}`);
        }
    }

    async analyzeError500(user) {
        console.log('\n🛠️  ANÁLISIS ESPECÍFICO ERROR 500:');
        console.log('================================');
        
        try {
            // Verificar si existe el estudiante por email
            const student = await this.db.collection('students').findOne({ 
                email: user.email.toLowerCase().trim() 
            });
            
            if (!student) {
                console.log('🎯 CAUSA IDENTIFICADA: NO EXISTE ESTUDIANTE CON ESE EMAIL');
                console.log(`   Email buscado: ${user.email.toLowerCase().trim()}`);
                console.log('   ✅ SOLUCIÓN: Crear registro de estudiante para este usuario');
            } else {
                console.log('✅ El estudiante SÍ existe en la BD');
                console.log('🎯 CAUSA POSIBLE: Error en el código del servicio o controlador');
                console.log('   ✅ SOLUCIÓN: Revisar logs del servidor o método findByEmail');
            }
            
        } catch (error) {
            console.log('❌ Error al analizar la BD:', error.message);
        }
    }

    async step4_ProposeSolution() {
        console.log('\n💡 PASO 4: SOLUCIÓN PROFESIONAL');
        console.log('==============================');
        
        const users = await this.db.collection('users').find({ 
            roles: { $in: ['ESTUDIANTE'] } 
        }).toArray();
        
        let solutionsApplied = 0;
        
        for (const user of users) {
            const student = await this.db.collection('students').findOne({ 
                email: user.email.toLowerCase() 
            });
            
            if (!student) {
                console.log(`🔧 Creando perfil de estudiante para: ${user.email}`);
                
                // Buscar una carrera válida
                const career = await this.db.collection('careers').findOne({});
                if (!career) {
                    console.log('❌ No hay carreras disponibles. Crear carrera primero.');
                    continue;
                }
                
                // Crear perfil de estudiante
                const newStudent = {
                    _id: new this.mongoClient.ObjectId(),
                    nombres: user.nombreCompleto?.split(' ')[0] || 'Estudiante',
                    apellidos: user.nombreCompleto?.split(' ').slice(1).join(' ') || 'Test',
                    email: user.email.toLowerCase(),
                    rut: `${Math.floor(Math.random() * 90000000) + 10000000}-${Math.floor(Math.random() * 9) + 1}`,
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
                        supportLevel: 'moderado'
                    },
                    isActive: true,
                    userId: user._id,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                
                await this.db.collection('students').insertOne(newStudent);
                
                // Actualizar usuario con referencia al estudiante
                await this.db.collection('users').updateOne(
                    { _id: user._id },
                    { $set: { studentId: newStudent._id } }
                );
                
                console.log(`   ✅ Perfil creado y vinculado correctamente`);
                solutionsApplied++;
            }
        }
        
        console.log(`\n📊 RESUMEN DE SOLUCIONES APLICADAS: ${solutionsApplied}`);
        
        if (solutionsApplied > 0) {
            console.log('✅ PROBLEMA CORREGIDO: Los usuarios estudiante ahora tienen perfiles vinculados');
            console.log('🧪 RECOMENDACIÓN: Ejecutar nuevamente el test del endpoint');
        } else {
            console.log('ℹ️  NO SE APLICARON CORRECCIONES: Los datos ya estaban correctos');
            console.log('🔍 RECOMENDACIÓN: Revisar logs del servidor para detectar otro tipo de error');
        }
    }

    async step5_FinalVerification() {
        console.log('\n🧪 PASO 5: VERIFICACIÓN FINAL');
        console.log('============================');
        
        const authData = await this.step2_TestAuthentication();
        if (!authData) {
            console.log('❌ No se pudo autenticar para verificación final');
            return;
        }
        
        console.log('🔄 Reintentando endpoint después de las correcciones...');
        await this.step3_TestProfileEndpoint(authData);
    }

    async runCompleteDebug() {
        try {
            await this.init();
            
            await this.step1_AnalizeDatabase();
            const authData = await this.step2_TestAuthentication();
            await this.step3_TestProfileEndpoint(authData);
            await this.step4_ProposeSolution();
            await this.step5_FinalVerification();
            
            console.log('\n🎯 DEBUGGING COMPLETADO');
            console.log('======================');
            console.log('Revisa los resultados anteriores para identificar y corregir el problema.');
            
        } catch (error) {
            console.error('❌ ERROR EN EL DEBUGGER:', error.message);
            console.error('Stack:', error.stack);
        } finally {
            if (this.mongoClient) {
                await this.mongoClient.close();
            }
        }
    }
}

// Ejecutar el debugger
if (require.main === module) {
    const debugger = new StudentsProfileDebugger();
    debugger.runCompleteDebug()
        .then(() => {
            console.log('\n✅ Debugging completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Error en debugging:', error.message);
            process.exit(1);
        });
}

module.exports = StudentsProfileDebugger;