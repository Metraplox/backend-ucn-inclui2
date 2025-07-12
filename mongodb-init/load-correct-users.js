// Script simplificado para cargar usuarios con hash correcto
print('🔑 Cargando usuarios para login...');

db = db.getSiblingDB('ucn_inclui2_prod');

// Eliminar usuarios existentes
db.users.deleteMany({});

// Hash correcto para password123 generado con bcrypt rounds 10
const passwordHash = '$2b$10$yrXLCT1OjkUAB.8ZZ6lE9eFaNn8U8bU0Cq7X4Kq3CZX6FGP8Q8VfO';

const users = [
  {
    email: 'coordinador@ucn.cl',
    password: passwordHash,
    nombreCompleto: 'María González',
    nombre: 'María',
    apellido: 'González',
    rut: '12345678-9',
    role: 'COORDINADORA',
    roles: ['COORDINADORA'],
    isActive: true,
    googleId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'educadora@ucn.cl',
    password: passwordHash,
    nombreCompleto: 'Carmen Silva',
    nombre: 'Carmen',
    apellido: 'Silva',
    rut: '12345678-8',
    role: 'EDUCADORA_SOCIAL',
    roles: ['EDUCADORA_SOCIAL'],
    isActive: true,
    googleId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'jefe.carrera@ucn.cl',
    password: passwordHash,
    nombreCompleto: 'Luis Martínez',
    nombre: 'Luis',
    apellido: 'Martínez',
    rut: '12345678-7',
    role: 'JEFE_CARRERA',
    roles: ['JEFE_CARRERA'],
    isActive: true,
    googleId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'jefe.departamento@ucn.cl',
    password: passwordHash,
    nombreCompleto: 'Ana Torres',
    nombre: 'Ana',
    apellido: 'Torres',
    rut: '12345678-6',
    role: 'JEFE_DEPARTAMENTO',
    roles: ['JEFE_DEPARTAMENTO'],
    isActive: true,
    googleId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'docente@ucn.cl',
    password: passwordHash,
    nombreCompleto: 'Pedro Ramírez',
    nombre: 'Pedro',
    apellido: 'Ramírez',
    rut: '12345678-5',
    role: 'DOCENTE',
    roles: ['DOCENTE'],
    isActive: true,
    googleId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'diddec@ucn.cl',
    password: passwordHash,
    nombreCompleto: 'Rosa Mendoza',
    nombre: 'Rosa',
    apellido: 'Mendoza',
    rut: '12345678-4',
    role: 'DIDDEC_STAFF',
    roles: ['DIDDEC_STAFF'],
    isActive: true,
    googleId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'estudiante1@ucn.cl',
    password: passwordHash,
    nombreCompleto: 'Carlos López',
    nombre: 'Carlos',
    apellido: 'López',
    rut: '12345678-3',
    role: 'ESTUDIANTE',
    roles: ['ESTUDIANTE'],
    isActive: true,
    googleId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const result = db.users.insertMany(users);
print(`✅ Usuarios insertados: ${result.insertedIds.length}`);

// Verificar inserción
const userCount = db.users.countDocuments();
print(`📊 Total usuarios en BD: ${userCount}`);

// Mostrar emails para testing
print('📧 Usuarios disponibles para login:');
db.users.find({}, {email: 1, role: 1, _id: 0}).forEach(user => {
  print(`   - ${user.email} (${user.role})`);
});

print('🔑 Contraseña para todos: password123');
print('✅ Carga de usuarios completada');
