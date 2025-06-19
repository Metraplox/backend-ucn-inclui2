const { MongoClient } = require('mongodb');

const MONGO_URL = 'mongodb://localhost:27017/ucn_inclui2_test';

/**
 * VERIFICACIÓN PROFESIONAL DE INTEGRIDAD DE DATOS
 * Analizar la relación entre collections users y students
 */

class DataIntegrityVerifier {
    constructor() {
        this.mongoClient = null;
        this.db = null;
    }

    async init() {
        this.mongoClient = new MongoClient(MONGO_URL);
        await this.mongoClient.connect();
        this.db = this.mongoClient.db();
        
        console.log('🔍 VERIFICADOR DE INTEGRIDAD DE DATOS');
        console.log('===================================');
        console.log(`MongoDB: ${MONGO_URL}`);
        console.log('');
    }

    async verifyDataIntegrity() {
        console.log('📊 ANÁLISIS DE INTEGRIDAD DE DATOS');
        console.log('=================================');
        
        // 1. Obtener todos los usuarios
        const users = await this.db.collection('users').find({}).toArray();
        console.log(`Total usuarios en BD: ${users.length}`);
        
        // 2. Obtener todos los estudiantes
        const students = await this.db.collection('students').find({}).toArray();
        console.log(`Total estudiantes en BD: ${students.length}`);
        
        // 3. Filtrar usuarios estudiantes
        const studentUsers = users.filter(user => 
            user.roles && user.roles.includes('ESTUDIANTE')
        );
        console.log(`Usuarios con rol ESTUDIANTE: ${studentUsers.length}`);
        
        console.log('\\n🔗 ANÁLISIS DE VINCULACIONES:');
        console.log('============================');
        
        let integrityIssues = 0;
        let properlyLinked = 0;
        
        for (const user of studentUsers) {
            console.log(`\\n👤 Usuario: ${user.email}`);
            console.log(`   ID: ${user._id}`);
            console.log(`   StudentId en user: ${user.studentId || 'NO EXISTE'}`);
            
            // Buscar estudiante por email
            const studentByEmail = students.find(s => 
                s.email && s.email.toLowerCase() === user.email.toLowerCase()
            );
            
            // Buscar estudiante por userId
            const studentByUserId = students.find(s => 
                s.userId && s.userId.toString() === user._id.toString()
            );
            
            // Buscar estudiante por studentId en user
            const studentByUserStudentId = user.studentId ? 
                students.find(s => s._id.toString() === user.studentId.toString()) : 
                null;
            
            console.log(`   📧 Estudiante por email: ${studentByEmail ? '✅ SÍ' : '❌ NO'}`);
            console.log(`   🔗 Estudiante por userId: ${studentByUserId ? '✅ SÍ' : '❌ NO'}`);
            console.log(`   🎓 Estudiante por user.studentId: ${studentByUserStudentId ? '✅ SÍ' : '❌ NO'}`);
            
            // Análisis de integridad
            const hasEmailMatch = !!studentByEmail;
            const hasUserIdMatch = !!studentByUserId;
            const hasStudentIdMatch = !!studentByUserStudentId;
            
            if (hasEmailMatch && hasUserIdMatch && hasStudentIdMatch) {
                console.log(`   ✅ INTEGRIDAD COMPLETA`);
                properlyLinked++;
            } else {
                console.log(`   ❌ PROBLEMA DE INTEGRIDAD DETECTADO:`);
                integrityIssues++;
                
                if (!hasEmailMatch) {
                    console.log(`      - No hay estudiante con email ${user.email}`);
                }
                if (!hasUserIdMatch) {
                    console.log(`      - Estudiante no tiene userId: ${user._id}`);
                }
                if (!hasStudentIdMatch && user.studentId) {
                    console.log(`      - user.studentId ${user.studentId} no corresponde a estudiante existente`);
                }
                if (!user.studentId) {
                    console.log(`      - Usuario no tiene studentId asignado`);
                }
            }
        }
        
        console.log('\\n📊 RESUMEN DE INTEGRIDAD:');
        console.log('=========================');
        console.log(`✅ Usuarios correctamente vinculados: ${properlyLinked}`);
        console.log(`❌ Usuarios con problemas de integridad: ${integrityIssues}`);
        console.log(`📈 Porcentaje de integridad: ${((properlyLinked / studentUsers.length) * 100).toFixed(1)}%`);
        
        return {
            totalUsers: users.length,
            totalStudents: students.length,
            studentUsers: studentUsers.length,
            properlyLinked,
            integrityIssues,
            integrityPercentage: (properlyLinked / studentUsers.length) * 100
        };
    }

    async analyzeProfileEndpointFailure() {
        console.log('\\n🎯 ANÁLISIS ESPECÍFICO DEL ENDPOINT /students/profile');
        console.log('====================================================');
        
        const studentUsers = await this.db.collection('users').find({ 
            roles: { $in: ['ESTUDIANTE'] } 
        }).toArray();
        
        if (studentUsers.length === 0) {
            console.log('❌ NO HAY USUARIOS ESTUDIANTE EN LA BD');
            return;
        }
        
        console.log(`Analizando ${studentUsers.length} usuarios estudiante...\\n`);
        
        for (const user of studentUsers) {
            console.log(`🔍 Análisis para: ${user.email}`);
            
            // Simular la lógica actual del endpoint
            const studentByEmail = await this.db.collection('students').findOne({ 
                email: user.email.toLowerCase().trim() 
            });
            
            if (studentByEmail) {
                console.log(`   ✅ findByEmail(): FUNCIONARÍA - Estudiante encontrado`);
                console.log(`      ID estudiante: ${studentByEmail._id}`);
                console.log(`      Nombre: ${studentByEmail.nombres} ${studentByEmail.apellidos}`);
            } else {
                console.log(`   ❌ findByEmail(): FALLARÍA - No hay estudiante con email ${user.email}`);
                
                // Verificar si existe por userId (mi implementación de fallback)
                const studentByUserId = await this.db.collection('students').findOne({ 
                    userId: user._id 
                });
                
                if (studentByUserId) {
                    console.log(`   🔄 findByUserId(): FUNCIONARÍA COMO FALLBACK`);
                    console.log(`      ID estudiante: ${studentByUserId._id}`);
                    console.log(`      Email en estudiante: ${studentByUserId.email || 'NO DEFINIDO'}`);
                } else {
                    console.log(`   ❌ findByUserId(): TAMBIÉN FALLARÍA - No hay estudiante vinculado`);
                }
            }
            console.log('');
        }
    }

    async proposeProfessionalSolution() {
        console.log('\\n💡 SOLUCIÓN PROFESIONAL');
        console.log('=======================');
        
        const analysis = await this.verifyDataIntegrity();
        
        if (analysis.integrityPercentage === 100) {
            console.log('✅ NO SE REQUIERE CORRECCIÓN: Los datos tienen integridad completa');
            console.log('🔍 El problema del endpoint debe ser de otra naturaleza');
            return;
        }
        
        console.log('🔧 ESTRATEGIAS DE CORRECCIÓN DISPONIBLES:');
        console.log('');
        console.log('1. **CORRECCIÓN DE CÓDIGO (RECOMENDADO)**');
        console.log('   - Modificar endpoint para usar findByUserId como fallback');
        console.log('   - Mantener datos actuales, mejorar robustez del código');
        console.log('   - No requiere modificación de BD');
        console.log('');
        console.log('2. **CORRECCIÓN DE DATOS**');
        console.log('   - Sincronizar emails entre users y students');
        console.log('   - Crear registros faltantes');
        console.log('   - Riesgo de modificar datos existentes');
        console.log('');
        console.log('3. **CORRECCIÓN HÍBRIDA**');
        console.log('   - Implementar fallback en código');
        console.log('   - Corregir solo casos críticos en BD');
        console.log('   - Mejor balance entre estabilidad y funcionalidad');
    }

    async runVerification() {
        try {
            await this.init();
            await this.verifyDataIntegrity();
            await this.analyzeProfileEndpointFailure();
            await this.proposeProfessionalSolution();
            
            console.log('\\n🎯 VERIFICACIÓN COMPLETADA');
            console.log('==========================');
            console.log('✅ Análisis de integridad finalizado');
            
        } catch (error) {
            console.error('❌ ERROR EN VERIFICACIÓN:', error.message);
        } finally {
            if (this.mongoClient) {
                await this.mongoClient.close();
            }
        }
    }
}

// Ejecutar verificación
if (require.main === module) {
    const verifier = new DataIntegrityVerifier();
    verifier.runVerification()
        .then(() => {
            console.log('\\n✅ Verificación completada exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\\n❌ Error en verificación:', error.message);
            process.exit(1);
        });
}

module.exports = DataIntegrityVerifier; 