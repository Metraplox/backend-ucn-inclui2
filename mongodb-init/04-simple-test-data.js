// 🎯 Script Simple de Datos de Prueba UCN Inclui2
// Datos básicos para testing de endpoints principales

print('🚀 Iniciando inserción simple de datos de prueba...');

db = db.getSiblingDB('ucn_inclui2_prod');

// Deshabilitar validaciones temporalmente
print('🔧 Deshabilitando validaciones...');
try {
  db.runCommand({collMod: 'users', validator: {}, validationLevel: 'off'});
  db.runCommand({collMod: 'students', validator: {}, validationLevel: 'off'});
  db.runCommand({collMod: 'courses', validator: {}, validationLevel: 'off'});
  db.runCommand({collMod: 'departments', validator: {}, validationLevel: 'off'});
  db.runCommand({collMod: 'careers', validator: {}, validationLevel: 'off'});
} catch (e) {
  print('Validaciones ya deshabilitadas o no existen');
}

// Limpiar datos existentes
print('🧹 Limpiando datos existentes...');
db.users.deleteMany({});
db.students.deleteMany({});
db.departments.deleteMany({});
db.careers.deleteMany({});
db.courses.deleteMany({});

print('✅ Datos anteriores limpiados');

// 1. DEPARTAMENTOS
print('🏛️ Insertando departamentos...');
try {
  db.departments.insertOne({
    _id: ObjectId('650000000000000000000001'),
    name: 'Departamento de Informática',
    code: 'INFO',
    description: 'Departamento de Ingeniería Informática',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  db.departments.insertOne({
    _id: ObjectId('650000000000000000000002'),
    name: 'Departamento de Matemáticas',
    code: 'MATE',
    description: 'Departamento de Matemáticas',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  print('✅ 2 departamentos creados');
} catch (e) {
  print('❌ Error en departamentos: ' + e);
}

// 2. CARRERAS
print('🎓 Insertando carreras...');
try {
  db.careers.insertOne({
    _id: ObjectId('651000000000000000000001'),
    name: 'Ingeniería Civil Informática',
    code: 'ICI',
    departmentId: ObjectId('650000000000000000000001'),
    description: 'Carrera de Ingeniería Civil Informática',
    duration: 12,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  db.careers.insertOne({
    _id: ObjectId('651000000000000000000002'),
    name: 'Ingeniería Civil Industrial',
    code: 'ICIN',
    departmentId: ObjectId('650000000000000000000002'),
    description: 'Carrera de Ingeniería Civil Industrial',
    duration: 12,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  print('✅ 2 carreras creadas');
} catch (e) {
  print('❌ Error en carreras: ' + e);
}

// 3. USUARIOS
print('👥 Insertando usuarios...');
try {
  // Coordinador
  db.users.insertOne({
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
  });
  
  // Educadora Social
  db.users.insertOne({
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
  });
  
  // DIDDEC Staff
  db.users.insertOne({
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
  });
  
  // Jefe de Departamento
  db.users.insertOne({
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
  });
  
  // Jefe de Carrera
  db.users.insertOne({
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
  });
  
  // Docente
  db.users.insertOne({
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
  });
  
  // Estudiante 1
  db.users.insertOne({
    _id: ObjectId('652000000000000000000007'),
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
  });
  
  // Estudiante 2
  db.users.insertOne({
    _id: ObjectId('652000000000000000000008'),
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
  });
  
  print('✅ 8 usuarios creados');
} catch (e) {
  print('❌ Error en usuarios: ' + e);
}

// 4. ESTUDIANTES
print('🎓 Insertando estudiantes...');
try {
  db.students.insertOne({
    _id: ObjectId('653000000000000000000001'),
    rut: '20111222-3',
    nombres: 'Juan',
    apellidos: 'Pérez González',
    email: 'estudiante1@ucn.cl',
    userId: ObjectId('652000000000000000000007'),
    carreraId: ObjectId('651000000000000000000001'),
    semester: '2025-1',
    fechaNacimiento: new Date('2002-03-15'),
    informacionContacto: '+56912345678',
    necesidadesEducativasEspeciales: 'Trastorno por Déficit de Atención e Hiperactividad (TDAH)',
    hasDisability: true,
    disabilityType: 'Déficit Atencional',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  db.students.insertOne({
    _id: ObjectId('653000000000000000000002'),
    rut: '20333444-5',
    nombres: 'María',
    apellidos: 'Rodríguez Silva',
    email: 'estudiante2@ucn.cl',
    userId: ObjectId('652000000000000000000008'),
    carreraId: ObjectId('651000000000000000000002'),
    semester: '2025-1',
    fechaNacimiento: new Date('2001-07-22'),
    informacionContacto: '+56923456789',
    necesidadesEducativasEspeciales: 'Dificultades específicas en el aprendizaje de la lectura',
    hasDisability: true,
    disabilityType: 'Dislexia',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  print('✅ 2 estudiantes creados');
} catch (e) {
  print('❌ Error en estudiantes: ' + e);
}

// 5. CURSOS (con campos mínimos para evitar conflictos)
print('📚 Insertando cursos...');
try {
  db.courses.insertOne({
    _id: ObjectId('654000000000000000000001'),
    code: 'INFO101',
    name: 'Introducción a la Programación',
    description: 'Fundamentos de programación',
    credits: 6,
    nrc: 'NRC001',
    semestre: 1,
    departamento: ObjectId('650000000000000000000001'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  db.courses.insertOne({
    _id: ObjectId('654000000000000000000002'),
    code: 'MATE201',
    name: 'Cálculo II',
    description: 'Cálculo integral y series',
    credits: 6,
    nrc: 'NRC002',
    semestre: 3,
    departamento: ObjectId('650000000000000000000002'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  print('✅ 2 cursos creados');
} catch (e) {
  print('❌ Error en cursos: ' + e);
}

print('🎉 ¡Datos básicos de prueba completados!');
print('');
print('📊 RESUMEN DE DATOS CREADOS:');
print('- 2 Departamentos');
print('- 2 Carreras');
print('- 8 Usuarios (todos los roles principales)');
print('- 2 Estudiantes con NEE');
print('- 2 Cursos');
print('');
print('✅ Base de datos lista para testing básico de endpoints'); 