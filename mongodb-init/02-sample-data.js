// 📊 Script de Datos de Prueba UCN Inclui2
// Datos de ejemplo para testing y desarrollo

print('📊 Insertando datos de prueba para desarrollo...');

db = db.getSiblingDB('ucn_inclui2_prod');

print('👥 Creando usuarios de prueba...');

const testUsers = [
  {
    email: 'coordinadora@ucn.cl',
    name: 'María González',
    rut: '12345678-9',
    role: 'COORDINADORA',
    isActive: true,
    createdAt: new Date(),
    lastLogin: null
  },
  {
    email: 'educadora@ucn.cl',
    name: 'Ana Martínez',
    rut: '11223344-5',
    role: 'EDUCADORA_SOCIAL',
    isActive: true,
    createdAt: new Date(),
    lastLogin: null
  },
  {
    email: 'diddec@ucn.cl',
    name: 'Carlos López',
    rut: '33445566-7',
    role: 'DIDDEC_STAFF',
    isActive: true,
    createdAt: new Date(),
    lastLogin: null
  },
  {
    email: 'jefe.carrera@ucn.cl',
    name: 'Roberto Silva',
    rut: '55667788-9',
    role: 'JEFE_CARRERA',
    department: 'Ingeniería Informática',
    isActive: true,
    createdAt: new Date(),
    lastLogin: null
  },
  {
    email: 'jefe.departamento@ucn.cl',
    name: 'Patricia Morales',
    rut: '77889900-1',
    role: 'JEFE_DEPARTAMENTO',
    department: 'Departamento de Informática',
    isActive: true,
    createdAt: new Date(),
    lastLogin: null
  },
  {
    email: 'docente1@ucn.cl',
    name: 'Pedro Sánchez',
    rut: '44556677-8',
    role: 'DOCENTE',
    isActive: true,
    createdAt: new Date(),
    lastLogin: null
  },
  {
    email: 'docente2@ucn.cl',
    name: 'Laura Fernández',
    rut: '88990011-2',
    role: 'DOCENTE',
    isActive: true,
    createdAt: new Date(),
    lastLogin: null
  }
];

db.users.insertMany(testUsers);
print('✅ Usuarios de prueba creados');

print('🎓 Creando estudiantes de prueba...');

const testStudents = [
  {
    rut: '20111222-3',
    name: 'Juan Pérez',
    email: 'juan.perez@estudiante.ucn.cl',
    hasNEE: true,
    neeType: 'Déficit Atencional',
    career: 'Ingeniería Informática',
    semester: 5,
    isActive: true,
    createdAt: new Date()
  },
  {
    rut: '20333444-5',
    name: 'María Rodríguez',
    email: 'maria.rodriguez@estudiante.ucn.cl',
    hasNEE: true,
    neeType: 'Dislexia',
    career: 'Ingeniería Comercial',
    semester: 3,
    isActive: true,
    createdAt: new Date()
  },
  {
    rut: '20555666-7',
    name: 'Diego Torres',
    email: 'diego.torres@estudiante.ucn.cl',
    hasNEE: true,
    neeType: 'Discapacidad Visual',
    career: 'Psicología',
    semester: 7,
    isActive: true,
    createdAt: new Date()
  }
];

db.students.insertMany(testStudents);
print('✅ Estudiantes de prueba creados');

print('🏛️ Creando departamentos de prueba...');

const testDepartments = [
  {
    name: 'Departamento de Informática',
    code: 'INFO',
    headId: 'jefe.departamento@ucn.cl',
    isActive: true,
    createdAt: new Date()
  },
  {
    name: 'Departamento de Matemáticas',
    code: 'MATE',
    isActive: true,
    createdAt: new Date()
  },
  {
    name: 'Departamento de Psicología',
    code: 'PSIC',
    isActive: true,
    createdAt: new Date()
  }
];

db.departments.insertMany(testDepartments);
print('✅ Departamentos de prueba creados');

print('📚 Creando carreras de prueba...');

const testCareers = [
  {
    name: 'Ingeniería Informática',
    code: 'ING_INFO',
    department: 'Departamento de Informática',
    headId: 'jefe.carrera@ucn.cl',
    isActive: true,
    createdAt: new Date()
  },
  {
    name: 'Ingeniería Comercial',
    code: 'ING_COM',
    department: 'Departamento de Matemáticas',
    isActive: true,
    createdAt: new Date()
  },
  {
    name: 'Psicología',
    code: 'PSIC',
    department: 'Departamento de Psicología',
    isActive: true,
    createdAt: new Date()
  }
];

db.careers.insertMany(testCareers);
print('✅ Carreras de prueba creadas');

print('📖 Creando cursos de prueba...');

const testCourses = [
  {
    code: 'INFO101',
    name: 'Introducción a la Programación',
    department: 'Departamento de Informática',
    semester: 1,
    credits: 6,
    teacherId: 'docente1@ucn.cl',
    isActive: true,
    createdAt: new Date()
  },
  {
    code: 'INFO201',
    name: 'Estructura de Datos',
    department: 'Departamento de Informática',
    semester: 3,
    credits: 6,
    teacherId: 'docente2@ucn.cl',
    isActive: true,
    createdAt: new Date()
  },
  {
    code: 'MATE101',
    name: 'Matemáticas I',
    department: 'Departamento de Matemáticas',
    semester: 1,
    credits: 4,
    isActive: true,
    createdAt: new Date()
  }
];

db.courses.insertMany(testCourses);
print('✅ Cursos de prueba creados');

print('⚙️ Creando ajustes de prueba...');

// Obtener IDs de categorías y estudiantes para crear ajustes
const categories = db.categories.find({}).toArray();
const students = db.students.find({}).toArray();

const testAdjustments = [
  {
    studentId: students[0]._id,
    categoryId: categories[0]._id, // Evaluación Diferenciada
    description: 'Evaluación oral para estudiante con déficit atencional',
    status: 'APROBADO',
    priority: 'ALTA',
    courseCode: 'INFO101',
    semester: '2025-1',
    createdBy: 'educadora@ucn.cl',
    approvedBy: 'coordinadora@ucn.cl',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    studentId: students[1]._id,
    categoryId: categories[1]._id, // Tiempo Adicional
    description: '50% tiempo adicional para evaluaciones por dislexia',
    status: 'APROBADO',
    priority: 'MEDIA',
    courseCode: 'MATE101',
    semester: '2025-1',
    createdBy: 'educadora@ucn.cl',
    approvedBy: 'coordinadora@ucn.cl',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    studentId: students[2]._id,
    categoryId: categories[4]._id, // Apoyo Tecnológico
    description: 'Software de lectura de pantalla para discapacidad visual',
    status: 'PENDIENTE',
    priority: 'ALTA',
    courseCode: 'INFO201',
    semester: '2025-1',
    createdBy: 'educadora@ucn.cl',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

db.adjustments.insertMany(testAdjustments);
print('✅ Ajustes de prueba creados');

print('📊 Actualizando estadísticas...');

// Actualizar estadísticas del sistema
db.statistics.updateOne(
  { _id: 'init_stats' },
  {
    $set: {
      totalUsers: testUsers.length,
      totalStudents: testStudents.length,
      totalAdjustments: testAdjustments.length,
      totalDepartments: testDepartments.length,
      totalCareers: testCareers.length,
      totalCourses: testCourses.length,
      lastUpdated: new Date()
    }
  }
);

print('✅ Estadísticas actualizadas');

print('🎉 Datos de prueba completados exitosamente');
print('💡 Sistema listo para testing con:');
print(`   - ${testUsers.length} usuarios de diferentes roles`);
print(`   - ${testStudents.length} estudiantes con NEE`);
print(`   - ${testDepartments.length} departamentos`);
print(`   - ${testCareers.length} carreras`);
print(`   - ${testCourses.length} cursos`);
print(`   - ${testAdjustments.length} ajustes en diferentes estados`);
print('');
print('📧 Credenciales de prueba disponibles:');
print('   - coordinadora@ucn.cl (COORDINADORA)');
print('   - educadora@ucn.cl (EDUCADORA_SOCIAL)');
print('   - diddec@ucn.cl (DIDDEC_STAFF)');
print('   - jefe.carrera@ucn.cl (JEFE_CARRERA)');
print('   - jefe.departamento@ucn.cl (JEFE_DEPARTAMENTO)');
print('   - docente1@ucn.cl, docente2@ucn.cl (DOCENTE)');
print('   - juan.perez@estudiante.ucn.cl (Déficit Atencional)');
print('   - maria.rodriguez@estudiante.ucn.cl (Dislexia)');
print('   - diego.torres@estudiante.ucn.cl (Discapacidad Visual)'); 