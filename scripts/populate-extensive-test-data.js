const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

// 🔧 CONFIGURACIÓN PROFESIONAL PARA TESTING EXTENSO
const CONFIG = {
  mongodb: {
    uri: 'mongodb://localhost:27017',
    database: 'ucn_inclui2_test'
  },
  semester: {
    current: '202510',
    previous: '202502',
    next: '202520'
  },
  testing: {
    totalStudents: 150,      // Más estudiantes para testing robusto
    totalCourses: 45,        // Más cursos realistas 
    totalAdjustments: 85,    // Más ajustes académicos
    totalDocuments: 120,     // Más documentos asociados
    totalNotifications: 200  // Más notificaciones para testing
  }
};

// 🏛️ DATOS REALISTAS UCN - CARRERAS COMPLETAS
const CARRERAS_UCN = [
  { name: 'Ingeniería Civil en Computación e Informática', code: 'ICCI', duration: 12, faculty: 'Ingeniería', campus: 'Antofagasta' },
  { name: 'Ingeniería Civil Industrial', code: 'ICI', duration: 11, faculty: 'Ingeniería', campus: 'Antofagasta' },
  { name: 'Ingeniería en Información y Control de Gestión', code: 'IICG', duration: 10, faculty: 'Ingeniería', campus: 'Antofagasta' },
  { name: 'Ingeniería Civil en Minas', code: 'ICM', duration: 12, faculty: 'Ingeniería', campus: 'Antofagasta' },
  { name: 'Ingeniería Civil Metalúrgica', code: 'ICMET', duration: 12, faculty: 'Ingeniería', campus: 'Antofagasta' },
  { name: 'Ingeniería en Alimentos', code: 'IA', duration: 10, faculty: 'Ciencias del Mar', campus: 'Coquimbo' },
  { name: 'Medicina Veterinaria', code: 'MV', duration: 12, faculty: 'Medicina Veterinaria', campus: 'Coquimbo' },
  { name: 'Derecho', code: 'DER', duration: 10, faculty: 'Ciencias Jurídicas', campus: 'Antofagasta' }
];

// 🏢 DEPARTAMENTOS ACADÉMICOS REALISTAS
const DEPARTAMENTOS_UCN = [
  { 
    name: 'Departamento de Ingeniería de Sistemas y Computación', 
    code: 'DISC', 
    faculty: 'Ingeniería', 
    campus: 'Antofagasta',
    head: null // Se asignará después
  },
  { 
    name: 'Departamento de Ingeniería Industrial', 
    code: 'DII', 
    faculty: 'Ingeniería', 
    campus: 'Antofagasta',
    head: null
  },
  { 
    name: 'Departamento de Ingeniería en Minas', 
    code: 'DIM', 
    faculty: 'Ingeniería', 
    campus: 'Antofagasta',
    head: null
  },
  { 
    name: 'Departamento de Ciencias Básicas', 
    code: 'DCB', 
    faculty: 'Ingeniería', 
    campus: 'Antofagasta',
    head: null
  }
];

// 📚 CURSOS REALES UCN POR SEMESTRE
const CURSOS_REALES = [
  // Primer año común
  { asignatura: 'Matemática I', codigo: 'MAT101', nrc: 'MAT101-1', paralelo: '1', periodo: '202510', sede: 'Antofagasta', departamento: 'DCB' },
  { asignatura: 'Matemática I', codigo: 'MAT101', nrc: 'MAT101-2', paralelo: '2', periodo: '202510', sede: 'Antofagasta', departamento: 'DCB' },
  { asignatura: 'Física I', codigo: 'FIS110', nrc: 'FIS110-1', paralelo: '1', periodo: '202510', sede: 'Antofagasta', departamento: 'DCB' },
  { asignatura: 'Química General', codigo: 'QUI100', nrc: 'QUI100-1', paralelo: '1', periodo: '202510', sede: 'Antofagasta', departamento: 'DCB' },
  { asignatura: 'Introducción a la Ingeniería', codigo: 'ING100', nrc: 'ING100-1', paralelo: '1', periodo: '202510', sede: 'Antofagasta', departamento: 'DISC' },
  
  // Segundo año común
  { asignatura: 'Matemática II', codigo: 'MAT102', nrc: 'MAT102-1', paralelo: '1', periodo: '202510', sede: 'Antofagasta', departamento: 'DCB' },
  { asignatura: 'Física II', codigo: 'FIS120', nrc: 'FIS120-1', paralelo: '1', periodo: '202510', sede: 'Antofagasta', departamento: 'DCB' },
  { asignatura: 'Programación I', codigo: 'INF100', nrc: 'INF100-1', paralelo: '1', periodo: '202510', sede: 'Antofagasta', departamento: 'DISC' },
  { asignatura: 'Programación I', codigo: 'INF100', nrc: 'INF100-2', paralelo: '2', periodo: '202510', sede: 'Antofagasta', departamento: 'DISC' },
  
  // Especialización ICCI
  { asignatura: 'Estructura de Datos', codigo: 'INF134', nrc: 'INF134-1', paralelo: '1', periodo: '202510', sede: 'Antofagasta', departamento: 'DISC' },
  { asignatura: 'Algoritmos y Complejidad', codigo: 'INF135', nrc: 'INF135-1', paralelo: '1', periodo: '202510', sede: 'Antofagasta', departamento: 'DISC' },
  { asignatura: 'Base de Datos', codigo: 'INF225', nrc: 'INF225-1', paralelo: '1', periodo: '202510', sede: 'Antofagasta', departamento: 'DISC' },
  { asignatura: 'Ingeniería de Software', codigo: 'INF236', nrc: 'INF236-1', paralelo: '1', periodo: '202510', sede: 'Antofagasta', departamento: 'DISC' },
  { asignatura: 'Sistemas Operativos', codigo: 'INF246', nrc: 'INF246-1', paralelo: '1', periodo: '202510', sede: 'Antofagasta', departamento: 'DISC' },
  
  // Especialización ICI
  { asignatura: 'Investigación Operativa I', codigo: 'ICI201', nrc: 'ICI201-1', paralelo: '1', periodo: '202510', sede: 'Antofagasta', departamento: 'DII' },
  { asignatura: 'Estadística', codigo: 'EST220', nrc: 'EST220-1', paralelo: '1', periodo: '202510', sede: 'Antofagasta', departamento: 'DII' },
  { asignatura: 'Gestión de Operaciones', codigo: 'ICI301', nrc: 'ICI301-1', paralelo: '1', periodo: '202510', sede: 'Antofagasta', departamento: 'DII' },
  
  // Cursos avanzados
  { asignatura: 'Tesis de Grado', codigo: 'TES500', nrc: 'TES500-1', paralelo: '1', periodo: '202510', sede: 'Antofagasta', departamento: 'DISC' },
  { asignatura: 'Práctica Profesional', codigo: 'PRA450', nrc: 'PRA450-1', paralelo: '1', periodo: '202510', sede: 'Antofagasta', departamento: 'DISC' }
];

// 👥 USUARIOS REALISTAS DEL SISTEMA
const USUARIOS_SISTEMA = [
  // Staff administrativo
  { email: 'coordinadora.inclusion@ucn.cl', nombreCompleto: 'María Elena González Soto', roles: ['COORDINADOR'], department: 'DISC' },
  { email: 'educadora.social@ucn.cl', nombreCompleto: 'Ana Patricia Ramírez López', roles: ['EDUCADORA_SOCIAL'], department: 'DISC' },
  { email: 'director.diddec@ucn.cl', nombreCompleto: 'Dr. Carlos Roberto Fernández', roles: ['DIDDEC_STAFF'], department: null },
  
  // Jefes de departamento
  { email: 'jefe.disc@ucn.cl', nombreCompleto: 'Dr. Fernando Silva Morales', roles: ['JEFE_DEPARTAMENTO'], department: 'DISC' },
  { email: 'jefe.dii@ucn.cl', nombreCompleto: 'Dra. Carmen López Herrera', roles: ['JEFE_DEPARTAMENTO'], department: 'DII' },
  { email: 'jefe.dim@ucn.cl', nombreCompleto: 'Dr. Ricardo Paz Olvera', roles: ['JEFE_DEPARTAMENTO'], department: 'DIM' },
  
  // Jefes de carrera
  { email: 'jefe.icci@ucn.cl', nombreCompleto: 'Dr. Miguel Ángel Torres', roles: ['JEFE_CARRERA'], career: 'ICCI' },
  { email: 'jefe.ici@ucn.cl', nombreCompleto: 'Dra. Rosa María Campos', roles: ['JEFE_CARRERA'], career: 'ICI' },
  
  // Docentes por departamento
  { email: 'profesor.mat101@ucn.cl', nombreCompleto: 'Dr. Juan Carlos Mendoza', roles: ['DOCENTE'], department: 'DCB', courses: ['MAT101-1', 'MAT101-2'] },
  { email: 'profesor.fis110@ucn.cl', nombreCompleto: 'Dra. Patricia Vega Ruiz', roles: ['DOCENTE'], department: 'DCB', courses: ['FIS110-1'] },
  { email: 'profesor.inf100@ucn.cl', nombreCompleto: 'MSc. Roberto Silva Castro', roles: ['DOCENTE'], department: 'DISC', courses: ['INF100-1', 'INF100-2'] },
  { email: 'profesor.inf134@ucn.cl', nombreCompleto: 'Dr. Andrea Morales Díaz', roles: ['DOCENTE'], department: 'DISC', courses: ['INF134-1'] },
  { email: 'profesor.inf225@ucn.cl', nombreCompleto: 'MSc. Luis Fernando Rojas', roles: ['DOCENTE'], department: 'DISC', courses: ['INF225-1'] },
  { email: 'profesor.ici201@ucn.cl', nombreCompleto: 'Dr. Carmen Isabel Flores', roles: ['DOCENTE'], department: 'DII', courses: ['ICI201-1'] }
];

// 📂 TIPOS DE DOCUMENTOS REALISTAS
const TIPOS_DOCUMENTOS = [
  'Certificado Médico Especialista',
  'Informe Psicopedagógico',
  'Evaluación Neuropsicológica',
  'Certificado de Discapacidad COMPIN',
  'Informe Fonoaudiológico',
  'Evaluación Psiquiátrica',
  'Certificado Oftalmológico',
  'Informe Terapia Ocupacional',
  'Evaluación Psicológica Clínica'
];

// 🔧 TIPOS DE AJUSTES ACADÉMICOS REALES
const TIPOS_AJUSTES = [
  { name: 'Tiempo Adicional en Evaluaciones', description: '50% tiempo adicional en pruebas y exámenes' },
  { name: 'Sala Separada para Evaluaciones', description: 'Ambiente controlado y sin distracciones' },
  { name: 'Evaluación Oral Complementaria', description: 'Posibilidad de complementar evaluaciones escritas con orales' },
  { name: 'Material de Apoyo Permitido', description: 'Uso de calculadora, formularios o material de consulta' },
  { name: 'Flexibilidad en Entrega de Trabajos', description: 'Extensión de plazos para entrega de trabajos' },
  { name: 'Asiento Preferencial', description: 'Ubicación privilegiada en sala de clases' },
  { name: 'Formato de Evaluación Adaptado', description: 'Letra más grande, espacios amplios, formato digital' },
  { name: 'Apoyo de Intérprete LSCh', description: 'Intérprete de Lengua de Señas Chilena' },
  { name: 'Material en Braille', description: 'Documentos y evaluaciones en sistema Braille' },
  { name: 'Software de Apoyo', description: 'Lectores de pantalla u otros softwares adaptativos' }
];

// 🔔 TIPOS DE NOTIFICACIONES DEL SISTEMA
const TIPOS_NOTIFICACIONES = ['AJUSTE_APROBADO', 'AJUSTE_RECHAZADO', 'DOCUMENTO_PENDIENTE', 'CONFIRMACION_SEMESTRAL', 'NUEVA_EVALUACION', 'SISTEMA'];

let client;

async function conectarBD() {
  try {
    client = new MongoClient(CONFIG.mongodb.uri);
    await client.connect();
    console.log('✅ Conectado a MongoDB para testing extenso');
    return client.db(CONFIG.mongodb.database);
  } catch (error) {
    console.error('❌ Error conectando a BD:', error);
    throw error;
  }
}

// 🏗️ FUNCIÓN PRINCIPAL DE POBLADO EXTENSO
async function poblarDatosExtensivos() {
  const db = await conectarBD();
  
  console.log('\n🚀 INICIANDO POBLADO EXTENSIVO PARA TESTING');
  console.log('==============================================');

  try {
    // 1️⃣ Poblar departamentos y obtener IDs
    console.log('\n📍 1. Poblando departamentos...');
    const departmentIds = await poblarDepartamentos(db);
    
    // 2️⃣ Poblar carreras y obtener IDs
    console.log('\n🎓 2. Poblando carreras...');
    const careerIds = await poblarCarreras(db, departmentIds);
    
    // 3️⃣ Poblar categorías de ajustes
    console.log('\n📂 3. Poblando categorías de ajustes...');
    const categoryIds = await poblarCategorias(db);
    
    // 4️⃣ Poblar usuarios del sistema
    console.log('\n👥 4. Poblando usuarios del sistema...');
    const userIds = await poblarUsuarios(db, departmentIds, careerIds);
    
    // 5️⃣ Poblar cursos realistas
    console.log('\n📚 5. Poblando cursos...');
    const courseIds = await poblarCursos(db, userIds);
    
    // 6️⃣ Poblar estudiantes extensivos (150 estudiantes)
    console.log('\n🎓 6. Poblando estudiantes extensivos...');
    const studentIds = await poblarEstudiantesExtensivos(db, careerIds);
    
    // 7️⃣ Poblar inscripciones estudiantiles
    console.log('\n📝 7. Poblando inscripciones...');
    await poblarInscripciones(db, studentIds, courseIds);
    
    // 8️⃣ Poblar documentos realistas
    console.log('\n📄 8. Poblando documentos...');
    const documentIds = await poblarDocumentos(db, studentIds, userIds);
    
    // 9️⃣ Poblar consentimientos
    console.log('\n📋 9. Poblando consentimientos...');
    await poblarConsentimientos(db, studentIds);
    
    // 🔟 Poblar ajustes académicos extensivos
    console.log('\n⚙️ 10. Poblando ajustes académicos...');
    const adjustmentIds = await poblarAjustesAcademicos(db, studentIds, categoryIds, courseIds, userIds, documentIds);
    
    // 1️⃣1️⃣ Poblar notificaciones realistas
    console.log('\n🔔 11. Poblando notificaciones...');
    await poblarNotificaciones(db, userIds, studentIds, adjustmentIds);
    
    // 1️⃣2️⃣ Poblar recursos educativos
    console.log('\n📚 12. Poblando recursos educativos...');
    await poblarRecursos(db, userIds, categoryIds);
    
    // 1️⃣3️⃣ Generar estadísticas finales
    console.log('\n📊 13. Generando estadísticas finales...');
    await generarEstadisticas(db);
    
    console.log('\n🎉 ¡POBLADO EXTENSIVO COMPLETADO EXITOSAMENTE!');
    console.log('===============================================');
    
  } catch (error) {
    console.error('❌ Error durante el poblado:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('🔒 Conexión cerrada');
    }
  }
}

// 📍 Poblar departamentos
async function poblarDepartamentos(db) {
  const departments = DEPARTAMENTOS_UCN.map(dept => ({
    ...dept,
    currentSemester: CONFIG.semester.current,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
  
  const result = await db.collection('departments').insertMany(departments);
  console.log(`✅ ${result.insertedCount} departamentos creados`);
  return Object.values(result.insertedIds);
}

// 🎓 Poblar carreras
async function poblarCarreras(db, departmentIds) {
  const careers = CARRERAS_UCN.map((career, index) => ({
    ...career,
    departmentId: departmentIds[index % departmentIds.length],
    currentSemester: CONFIG.semester.current,
    studentIds: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
  
  const result = await db.collection('careers').insertMany(careers);
  console.log(`✅ ${result.insertedCount} carreras creadas`);
  return Object.values(result.insertedIds);
}

// 📂 Poblar categorías
async function poblarCategorias(db) {
  const categories = TIPOS_AJUSTES.map(tipo => ({
    name: tipo.name,
    description: tipo.description,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
  
  const result = await db.collection('categories').insertMany(categories);
  console.log(`✅ ${result.insertedCount} categorías creadas`);
  return Object.values(result.insertedIds);
}

// 👥 Poblar usuarios del sistema
async function poblarUsuarios(db, departmentIds, careerIds) {
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  
  const hashedPassword = await bcrypt.hash('ucn2025!', saltRounds);
  
  const users = await Promise.all(USUARIOS_SISTEMA.map(async (user) => ({
    email: user.email,
    password: hashedPassword,
    nombreCompleto: user.nombreCompleto,
    roles: user.roles,
    isActive: true,
    departmentId: user.department ? departmentIds[0] : null, // Simplificado para testing
    responsabilidadesAdicionales: user.courses ? user.courses : [],
    createdAt: new Date(),
    updatedAt: new Date()
  })));
  
  const result = await db.collection('users').insertMany(users);
  console.log(`✅ ${result.insertedCount} usuarios del sistema creados`);
  return Object.values(result.insertedIds);
}

// 📚 Poblar cursos
async function poblarCursos(db, userIds) {
  const courses = CURSOS_REALES.map((curso, index) => ({
    ...curso,
    profesores: [getRandomElement(userIds)],
    studentIds: [],
    adjustmentIds: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }));
  
  const result = await db.collection('courses').insertMany(courses);
  console.log(`✅ ${result.insertedCount} cursos creados`);
  return Object.values(result.insertedIds);
}

// 🎓 Poblar estudiantes extensivos
async function poblarEstudiantesExtensivos(db, careerIds) {
  console.log(`   Generando ${CONFIG.testing.totalStudents} estudiantes...`);
  
  const students = [];
  const nombresM = ['Juan', 'Carlos', 'Diego', 'Felipe', 'Andrés', 'Sebastián', 'Matías', 'Nicolás', 'Gabriel', 'Joaquín'];
  const nombresF = ['María', 'Ana', 'Carmen', 'Patricia', 'Isabel', 'Andrea', 'Camila', 'Fernanda', 'Valentina', 'Sofía'];
  const apellidos = ['González', 'Rodríguez', 'Pérez', 'López', 'Martínez', 'García', 'Silva', 'Morales', 'Torres', 'Ramírez', 'Hernández', 'Castro'];
  const diagnosticos = ['TDAH', 'Dislexia', 'TEA Nivel 1', 'Discapacidad Visual', 'Déficit Atencional', 'Trastorno del Procesamiento Auditivo', 'Discapacidad Motora Leve'];
  
  for (let i = 1; i <= CONFIG.testing.totalStudents; i++) {
    const esNEE = Math.random() < 0.25; // 25% son estudiantes NEE
    const genero = Math.random() < 0.5 ? 'M' : 'F';
    const nombres = genero === 'M' ? getRandomElement(nombresM) : getRandomElement(nombresF);
    const apellidoP = getRandomElement(apellidos);
    const apellidoM = getRandomElement(apellidos);
    
    const rut = generarRutValido(18000000 + i);
    
    students.push({
      rut: rut,
      nombres: nombres,
      apellidos: `${apellidoP} ${apellidoM}`,
      email: `${nombres.toLowerCase()}.${apellidoP.toLowerCase()}${i}@alumnos.ucn.cl`,
      carreraId: getRandomElement(careerIds),
      semestre: CONFIG.semester.current,
      esNEE: esNEE,
      diagnóstico: esNEE ? getRandomElement(diagnosticos) : null,
      añoIngreso: getRandomElement(['2021', '2022', '2023', '2024', '2025']),
      estado: 'activo',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  const result = await db.collection('students').insertMany(students);
  console.log(`✅ ${result.insertedCount} estudiantes creados (${students.filter(s => s.esNEE).length} con NEE)`);
  return Object.values(result.insertedIds);
}

// 📝 Poblar inscripciones
async function poblarInscripciones(db, studentIds, courseIds) {
  const enrollments = [];
  
  // Cada estudiante se inscribe en 4-6 cursos
  for (const studentId of studentIds) {
    const numCursos = Math.floor(Math.random() * 3) + 4; // 4-6 cursos
    const cursosSeleccionados = getRandomElements(courseIds, numCursos);
    
    for (const courseId of cursosSeleccionados) {
      enrollments.push({
        studentId: studentId,
        courseId: courseId,
        semester: CONFIG.semester.current,
        status: 'enrolled',
        enrollmentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
  
  const result = await db.collection('enrollments').insertMany(enrollments);
  console.log(`✅ ${result.insertedCount} inscripciones creadas`);
}

// 📄 Poblar documentos
async function poblarDocumentos(db, studentIds, userIds) {
  const documents = [];
  
  // Solo estudiantes NEE tienen documentos
  const estudiantesNEE = await db.collection('students').find({ esNEE: true }).toArray();
  
  for (const estudiante of estudiantesNEE) {
    const numDocs = Math.floor(Math.random() * 3) + 2; // 2-4 documentos por estudiante NEE
    
    for (let i = 0; i < numDocs; i++) {
      documents.push({
        studentId: estudiante._id,
        tipo: getRandomElement(TIPOS_DOCUMENTOS),
        nombreArchivo: `documento_${estudiante.rut}_${i + 1}.pdf`,
        rutaArchivo: `/uploads/documents/${estudiante.rut}_${i + 1}.pdf`,
        fechaSubida: new Date(),
        subidoPor: getRandomElement(userIds),
        validado: Math.random() < 0.8, // 80% validados
        fechaValidacion: Math.random() < 0.8 ? new Date() : null,
        validadoPor: Math.random() < 0.8 ? getRandomElement(userIds) : null,
        observaciones: Math.random() < 0.3 ? 'Documento completo y válido' : null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
  
  const result = await db.collection('documents').insertMany(documents);
  console.log(`✅ ${result.insertedCount} documentos creados`);
  return Object.values(result.insertedIds);
}

// 📋 Poblar consentimientos
async function poblarConsentimientos(db, studentIds) {
  const consents = [];
  
  // 70% de estudiantes han dado consentimiento
  const estudiantesConConsentimiento = getRandomElements(studentIds, Math.floor(studentIds.length * 0.7));
  
  for (const studentId of estudiantesConConsentimiento) {
    consents.push({
      studentId: studentId,
      hasConsent: true,
      consentDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Último año
      withdrawalDate: null,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Testing)',
      additionalInfo: 'Consentimiento otorgado para testing',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  const result = await db.collection('consents').insertMany(consents);
  console.log(`✅ ${result.insertedCount} consentimientos creados`);
}

// ⚙️ Poblar ajustes académicos extensivos
async function poblarAjustesAcademicos(db, studentIds, categoryIds, courseIds, userIds, documentIds) {
  const adjustments = [];
  
  // Solo estudiantes NEE tienen ajustes
  const estudiantesNEE = await db.collection('students').find({ esNEE: true }).toArray();
  
  for (const estudiante of estudiantesNEE) {
    const numAjustes = Math.floor(Math.random() * 3) + 1; // 1-3 ajustes por estudiante
    const cursosEstudiante = await db.collection('enrollments').find({ studentId: estudiante._id }).toArray();
    
    if (cursosEstudiante.length === 0) continue;
    
    const currentAdjustments = [];
    
    for (let i = 0; i < numAjustes; i++) {
      const curso = getRandomElement(cursosEstudiante);
      const category = getRandomElement(categoryIds);
      const approver = getRandomElement(userIds);
      
      currentAdjustments.push({
        type: category,
        courseNrc: `CURSO${Math.floor(Math.random() * 1000)}`,
        profesor: 'Dr. Profesor Ejemplo',
        approvedBy: approver,
        approvedAt: new Date(),
        fechaInicio: new Date(),
        requiresSemesterConfirmation: Math.random() < 0.6,
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        estado: getRandomElement(['ACTIVE', 'PENDING', 'APPROVED']),
        documentosAsociados: getRandomElements(documentIds, Math.floor(Math.random() * 3) + 1),
        comentarios: 'Ajuste necesario según evaluación profesional',
        semester: CONFIG.semester.current,
        readBy: [],
        helpRequests: []
      });
    }
    
    adjustments.push({
      studentRut: estudiante.rut,
      studentId: estudiante._id,
      currentAdjustments: currentAdjustments,
      history: [],
      semester: CONFIG.semester.current,
      modificadoPor: getRandomElement(userIds),
      ultimaModificacion: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  const result = await db.collection('adjustments').insertMany(adjustments);
  console.log(`✅ ${result.insertedCount} ajustes académicos creados`);
  return Object.values(result.insertedIds);
}

// 🔔 Poblar notificaciones
async function poblarNotificaciones(db, userIds, studentIds, adjustmentIds) {
  const notifications = [];
  
  // Generar notificaciones variadas
  for (let i = 0; i < CONFIG.testing.totalNotifications; i++) {
    const tipo = getRandomElement(TIPOS_NOTIFICACIONES);
    const recipientId = getRandomElement(userIds);
    
    notifications.push({
      recipientId: recipientId,
      type: tipo,
      title: generarTituloNotificacion(tipo),
      message: generarMensajeNotificacion(tipo),
      read: Math.random() < 0.4, // 40% leídas
      readAt: Math.random() < 0.4 ? new Date() : null,
      data: {
        studentId: getRandomElement(studentIds),
        adjustmentId: adjustmentIds.length > 0 ? getRandomElement(adjustmentIds) : null
      },
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Último mes
      updatedAt: new Date()
    });
  }
  
  const result = await db.collection('notifications').insertMany(notifications);
  console.log(`✅ ${result.insertedCount} notificaciones creadas`);
}

// 📚 Poblar recursos educativos
async function poblarRecursos(db, userIds, categoryIds) {
  const recursos = [
    { title: 'Guía para Estudiantes con TDAH', description: 'Estrategias de estudio para estudiantes con TDAH', type: 'Guía', category: 'TDAH' },
    { title: 'Manual de Adaptaciones Curriculares', description: 'Procedimientos para implementar adaptaciones', type: 'Manual', category: 'General' },
    { title: 'Video: Técnicas de Estudio Adaptativas', description: 'Técnicas especializadas para diferentes NEE', type: 'Video', category: 'Técnicas' },
    { title: 'Plantilla de Evaluación Adaptada', description: 'Formato accesible para evaluaciones', type: 'Plantilla', category: 'Evaluación' },
    { title: 'Software de Apoyo Recomendado', description: 'Lista de herramientas tecnológicas de apoyo', type: 'Lista', category: 'Tecnología' }
  ];
  
  const resources = recursos.map(recurso => ({
    title: recurso.title,
    description: recurso.description,
    type: recurso.type,
    category: getRandomElement(categoryIds),
    filePath: `/uploads/resources/${recurso.title.replace(/\s+/g, '_').toLowerCase()}.pdf`,
    uploadedBy: getRandomElement(userIds),
    isActive: true,
    downloadCount: Math.floor(Math.random() * 100),
    tags: [recurso.category, 'NEE', 'Apoyo'],
    createdAt: new Date(),
    updatedAt: new Date()
  }));
  
  const result = await db.collection('resources').insertMany(resources);
  console.log(`✅ ${result.insertedCount} recursos educativos creados`);
}

// 📊 Generar estadísticas finales
async function generarEstadisticas(db) {
  const stats = {
    students: await db.collection('students').countDocuments(),
    studentsNEE: await db.collection('students').countDocuments({ esNEE: true }),
    users: await db.collection('users').countDocuments(),
    courses: await db.collection('courses').countDocuments(),
    adjustments: await db.collection('adjustments').countDocuments(),
    documents: await db.collection('documents').countDocuments(),
    notifications: await db.collection('notifications').countDocuments(),
    consents: await db.collection('consents').countDocuments(),
    resources: await db.collection('resources').countDocuments(),
    enrollments: await db.collection('enrollments').countDocuments()
  };
  
  console.log('\n📊 ESTADÍSTICAS FINALES:');
  console.log('========================');
  Object.entries(stats).forEach(([key, value]) => {
    console.log(`📈 ${key}: ${value}`);
  });
  
  const porcentajeNEE = ((stats.studentsNEE / stats.students) * 100).toFixed(1);
  console.log(`\n🎯 ${porcentajeNEE}% de estudiantes con NEE`);
  console.log(`🎯 ${stats.adjustments} ajustes académicos activos`);
  console.log(`🎯 ${stats.notifications} notificaciones en sistema`);
}

// 🛠️ FUNCIONES AUXILIARES
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generarRutValido(numero) {
  const cuerpo = numero.toString();
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const resto = suma % 11;
  const dv = resto === 0 ? '0' : resto === 1 ? 'K' : (11 - resto).toString();
  
  return `${cuerpo}-${dv}`;
}

function generarTituloNotificacion(tipo) {
  const titulos = {
    'AJUSTE_APROBADO': 'Ajuste Académico Aprobado',
    'AJUSTE_RECHAZADO': 'Ajuste Académico Rechazado',
    'DOCUMENTO_PENDIENTE': 'Documento Pendiente de Validación',
    'CONFIRMACION_SEMESTRAL': 'Confirmación Semestral Requerida',
    'NUEVA_EVALUACION': 'Nueva Evaluación Programada',
    'SISTEMA': 'Notificación del Sistema'
  };
  return titulos[tipo] || 'Notificación';
}

function generarMensajeNotificacion(tipo) {
  const mensajes = {
    'AJUSTE_APROBADO': 'Su solicitud de ajuste académico ha sido aprobada y está activa.',
    'AJUSTE_RECHAZADO': 'Su solicitud de ajuste académico ha sido rechazada. Revise los comentarios.',
    'DOCUMENTO_PENDIENTE': 'Tiene documentos pendientes de validación por parte del equipo técnico.',
    'CONFIRMACION_SEMESTRAL': 'Se requiere confirmación semestral de sus ajustes académicos.',
    'NUEVA_EVALUACION': 'Se ha programado una nueva evaluación. Revise los detalles.',
    'SISTEMA': 'Información importante del sistema UCN INCLUI2.'
  };
  return mensajes[tipo] || 'Mensaje de notificación';
}

// 🚀 EJECUTAR SCRIPT
if (require.main === module) {
  poblarDatosExtensivos()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { poblarDatosExtensivos };