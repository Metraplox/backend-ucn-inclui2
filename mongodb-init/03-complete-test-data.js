// 🎯 Script Completo de Datos de Prueba UCN Inclui2
// Datos realistas para testing completo de todos los endpoints

print('🚀 Iniciando inserción completa de datos de prueba...');

db = db.getSiblingDB('ucn_inclui2_prod');

// Deshabilitar validaciones de esquema temporalmente para el seed masivo
print('🔧 Deshabilitando validaciones...');
try {
  db.runCommand({collMod: 'users', validator: {}, validationLevel: 'off'});
  db.runCommand({collMod: 'students', validator: {}, validationLevel: 'off'});
  db.runCommand({collMod: 'departments', validator: {}, validationLevel: 'off'});
  db.runCommand({collMod: 'careers', validator: {}, validationLevel: 'off'});
  db.runCommand({collMod: 'courses', validator: {}, validationLevel: 'off'});
  db.runCommand({collMod: 'adjustments', validator: {}, validationLevel: 'off'});
  db.runCommand({collMod: 'documents', validator: {}, validationLevel: 'off'});
  db.runCommand({collMod: 'consents', validator: {}, validationLevel: 'off'});
  db.runCommand({collMod: 'notifications', validator: {}, validationLevel: 'off'});
  db.runCommand({collMod: 'resources', validator: {}, validationLevel: 'off'});
  db.runCommand({collMod: 'academichistories', validator: {}, validationLevel: 'off'});
  db.runCommand({collMod: 'enrollments', validator: {}, validationLevel: 'off'});
} catch (e) {
  print('Validaciones ya deshabilitadas o colecciones no existen');
}

print('🧹 Limpiando datos existentes...');
db.users.deleteMany({});
db.students.deleteMany({});
db.departments.deleteMany({});
db.careers.deleteMany({});
db.courses.deleteMany({});
db.adjustments.deleteMany({});
db.documents.deleteMany({});
db.consents.deleteMany({});
db.notifications.deleteMany({});
db.resources.deleteMany({});
db.academichistories.deleteMany({});
db.enrollments.deleteMany({});

print('✅ Datos anteriores limpiados');

// 1. DEPARTAMENTOS
print('🏛️ Creando departamentos...');
const departments = [
  {
    _id: ObjectId('650000000000000000000001'),
    name: 'Departamento de Informática',
    code: 'INFO',
    description: 'Departamento de Ingeniería Informática y Ciencias de la Computación',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('650000000000000000000002'),
    name: 'Departamento de Matemáticas',
    code: 'MATE',
    description: 'Departamento de Matemáticas y Estadística',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('650000000000000000000003'),
    name: 'Departamento de Ingeniería Civil',
    code: 'CIVIL',
    description: 'Departamento de Ingeniería Civil y Obras Civiles',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
db.departments.insertMany(departments);
print('✅ 3 departamentos creados');

// 2. CARRERAS
print('🎓 Creando carreras...');
const careers = [
  {
    _id: ObjectId('651000000000000000000001'),
    name: 'Ingeniería Civil Informática',
    code: 'ICI',
    departmentId: ObjectId('650000000000000000000001'),
    description: 'Carrera de Ingeniería Civil Informática',
    duration: 12,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('651000000000000000000002'),
    name: 'Ingeniería Civil Industrial',
    code: 'ICIN',
    departmentId: ObjectId('650000000000000000000002'),
    description: 'Carrera de Ingeniería Civil Industrial',
    duration: 12,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('651000000000000000000003'),
    name: 'Ingeniería Civil',
    code: 'IC',
    departmentId: ObjectId('650000000000000000000003'),
    description: 'Carrera de Ingeniería Civil',
    duration: 12,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
db.careers.insertMany(careers);
print('✅ 3 carreras creadas');

// 3. USUARIOS DEL SISTEMA (sin password_hash para simplificar)
print('👥 Creando usuarios...');
const users = [
  {
    _id: ObjectId('652000000000000000000001'),
    email: 'coordinadora@ucn.cl',
    nombreCompleto: 'María González Coordinadora',
    roles: ['coordinador'],
    isActive: true,
    isProfileComplete: true,
    additionalResponsibilities: {
      isDepartmentHead: false,
      isCareerHead: false,
      isDIDDECStaff: false,
      departmentIds: [],
      careerIds: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('652000000000000000000002'),
    email: 'educadora@ucn.cl',
    nombreCompleto: 'Ana Martínez Educadora',
    roles: ['educadora_social'],
    isActive: true,
    isProfileComplete: true,
    additionalResponsibilities: {
      isDepartmentHead: false,
      isCareerHead: false,
      isDIDDECStaff: false,
      departmentIds: [],
      careerIds: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('652000000000000000000003'),
    email: 'diddec@ucn.cl',
    nombreCompleto: 'Carlos López DIDDEC',
    roles: ['diddec_staff'],
    isActive: true,
    isProfileComplete: true,
    additionalResponsibilities: {
      isDepartmentHead: false,
      isCareerHead: false,
      isDIDDECStaff: true,
      departmentIds: [],
      careerIds: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('652000000000000000000004'),
    email: 'jefe.informatica@ucn.cl',
    nombreCompleto: 'Roberto Silva Jefe Depto',
    roles: ['jefe_departamento'],
    isActive: true,
    isProfileComplete: true,
    additionalResponsibilities: {
      isDepartmentHead: true,
      isCareerHead: false,
      isDIDDECStaff: false,
      departmentIds: [ObjectId('650000000000000000000001')],
      careerIds: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('652000000000000000000005'),
    email: 'jefe.carrera.ici@ucn.cl',
    nombreCompleto: 'Patricia Morales Jefe Carrera',
    roles: ['jefe_carrera'],
    isActive: true,
    isProfileComplete: true,
    additionalResponsibilities: {
      isDepartmentHead: false,
      isCareerHead: true,
      isDIDDECStaff: false,
      departmentIds: [],
      careerIds: [ObjectId('651000000000000000000001')]
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('652000000000000000000006'),
    email: 'docente1@ucn.cl',
    nombreCompleto: 'Pedro Sánchez Docente',
    roles: ['docente'],
    isActive: true,
    isProfileComplete: true,
    additionalResponsibilities: {
      isDepartmentHead: false,
      isCareerHead: false,
      isDIDDECStaff: false,
      departmentIds: [],
      careerIds: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('652000000000000000000007'),
    email: 'docente2@ucn.cl',
    nombreCompleto: 'Laura Fernández Docente',
    roles: ['docente'],
    isActive: true,
    isProfileComplete: true,
    additionalResponsibilities: {
      isDepartmentHead: false,
      isCareerHead: false,
      isDIDDECStaff: false,
      departmentIds: [],
      careerIds: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('652000000000000000000008'),
    email: 'estudiante1@ucn.cl',
    nombreCompleto: 'Juan Pérez Estudiante',
    roles: ['estudiante'],
    isActive: true,
    isProfileComplete: true,
    studentId: ObjectId('653000000000000000000001'),
    additionalResponsibilities: {
      isDepartmentHead: false,
      isCareerHead: false,
      isDIDDECStaff: false,
      departmentIds: [],
      careerIds: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('652000000000000000000009'),
    email: 'estudiante2@ucn.cl',
    nombreCompleto: 'María Rodríguez Estudiante',
    roles: ['estudiante'],
    isActive: true,
    isProfileComplete: true,
    studentId: ObjectId('653000000000000000000002'),
    additionalResponsibilities: {
      isDepartmentHead: false,
      isCareerHead: false,
      isDIDDECStaff: false,
      departmentIds: [],
      careerIds: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('652000000000000000000010'),
    email: 'estudiante3@ucn.cl',
    nombreCompleto: 'Diego Torres Estudiante',
    roles: ['estudiante'],
    isActive: true,
    isProfileComplete: true,
    studentId: ObjectId('653000000000000000000003'),
    additionalResponsibilities: {
      isDepartmentHead: false,
      isCareerHead: false,
      isDIDDECStaff: false,
      departmentIds: [],
      careerIds: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
db.users.insertMany(users);
print('✅ 10 usuarios creados');

// Añadir hash de contraseña común para todos los usuarios
const commonHash = '$2b$10$JlO830kFfP/PAcWiqr6keOq2kqABvroccwvLTdz4SWPec13NSS0ta';
db.users.updateMany({}, { $set: { password_hash: commonHash } });
print('🔑 password_hash añadido a todos los usuarios');

// 4. ESTUDIANTES (usando campos correctos del esquema)
print('🎓 Creando estudiantes...');
const students = [
  {
    _id: ObjectId('653000000000000000000001'),
    rut: '20111222-3',
    nombres: 'Juan',
    apellidos: 'Pérez González',
    email: 'estudiante1@ucn.cl',
    userId: ObjectId('652000000000000000000008'),
    carreraId: ObjectId('651000000000000000000001'),
    semester: '2025-1',
    fechaNacimiento: new Date('2002-03-15'),
    informacionContacto: '+56912345678',
    necesidadesEducativasEspeciales: 'Trastorno por Déficit de Atención e Hiperactividad (TDAH)',
    hasDisability: true,
    disabilityType: 'Déficit Atencional',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('653000000000000000000002'),
    rut: '20333444-5',
    nombres: 'María',
    apellidos: 'Rodríguez Silva',
    email: 'estudiante2@ucn.cl',
    userId: ObjectId('652000000000000000000009'),
    carreraId: ObjectId('651000000000000000000002'),
    semester: '2025-1',
    fechaNacimiento: new Date('2001-07-22'),
    informacionContacto: '+56923456789',
    necesidadesEducativasEspeciales: 'Dificultades específicas en el aprendizaje de la lectura',
    hasDisability: true,
    disabilityType: 'Dislexia',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('653000000000000000000003'),
    rut: '20555666-7',
    nombres: 'Diego',
    apellidos: 'Torres Morales',
    email: 'estudiante3@ucn.cl',
    userId: ObjectId('652000000000000000000010'),
    carreraId: ObjectId('651000000000000000000003'),
    semester: '2025-1',
    fechaNacimiento: new Date('2000-11-08'),
    informacionContacto: '+56934567890',
    necesidadesEducativasEspeciales: 'Baja visión parcial',
    hasDisability: true,
    disabilityType: 'Discapacidad Visual',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
db.students.insertMany(students);
print('✅ 3 estudiantes creados');

// 5. CURSOS
print('📚 Creando cursos...');
const courses = [
  {
    _id: ObjectId('654000000000000000000001'),
    code: 'INFO101',
    name: 'Introducción a la Programación',
    description: 'Fundamentos de programación y lógica computacional',
    credits: 6,
    semester: 1,
    departmentId: ObjectId('650000000000000000000001'),
    careerIds: [ObjectId('651000000000000000000001')],
    teacherIds: [ObjectId('652000000000000000000006')],
    academicPeriod: '2025-1',
    schedule: {
      days: ['lunes', 'miércoles', 'viernes'],
      startTime: '08:00',
      endTime: '09:30'
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('654000000000000000000002'),
    code: 'MATE201',
    name: 'Cálculo II',
    description: 'Cálculo integral y series',
    credits: 6,
    semester: 3,
    departmentId: ObjectId('650000000000000000000002'),
    careerIds: [ObjectId('651000000000000000000001'), ObjectId('651000000000000000000002')],
    teacherIds: [ObjectId('652000000000000000000007')],
    academicPeriod: '2025-1',
    schedule: {
      days: ['martes', 'jueves'],
      startTime: '10:00',
      endTime: '11:30'
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('654000000000000000000003'),
    code: 'CIVIL301',
    name: 'Mecánica de Suelos',
    description: 'Principios de mecánica de suelos aplicada',
    credits: 6,
    semester: 5,
    departmentId: ObjectId('650000000000000000000003'),
    careerIds: [ObjectId('651000000000000000000003')],
    teacherIds: [ObjectId('652000000000000000000006')],
    academicPeriod: '2025-1',
    schedule: {
      days: ['lunes', 'miércoles'],
      startTime: '14:00',
      endTime: '15:30'
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
db.courses.insertMany(courses);
print('✅ 3 cursos creados');

// 6. AJUSTES ACADÉMICOS
print('⚙️ Creando ajustes académicos...');
const adjustments = [
  {
    _id: ObjectId('655000000000000000000001'),
    studentId: ObjectId('653000000000000000000001'),
    courseId: ObjectId('654000000000000000000001'),
    categoryId: ObjectId('507f1f77bcf86cd799439011'), // Tiempo Extendido
    adjustmentType: 'evaluacion',
    description: 'Tiempo adicional del 50% para evaluaciones',
    specificDetails: 'Otorgar 1.5 veces el tiempo normal para pruebas y exámenes',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-07-31'),
    isActive: true,
    approvedBy: ObjectId('652000000000000000000002'),
    approvalDate: new Date('2025-02-25'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('655000000000000000000002'),
    studentId: ObjectId('653000000000000000000002'),
    courseId: ObjectId('654000000000000000000002'),
    categoryId: ObjectId('507f1f77bcf86cd799439012'), // Apoyo Visual
    adjustmentType: 'material',
    description: 'Material con apoyo visual para dislexia',
    specificDetails: 'Textos con fuente especial, mayor espaciado y apoyo gráfico',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-07-31'),
    isActive: true,
    approvedBy: ObjectId('652000000000000000000002'),
    approvalDate: new Date('2025-02-28'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('655000000000000000000003'),
    studentId: ObjectId('653000000000000000000003'),
    courseId: ObjectId('654000000000000000000003'),
    categoryId: ObjectId('507f1f77bcf86cd799439013'), // Evaluación Oral
    adjustmentType: 'evaluacion',
    description: 'Evaluaciones en formato oral para discapacidad visual',
    specificDetails: 'Todas las evaluaciones escritas se realizarán de forma oral',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-07-31'),
    isActive: true,
    approvedBy: ObjectId('652000000000000000000003'),
    approvalDate: new Date('2025-02-20'),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
db.adjustments.insertMany(adjustments);
print('✅ 3 ajustes académicos creados');

// 7. RECURSOS EDUCATIVOS
print('📖 Creando recursos educativos...');
const resources = [
  {
    _id: ObjectId('656000000000000000000001'),
    title: 'Guía de Programación para TDAH',
    description: 'Material didáctico adaptado para estudiantes con déficit atencional',
    type: 'documento',
    category: 'guia_didactica',
    adjustmentTypeIds: [ObjectId('507f1f77bcf86cd799439011')],
    filePath: '/resources/guia-programacion-tdah.pdf',
    fileSize: 2048576,
    mimeType: 'application/pdf',
    uploadedBy: ObjectId('652000000000000000000003'),
    isActive: true,
    downloadCount: 15,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('656000000000000000000002'),
    title: 'Software Lector de Pantalla',
    description: 'Herramienta de apoyo para estudiantes con discapacidad visual',
    type: 'software',
    category: 'herramienta_tecnologica',
    adjustmentTypeIds: [ObjectId('507f1f77bcf86cd799439013')],
    filePath: '/resources/lector-pantalla-setup.exe',
    fileSize: 15728640,
    mimeType: 'application/octet-stream',
    uploadedBy: ObjectId('652000000000000000000003'),
    isActive: true,
    downloadCount: 8,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
db.resources.insertMany(resources);
print('✅ 2 recursos educativos creados');

// 8. CONSENTIMIENTOS
print('📝 Creando consentimientos...');
const consents = [
  {
    _id: ObjectId('657000000000000000000001'),
    studentId: ObjectId('653000000000000000000001'), // Juan Pérez
    allowsDataSharing: true,
    consentDate: new Date('2025-01-15'),
    studentRut: '20.123.456-7',
    studentName: 'Juan Carlos Pérez González', 
    studentCareer: 'Ingeniería en Sistemas Computacionales',
    comments: 'Autorizo compartir mi información para recibir mejor apoyo académico',
    registeredBy: ObjectId('653000000000000000000001'), // Auto-registrado por el estudiante
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    isActive: true,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    _id: ObjectId('657000000000000000000002'),
    studentId: ObjectId('653000000000000000000002'), // María Rodríguez
    allowsDataSharing: false,
    consentDate: new Date('2025-01-20'),
    studentRut: '19.987.654-3',
    studentName: 'María José Rodríguez Fernández',
    studentCareer: 'Psicología',
    comments: 'Prefiero mantener mi información médica privada',
    registeredBy: ObjectId('653000000000000000000002'), // Auto-registrado por el estudiante
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    isActive: true,
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-20')
  }
];
db.consents.insertMany(consents);
print('✅ 2 consentimientos creados');

// 9. NOTIFICACIONES
print('🔔 Creando notificaciones...');
const notifications = [
  {
    _id: ObjectId('658000000000000000000001'),
    userId: ObjectId('652000000000000000000008'),
    type: 'adjustment_approved',
    title: 'Ajuste Académico Aprobado',
    message: 'Tu ajuste de tiempo extendido para INFO101 ha sido aprobado',
    isRead: false,
    priority: 'medium',
    relatedEntityType: 'adjustment',
    relatedEntityId: ObjectId('655000000000000000000001'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('658000000000000000000002'),
    userId: ObjectId('652000000000000000000006'),
    type: 'new_student_assignment',
    title: 'Nuevo Estudiante con NEE Asignado',
    message: 'Se ha asignado un estudiante con TDAH a tu curso INFO101',
    isRead: true,
    priority: 'high',
    relatedEntityType: 'student',
    relatedEntityId: ObjectId('653000000000000000000001'),
    readAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
db.notifications.insertMany(notifications);
print('✅ 2 notificaciones creadas');

// 10. HISTORIAL ACADÉMICO
print('📊 Creando historial académico...');
const academicHistories = [
  {
    _id: ObjectId('659000000000000000000001'),
    studentId: ObjectId('653000000000000000000001'),
    courseId: ObjectId('654000000000000000000001'),
    academicPeriod: '2024-2',
    grade: 6.2,
    status: 'aprobado',
    attempts: 1,
    hasAdjustments: true,
    adjustmentDetails: 'Tiempo extendido aplicado en todas las evaluaciones',
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-15')
  },
  {
    _id: ObjectId('659000000000000000000002'),
    studentId: ObjectId('653000000000000000000002'),
    courseId: ObjectId('654000000000000000000002'),
    academicPeriod: '2024-2',
    grade: 5.8,
    status: 'aprobado',
    attempts: 1,
    hasAdjustments: true,
    adjustmentDetails: 'Material con apoyo visual utilizado',
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date('2024-12-20')
  }
];
db.academichistories.insertMany(academicHistories);
print('✅ 2 registros de historial académico creados');

// 11. INSCRIPCIONES
print('📝 Creando inscripciones...');
const enrollments = [
  {
    _id: ObjectId('660000000000000000000001'),
    studentId: ObjectId('653000000000000000000001'),
    courseId: ObjectId('654000000000000000000001'),
    academicPeriod: '2025-1',
    enrollmentDate: new Date('2025-02-01'),
    status: 'enrolled',
    hasSpecialNeeds: true,
    adjustmentsApplied: ['tiempo_extendido'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('660000000000000000000002'),
    studentId: ObjectId('653000000000000000000002'),
    courseId: ObjectId('654000000000000000000002'),
    academicPeriod: '2025-1',
    enrollmentDate: new Date('2025-02-01'),
    status: 'enrolled',
    hasSpecialNeeds: true,
    adjustmentsApplied: ['apoyo_visual'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId('660000000000000000000003'),
    studentId: ObjectId('653000000000000000000003'),
    courseId: ObjectId('654000000000000000000003'),
    academicPeriod: '2025-1',
    enrollmentDate: new Date('2025-02-01'),
    status: 'enrolled',
    hasSpecialNeeds: true,
    adjustmentsApplied: ['evaluacion_oral'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
db.enrollments.insertMany(enrollments);
print('✅ 3 inscripciones creadas');

print('🎉 ¡Datos de prueba completados exitosamente!');
print('');
print('📊 RESUMEN DE DATOS CREADOS:');
print('- 3 Departamentos');
print('- 3 Carreras');
print('- 10 Usuarios (todos los roles)');
print('- 3 Estudiantes con NEE');
print('- 3 Cursos');
print('- 3 Ajustes académicos');
print('- 2 Recursos educativos');
print('- 2 Consentimientos');
print('- 2 Notificaciones');
print('- 2 Registros de historial académico');
print('- 3 Inscripciones');
print('');
print('✅ Base de datos lista para testing completo de endpoints'); 