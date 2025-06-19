const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URL = 'mongodb://localhost:27017/ucn_inclui2_test';

async function quickDatabaseFix() {
    console.log('🚀 REPARACIÓN RÁPIDA DEL SISTEMA UCN INCLUI2');
    console.log('============================================\n');
    
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db();
    
    console.log('✅ Conectado a MongoDB');
    
    // 1. Verificar estado actual
    console.log('\n📊 Estado actual de la base de datos:');
    const stats = {
        users: await db.collection('users').countDocuments(),
        students: await db.collection('students').countDocuments(),
        careers: await db.collection('careers').countDocuments(),
        departments: await db.collection('departments').countDocuments()
    };
    
    console.log(`   Users: ${stats.users}`);
    console.log(`   Students: ${stats.students}`);
    console.log(`   Careers: ${stats.careers}`);
    console.log(`   Departments: ${stats.departments}`);
    
    // 2. Crear datos mínimos si no existen
    if (stats.departments === 0) {
        console.log('\n🏢 Creando departamento...');
        await db.collection('departments').insertOne({
            _id: new ObjectId(),
            code: 'ING',
            name: 'Ingeniería',
            faculty: 'Facultad de Ingeniería',
            campus: 'Antofagasta',
            currentSemester: '2025-1',
            isActive: true,
            createdAt: new Date()
        });
        console.log('   ✅ Departamento creado');
    }
    
    if (stats.careers === 0) {
        console.log('\n🎓 Creando carrera...');
        const dept = await db.collection('departments').findOne({});
        await db.collection('careers').insertOne({
            _id: new ObjectId(),
            codigo: 'ICI',
            nombre: 'Ingeniería Civil en Informática',
            facultad: 'Facultad de Ingeniería',
            semestre: '2025-1',
            departmentId: dept._id,
            studentIds: [],
            isActive: true,
            createdAt: new Date()
        });
        console.log('   ✅ Carrera creada');
    }
    
    // 3. Verificar/crear usuario estudiante
    let studentUser = await db.collection('users').findOne({ 
        email: 'estudiante.test@alumnos.ucn.cl' 
    });
    
    if (!studentUser) {
        console.log('\n👤 Creando usuario estudiante...');
        const bcrypt = require('bcrypt');
        const password_hash = await bcrypt.hash('Test123!', 10);
        
        const result = await db.collection('users').insertOne({
            _id: new ObjectId(),
            email: 'estudiante.test@alumnos.ucn.cl',
            nombreCompleto: 'Estudiante Test NEE',
            roles: ['ESTUDIANTE'],
            isActive: true,
            isProfileComplete: true,
            password_hash: password_hash,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        studentUser = await db.collection('users').findOne({ _id: result.insertedId });
        console.log('   ✅ Usuario estudiante creado');
    } else {
        console.log('\n👤 Usuario estudiante ya existe');
    }
    
    // 4. Verificar/crear perfil de estudiante
    let studentProfile = await db.collection('students').findOne({ 
        email: studentUser.email.toLowerCase() 
    });
    
    if (!studentProfile) {
        console.log('\n🎓 Creando perfil de estudiante...');
        const career = await db.collection('careers').findOne({});
        
        const result = await db.collection('students').insertOne({
            _id: new ObjectId(),
            nombres: 'Estudiante Test',
            apellidos: 'NEE Prueba',
            email: studentUser.email.toLowerCase(),
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
                supportLevel: 'moderado'
            },
            isActive: true,
            userId: studentUser._id,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        // Actualizar usuario con referencia al estudiante
        await db.collection('users').updateOne(
            { _id: studentUser._id },
            { $set: { studentId: result.insertedId } }
        );
        
        console.log('   ✅ Perfil de estudiante creado y vinculado');
    } else {
        console.log('\n🎓 Perfil de estudiante ya existe');
    }
    
    // 5. Verificar correlación final
    console.log('\n🔗 Verificación final de datos:');
    const finalUser = await db.collection('users').findOne({ email: 'estudiante.test@alumnos.ucn.cl' });
    const finalStudent = await db.collection('students').findOne({ email: 'estudiante.test@alumnos.ucn.cl' });
    
    console.log(`   Usuario: ${finalUser ? '✅ Existe' : '❌ No existe'}`);
    console.log(`   Estudiante: ${finalStudent ? '✅ Existe' : '❌ No existe'}`);
    console.log(`   Vinculación: ${finalUser?.studentId ? '✅ Vinculado' : '❌ No vinculado'}`);
    
    // 6. Estadísticas finales
    console.log('\n📈 Estado final de la base de datos:');
    const finalStats = {
        users: await db.collection('users').countDocuments(),
        students: await db.collection('students').countDocuments(),
        careers: await db.collection('careers').countDocuments(),
        departments: await db.collection('departments').countDocuments(),
        studentUsers: await db.collection('users').countDocuments({ roles: 'ESTUDIANTE' })
    };
    
    console.log(`   Total usuarios: ${finalStats.users}`);
    console.log(`   Usuarios estudiantes: ${finalStats.studentUsers}`);
    console.log(`   Perfiles de estudiantes: ${finalStats.students}`);
    console.log(`   Carreras disponibles: ${finalStats.careers}`);
    console.log(`   Departamentos: ${finalStats.departments}`);
    
    await client.close();
    
    console.log('\n✅ REPARACIÓN COMPLETADA');
    console.log('========================');
    console.log('La base de datos está lista para testing.');
    console.log('Ahora puedes iniciar el servidor y probar los endpoints.');
    console.log('\nPróximos pasos:');
    console.log('1. cd backend-ucn-inclui2 && npm run start:dev');
    console.log('2. node test-endpoints.js');
    
    return true;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    quickDatabaseFix()
        .then(() => {
            console.log('\n🎯 Proceso completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Error en el proceso:', error.message);
            process.exit(1);
        });
}

module.exports = { quickDatabaseFix }; 