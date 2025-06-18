// Script de migración para actualizar consentimientos al nuevo esquema
// Ejecutar con: node scripts/migrate-consents.js

const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://admin:secure_password_123@localhost:27017/ucn_inclui2_prod?authSource=admin';

async function migrateConsents() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    const db = client.db('ucn_inclui2_prod');
    
    console.log('🔄 Iniciando migración de consentimientos...');
    
    // 1. Obtener consentimientos existentes
    const oldConsents = await db.collection('consents').find({}).toArray();
    console.log(`📋 Encontrados ${oldConsents.length} consentimientos para migrar`);
    
    // 2. Obtener estudiantes para mapear datos
    const students = await db.collection('students').find({}).toArray();
    const studentMap = new Map(students.map(s => [s._id.toString(), s]));
    
    // 3. Obtener carreras para nombres
    const careers = await db.collection('careers').find({}).toArray();
    const careerMap = new Map(careers.map(c => [c._id.toString(), c]));
    
    // 4. Migrar cada consentimiento
    const migratedConsents = [];
    
    for (const oldConsent of oldConsents) {
      const student = studentMap.get(oldConsent.studentId.toString());
      if (!student) {
        console.warn(`⚠️ Estudiante no encontrado para consentimiento ${oldConsent._id}`);
        continue;
      }
      
      const career = careerMap.get(student.carreraId?.toString()) || { name: 'Carrera no especificada' };
      
      const newConsent = {
        _id: oldConsent._id,
        studentId: oldConsent.studentId,
        allowsDataSharing: oldConsent.isGranted || oldConsent.isConsentGiven || false,
        consentDate: oldConsent.grantedAt || oldConsent.consentDate || new Date(),
        studentRut: student.rut || 'N/A',
        studentName: `${student.nombres || ''} ${student.apellidos || ''}`.trim() || 'Nombre no disponible',
        studentCareer: career.name,
        comments: oldConsent.description || oldConsent.comments || null,
        registeredBy: oldConsent.registeredBy || student.userId || oldConsent.studentId,
        ipAddress: oldConsent.ipAddress || null,
        userAgent: oldConsent.userAgent || null,
        isActive: true,
        // Mantener campos de revocación si existen
        revokedAt: oldConsent.revokedAt || null,
        revocationReason: oldConsent.revocationReason || null,
        createdAt: oldConsent.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      migratedConsents.push(newConsent);
    }
    
    // 5. Reemplazar colección
    if (migratedConsents.length > 0) {
      await db.collection('consents').deleteMany({});
      await db.collection('consents').insertMany(migratedConsents);
      console.log(`✅ ${migratedConsents.length} consentimientos migrados exitosamente`);
    } else {
      console.log('⚠️ No se encontraron consentimientos para migrar');
    }
    
    // 6. Verificar migración
    const newCount = await db.collection('consents').countDocuments({});
    console.log(`📊 Total de consentimientos después de migración: ${newCount}`);
    
    // 7. Mostrar estadísticas
    const withConsent = await db.collection('consents').countDocuments({ allowsDataSharing: true });
    const withoutConsent = await db.collection('consents').countDocuments({ allowsDataSharing: false });
    
    console.log(`📈 Estadísticas finales:`);
    console.log(`   - Con autorización: ${withConsent}`);
    console.log(`   - Sin autorización: ${withoutConsent}`);
    console.log(`   - Total: ${newCount}`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔚 Migración completada');
  }
}

if (require.main === module) {
  migrateConsents();
}

module.exports = { migrateConsents }; 