const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URL = 'mongodb://localhost:27017/ucn_inclui2_test';

/**
 * CORRECCIÓN PROFESIONAL DE INTEGRIDAD DE DATOS
 * Repara la vinculación userId faltante manteniendo la lógica original
 */

class DataIntegrityFixer {
    constructor() {
        this.mongoClient = null;
        this.db = null;
    }

    async init() {
        this.mongoClient = new MongoClient(MONGO_URL);
        await this.mongoClient.connect();
        this.db = this.mongoClient.db();
        
        console.log('🔧 CORRECTOR DE INTEGRIDAD DE DATOS');
        console.log('==================================');
        console.log(`MongoDB: ${MONGO_URL}`);
        console.log('');
    }

    async fixDataIntegrity() {
        console.log('🛠️  REPARANDO INTEGRIDAD DE DATOS');
        console.log('=================================');
        
        // Obtener usuarios estudiante con problemas
        const users = await this.db.collection('users').find({ 
            roles: { $in: ['ESTUDIANTE'] } 
        }).toArray();
        
        let fixed = 0;
        let alreadyCorrect = 0;
        let errors = 0;
        
        for (const user of users) {
            console.log(`\\n🔍 Procesando: ${user.email}`);
            
            try {
                // Buscar estudiante por email
                const studentByEmail = await this.db.collection('students').findOne({ 
                    email: user.email.toLowerCase().trim() 
                });
                
                if (!studentByEmail) {
                    console.log(`   ❌ No hay estudiante con email ${user.email} - SKIP`);
                    errors++;
                    continue;
                }
                
                // Verificar si ya tiene userId correcto
                const hasCorrectUserId = studentByEmail.userId && 
                    studentByEmail.userId.toString() === user._id.toString();
                
                if (hasCorrectUserId) {
                    console.log(`   ✅ Ya tiene integridad correcta`);
                    alreadyCorrect++;
                    continue;
                }
                
                // REPARAR: Agregar userId al estudiante
                console.log(`   🔧 REPARANDO: Agregando userId al estudiante`);
                console.log(`      User ID: ${user._id}`);
                console.log(`      Student ID: ${studentByEmail._id}`);
                
                const updateResult = await this.db.collection('students').updateOne(
                    { _id: studentByEmail._id },
                    { 
                        $set: { 
                            userId: new ObjectId(user._id),
                            updatedAt: new Date()
                        } 
                    }
                );
                
                if (updateResult.modifiedCount === 1) {
                    console.log(`   ✅ REPARADO: userId agregado correctamente`);
                    fixed++;
                } else {
                    console.log(`   ❌ ERROR: No se pudo actualizar el estudiante`);
                    errors++;
                }
                
            } catch (error) {
                console.log(`   ❌ ERROR: ${error.message}`);
                errors++;
            }
        }
        
        console.log('\\n📊 RESUMEN DE REPARACIÓN:');
        console.log('========================');
        console.log(`🔧 Registros reparados: ${fixed}`);
        console.log(`✅ Ya correctos: ${alreadyCorrect}`);
        console.log(`❌ Errores: ${errors}`);
        console.log(`📈 Total procesados: ${users.length}`);
        
        return { fixed, alreadyCorrect, errors, total: users.length };
    }

    async verifyFix() {
        console.log('\\n🧪 VERIFICACIÓN POST-REPARACIÓN');
        console.log('==============================');
        
        const users = await this.db.collection('users').find({ 
            roles: { $in: ['ESTUDIANTE'] } 
        }).toArray();
        
        let allFixed = true;
        
        for (const user of users) {
            console.log(`\\n🔍 Verificando: ${user.email}`);
            
            // Simular endpoint /students/profile con la lógica original
            const student = await this.db.collection('students').findOne({ 
                email: user.email.toLowerCase().trim() 
            });
            
            if (student) {
                console.log(`   ✅ findByEmail(): FUNCIONARÍA CORRECTAMENTE`);
                console.log(`      Estudiante: ${student.nombres} ${student.apellidos}`);
                console.log(`      UserId en estudiante: ${student.userId || 'NO DEFINIDO'}`);
                
                // Verificar integridad bidireccional
                const hasUserId = student.userId && 
                    student.userId.toString() === user._id.toString();
                const hasStudentId = user.studentId && 
                    user.studentId.toString() === student._id.toString();
                
                if (hasUserId && hasStudentId) {
                    console.log(`   ✅ INTEGRIDAD BIDIRECCIONAL PERFECTA`);
                } else {
                    console.log(`   ⚠️  INTEGRIDAD PARCIAL:`);
                    console.log(`      - Usuario → Estudiante: ${hasUserId ? '✅' : '❌'}`);
                    console.log(`      - Estudiante → Usuario: ${hasStudentId ? '✅' : '❌'}`);
                    allFixed = false;
                }
            } else {
                console.log(`   ❌ findByEmail(): AÚN FALLARÍA`);
                allFixed = false;
            }
        }
        
        console.log('\\n🎯 RESULTADO FINAL:');
        console.log('==================');
        if (allFixed) {
            console.log('✅ ENDPOINT /students/profile AHORA FUNCIONARÁ CORRECTAMENTE');
            console.log('✅ Todos los usuarios estudiante pueden acceder a su perfil');
        } else {
            console.log('⚠️  AÚN HAY PROBLEMAS QUE REQUIEREN ATENCIÓN MANUAL');
        }
        
        return allFixed;
    }

    async runFix() {
        try {
            await this.init();
            
            const results = await this.fixDataIntegrity();
            const isFullyFixed = await this.verifyFix();
            
            console.log('\\n🎯 REPARACIÓN COMPLETADA');
            console.log('========================');
            
            if (isFullyFixed) {
                console.log('✅ ÉXITO: El endpoint /students/profile ahora funcionará');
                console.log('✅ La integridad de datos ha sido restaurada');
                console.log('🔄 RECOMENDACIÓN: Reiniciar el servidor y probar el endpoint');
            } else {
                console.log('⚠️  ATENCIÓN: Se requiere revisión manual adicional');
            }
            
        } catch (error) {
            console.error('❌ ERROR EN REPARACIÓN:', error.message);
        } finally {
            if (this.mongoClient) {
                await this.mongoClient.close();
            }
        }
    }
}

// Ejecutar reparación
if (require.main === module) {
    const fixer = new DataIntegrityFixer();
    fixer.runFix()
        .then(() => {
            console.log('\\n✅ Reparación completada exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\\n❌ Error en reparación:', error.message);
            process.exit(1);
        });
}

module.exports = DataIntegrityFixer; 