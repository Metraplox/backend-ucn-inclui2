// 🎯 Datos Adicionales para Testing Completo
// Ajustes, notificaciones, recursos y otros elementos

print('🚀 Agregando datos adicionales para testing completo...');

db = db.getSiblingDB('ucn_inclui2_prod');

// Obtener IDs existentes para referencias
const estudiante1 = db.students.findOne({email: 'estudiante1@ucn.cl'});
const estudiante2 = db.students.findOne({email: 'estudiante2@ucn.cl'});
const curso1 = db.courses.findOne({code: 'INFO101'});
const curso2 = db.courses.findOne({code: 'MATE201'});
const educadora = db.users.findOne({email: 'educadora@ucn.cl'});
const diddec = db.users.findOne({email: 'diddec@ucn.cl'});
const docente = db.users.findOne({email: 'docente1@ucn.cl'});

print('📚 Obteniendo referencias existentes...');

if (!estudiante1 || !estudiante2 || !curso1 || !curso2) {
  print('❌ Error: No se encontraron datos básicos. Ejecutar primero 04-simple-test-data.js');
  exit(1);
}

print('✅ Referencias obtenidas correctamente');

// 1. AJUSTES ACADÉMICOS
print('⚙️ Creando ajustes académicos...');
try {
  // Ajuste para estudiante 1 - TDAH
  db.adjustments.insertOne({
    _id: ObjectId('655000000000000000000001'),
    studentId: estudiante1._id,
    courseId: curso1._id,
    categoryId: ObjectId('507f1f77bcf86cd799439011'), // Tiempo Extendido
    adjustmentType: 'evaluacion',
    description: 'Tiempo adicional del 50% para evaluaciones debido a TDAH',
    specificDetails: 'Otorgar 1.5 veces el tiempo normal para pruebas y exámenes',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-07-31'),
    isActive: true,
    approvedBy: educadora._id,
    approvalDate: new Date('2025-02-25'),
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Ajuste para estudiante 2 - Dislexia
  db.adjustments.insertOne({
    _id: ObjectId('655000000000000000000002'),
    studentId: estudiante2._id,
    courseId: curso2._id,
    categoryId: ObjectId('507f1f77bcf86cd799439012'), // Apoyo Visual
    adjustmentType: 'material',
    description: 'Material con apoyo visual para dislexia',
    specificDetails: 'Textos con fuente especial, mayor espaciado y apoyo gráfico',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-07-31'),
    isActive: true,
    approvedBy: educadora._id,
    approvalDate: new Date('2025-02-28'),
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  print('✅ 2 ajustes académicos creados');
} catch (e) {
  print('❌ Error en ajustes: ' + e);
}

// 2. RECURSOS EDUCATIVOS
print('📖 Creando recursos educativos...');
try {
  db.resources.insertOne({
    _id: ObjectId('656000000000000000000001'),
    title: 'Guía de Programación para TDAH',
    description: 'Material didáctico adaptado para estudiantes con déficit atencional',
    type: 'documento',
    category: 'guia_didactica',
    adjustmentTypeIds: [ObjectId('507f1f77bcf86cd799439011')],
    filePath: '/resources/guia-programacion-tdah.pdf',
    fileSize: 2048576,
    mimeType: 'application/pdf',
    uploadedBy: diddec._id,
    isActive: true,
    downloadCount: 15,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  db.resources.insertOne({
    _id: ObjectId('656000000000000000000002'),
    title: 'Herramientas de Apoyo Visual',
    description: 'Conjunto de herramientas para estudiantes con dislexia',
    type: 'software',
    category: 'herramienta_tecnologica',
    adjustmentTypeIds: [ObjectId('507f1f77bcf86cd799439012')],
    filePath: '/resources/apoyo-visual-tools.zip',
    fileSize: 15728640,
    mimeType: 'application/zip',
    uploadedBy: diddec._id,
    isActive: true,
    downloadCount: 8,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  print('✅ 2 recursos educativos creados');
} catch (e) {
  print('❌ Error en recursos: ' + e);
}

// 3. NOTIFICACIONES
print('🔔 Creando notificaciones...');
try {
  // Notificación para estudiante 1
  db.notifications.insertOne({
    _id: ObjectId('658000000000000000000001'),
    userId: db.users.findOne({email: 'estudiante1@ucn.cl'})._id,
    type: 'adjustment_approved',
    title: 'Ajuste Académico Aprobado',
    message: 'Tu ajuste de tiempo extendido para INFO101 ha sido aprobado',
    isRead: false,
    priority: 'medium',
    relatedEntityType: 'adjustment',
    relatedEntityId: ObjectId('655000000000000000000001'),
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Notificación para docente
  db.notifications.insertOne({
    _id: ObjectId('658000000000000000000002'),
    userId: docente._id,
    type: 'new_student_assignment',
    title: 'Nuevo Estudiante con NEE Asignado',
    message: 'Se ha asignado un estudiante con TDAH a tu curso INFO101',
    isRead: false,
    priority: 'high',
    relatedEntityType: 'student',
    relatedEntityId: estudiante1._id,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Notificación para estudiante 2
  db.notifications.insertOne({
    _id: ObjectId('658000000000000000000003'),
    userId: db.users.findOne({email: 'estudiante2@ucn.cl'})._id,
    type: 'resource_available',
    title: 'Nuevo Recurso Disponible',
    message: 'Se ha agregado una nueva herramienta de apoyo visual',
    isRead: true,
    priority: 'low',
    relatedEntityType: 'resource',
    relatedEntityId: ObjectId('656000000000000000000002'),
    readAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  print('✅ 3 notificaciones creadas');
} catch (e) {
  print('❌ Error en notificaciones: ' + e);
}

// 4. CONSENTIMIENTOS
print('📝 Creando consentimientos...');
try {
  db.consents.insertOne({
    _id: ObjectId('657000000000000000000001'),
    studentId: estudiante1._id,
    allowsDataSharing: true,
    consentDate: new Date('2025-01-15'),
    studentRut: '20.123.456-7',
    studentName: 'Juan Carlos Pérez González',
    studentCareer: 'Ingeniería en Sistemas Computacionales',
    comments: 'Autorizo compartir mi información para recibir mejor apoyo académico',
    registeredBy: estudiante1._id,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    isActive: true,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  });
  
  db.consents.insertOne({
    _id: ObjectId('657000000000000000000002'),
    studentId: estudiante2._id,
    allowsDataSharing: false,
    consentDate: new Date('2025-01-20'),
    studentRut: '19.987.654-3',
    studentName: 'María José Rodríguez Fernández',
    studentCareer: 'Psicología', 
    comments: 'Prefiero mantener mi información médica privada',
    registeredBy: estudiante2._id,
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    isActive: true,
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-20')
  });
  
  print('✅ 2 consentimientos creados');
} catch (e) {
  print('❌ Error en consentimientos: ' + e);
}

// 5. HISTORIAL ACADÉMICO
print('📊 Creando historial académico...');
try {
  db.academichistories.insertOne({
    _id: ObjectId('659000000000000000000001'),
    studentId: estudiante1._id,
    courseId: curso1._id,
    academicPeriod: '2024-2',
    grade: 6.2,
    status: 'aprobado',
    attempts: 1,
    hasAdjustments: true,
    adjustmentDetails: 'Tiempo extendido aplicado en todas las evaluaciones',
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-15')
  });
  
  db.academichistories.insertOne({
    _id: ObjectId('659000000000000000000002'),
    studentId: estudiante2._id,
    courseId: curso2._id,
    academicPeriod: '2024-2',
    grade: 5.8,
    status: 'aprobado',
    attempts: 1,
    hasAdjustments: true,
    adjustmentDetails: 'Material con apoyo visual utilizado',
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date('2024-12-20')
  });
  
  print('✅ 2 registros de historial académico creados');
} catch (e) {
  print('❌ Error en historial académico: ' + e);
}

// 6. INSCRIPCIONES (ENROLLMENTS)
print('📝 Creando inscripciones...');
try {
  db.enrollments.insertOne({
    _id: ObjectId('660000000000000000000001'),
    studentId: estudiante1._id,
    courseId: curso1._id,
    academicPeriod: '2025-1',
    enrollmentDate: new Date('2025-02-01'),
    status: 'enrolled',
    hasSpecialNeeds: true,
    adjustmentsApplied: ['tiempo_extendido'],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  db.enrollments.insertOne({
    _id: ObjectId('660000000000000000000002'),
    studentId: estudiante2._id,
    courseId: curso2._id,
    academicPeriod: '2025-1',
    enrollmentDate: new Date('2025-02-01'),
    status: 'enrolled',
    hasSpecialNeeds: true,
    adjustmentsApplied: ['apoyo_visual'],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  print('✅ 2 inscripciones creadas');
} catch (e) {
  print('❌ Error en inscripciones: ' + e);
}

print('🎉 ¡Datos adicionales completados exitosamente!');
print('');
print('📊 RESUMEN DE DATOS ADICIONALES CREADOS:');
print('- 2 Ajustes académicos');
print('- 2 Recursos educativos');
print('- 3 Notificaciones');
print('- 2 Consentimientos');
print('- 2 Registros de historial académico');
print('- 2 Inscripciones');
print('');
print('✅ Base de datos completamente preparada para testing de todos los endpoints'); 