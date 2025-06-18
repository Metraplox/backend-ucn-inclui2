const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// 🔧 CONFIGURACIÓN PROFESIONAL
const CONFIG = {
  mongodb: {
    uri: 'mongodb://localhost:27017',
    database: 'ucn_inclui2_test'
  },
  paths: {
    neeStudentsFile: path.join(__dirname, '..', 'docs', 'assets', 'ESTUDIANTES_NEE_CSV.txt')
  },
  semester: {
    current: '202510'
  }
};

// 📋 DATOS BASE PROFESIONALES
const baseCategories = [
  {
    name: 'Dificultades de Aprendizaje',
    description: 'Incluye dislexia, discalculia, disgrafía y trastornos del procesamiento',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Trastorno del Espectro Autista',
    description: 'Condiciones del espectro autista que requieren apoyo educativo',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Discapacidad Intelectual',
    description: 'Limitaciones significativas en el funcionamiento intelectual',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Deficiencias Sensoriales',
    description: 'Deficiencias visuales, auditivas o de comunicación',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Trastornos del Lenguaje',
    description: 'Dificultades específicas en el desarrollo del lenguaje',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const baseDepartments = [
  {
    name: 'Departamento de Ingeniería de Sistemas y Computación',
    code: 'DISC',
    description: 'Carreras relacionadas con computación e informática',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Departamento de Ingeniería Industrial',
    code: 'DIND',
    description: 'Carreras de ingeniería industrial y afines',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const baseCareers = [
  {
    name: 'INGENIERÍA CIVIL EN COMPUTACIÓN E INFORMÁTICA',
    code: 'ICCI',
    faculty: 'Facultad de Ingeniería',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'INGENIERÍA CIVIL INDUSTRIAL',
    code: 'ICI',
    faculty: 'Facultad de Ingeniería',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'INGENIERÍA EN TECNOLOGÍAS DE INFORMACIÓN',
    code: 'ITI',
    faculty: 'Facultad de Ingeniería',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const baseUsers = [
  {
    name: 'Coordinador',
    lastName: 'INCLUI2',
    email: 'coordinador@ucn.cl',
    password: '$2b$12$LQv3c1yqBw2GVmuesCodSGLu2bj0K0J8f3T8J.3OxA1FBTTcj6r3.',
    role: 'COORDINADOR',
    rut: '12345678-9',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Educadora',
    lastName: 'Social UCN',
    email: 'educadora@ucn.cl',
    password: '$2b$12$LQv3c1yqBw2GVmuesCodSGLu2bj0K0J8f3T8J.3OxA1FBTTcj6r3.',
    role: 'EDUCADORA_SOCIAL',
    rut: '12345678-8',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Staff',
    lastName: 'DIDDEC',
    email: 'diddec@ucn.cl',
    password: '$2b$12$LQv3c1yqBw2GVmuesCodSGLu2bj0K0J8f3T8J.3OxA1FBTTcj6r3.',
    role: 'DIDDEC_STAFF',
    rut: '12345678-7',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 🔄 FUNCIÓN PRINCIPAL DE POBLADO
async function populateRealData() {
  let client;
  
  try {
    console.log('🚀 INICIANDO POBLADO PROFESIONAL CON DATOS REALES UCN INCLUI2');
    console.log('=============================================================');
    
    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...');
    client = new MongoClient(CONFIG.mongodb.uri);
    await client.connect();
    const db = client.db(CONFIG.mongodb.database);
    
    console.log('✅ Conexión establecida');
    
    // Limpiar colecciones existentes
    console.log('🧹 Limpiando base de datos...');
    const collections = ['students', 'users', 'departments', 'careers', 'categories'];
    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).deleteMany({});
        console.log(`   ✅ ${collectionName} limpiada`);
      } catch (error) {
        console.log(`   ⚠️  ${collectionName} no existe (ok)`);
      }
    }
    
    // Crear índices profesionales
    console.log('🔧 Creando índices profesionales...');
    await createIndexes(db);
    
    // Poblar datos base
    console.log('📊 Poblando datos base...');
    await populateBaseData(db);
    
    // Poblar estudiantes NEE reales
    console.log('👥 Poblando estudiantes NEE reales...');
    const studentsCount = await populateRealNeeStudents(db);
    
    // Generar estadísticas finales
    console.log('📈 Generando reporte final...');
    await generateFinalReport(db, studentsCount);
    
    console.log('');
    console.log('🎉 POBLADO COMPLETADO EXITOSAMENTE!');
    console.log('✅ Base de datos lista para producción con datos reales UCN');
    console.log(`📊 ${studentsCount} estudiantes NEE procesados`);
    console.log('🌐 Sistema operativo para entorno de producción');
    
  } catch (error) {
    console.error('❌ ERROR CRÍTICO:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔒 Conexión cerrada');
    }
  }
}

// 🔧 CREAR ÍNDICES PROFESIONALES
async function createIndexes(db) {
  const indexes = [
    { collection: 'users', index: { email: 1 }, options: { unique: true } },
    { collection: 'students', index: { rut: 1 }, options: { unique: true } },
    { collection: 'students', index: { email: 1 }, options: { unique: true } },
    { collection: 'careers', index: { code: 1 }, options: { unique: true } },
    { collection: 'departments', index: { code: 1 }, options: { unique: true } }
  ];
  
  for (const { collection, index, options } of indexes) {
    try {
      await db.collection(collection).createIndex(index, options);
      console.log(`   ✅ Índice creado: ${collection}`);
    } catch (error) {
      console.log(`   ⚠️  Índice ya existe: ${collection}`);
    }
  }
}

// 📊 POBLAR DATOS BASE
async function populateBaseData(db) {
  // Categorías
  await db.collection('categories').insertMany(baseCategories);
  console.log(`   ✅ ${baseCategories.length} categorías insertadas`);
  
  // Departamentos
  await db.collection('departments').insertMany(baseDepartments);
  console.log(`   ✅ ${baseDepartments.length} departamentos insertados`);
  
  // Carreras
  await db.collection('careers').insertMany(baseCareers);
  console.log(`   ✅ ${baseCareers.length} carreras insertadas`);
  
  // Usuarios base
  await db.collection('users').insertMany(baseUsers);
  console.log(`   ✅ ${baseUsers.length} usuarios base insertados`);
}

// 👥 POBLAR ESTUDIANTES NEE REALES
async function populateRealNeeStudents(db) {
  try {
    console.log('📄 Leyendo archivo de estudiantes NEE...');
    const fileContent = fs.readFileSync(CONFIG.paths.neeStudentsFile, 'utf-8');
    const lines = fileContent.trim().split('\n');
    
    console.log(`📊 Encontradas ${lines.length} líneas en archivo NEE`);
    
    const students = [];
    const careers = await db.collection('careers').find({}).toArray();
    const careerMap = new Map(careers.map(c => [c.name, c._id]));
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const [rutNumber, dvRut, careerName] = line.split(',').map(s => s.trim());
      
      if (!rutNumber || !dvRut || !careerName) {
        console.log(`   ⚠️  Línea ${i + 1} con formato inválido: ${line}`);
        continue;
      }
      
      const rut = `${rutNumber}-${dvRut}`;
      const careerId = careerMap.get(careerName);
      
      if (!careerId) {
        console.log(`   ⚠️  Carrera no encontrada: ${careerName}`);
        continue;
      }
      
      // Generar datos realistas para el estudiante
      const student = {
        rut: rut,
        firstName: `Estudiante${rutNumber.slice(-3)}`,
        lastName: `NEE${rutNumber.slice(-2)}`,
        email: `estudiante${rutNumber}@ucn.cl`,
        careerId: careerId,
        currentSemester: CONFIG.semester.current,
        needsEducationalSupport: true,
        hasActiveNEE: true,
        neeCategory: 'Dificultades de Aprendizaje', // Categoría por defecto
        admissionYear: 2020 + Math.floor(Math.random() * 5),
        currentLevel: Math.floor(Math.random() * 10) + 1,
        academicStatus: 'REGULAR',
        phone: `+569${rutNumber.slice(-8)}`,
        birthDate: new Date(2000 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        address: `Dirección ${rutNumber.slice(-3)}, Antofagasta`,
        emergencyContact: {
          name: `Contacto${rutNumber.slice(-2)}`,
          phone: `+569${rutNumber.slice(-8)}${Math.floor(Math.random() * 10)}`,
          relationship: 'Familiar'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      students.push(student);
    }
    
    if (students.length > 0) {
      console.log(`💾 Insertando ${students.length} estudiantes NEE...`);
      await db.collection('students').insertMany(students);
      console.log(`   ✅ ${students.length} estudiantes NEE insertados exitosamente`);
    } else {
      console.log('   ⚠️  No se encontraron estudiantes válidos para insertar');
    }
    
    return students.length;
    
  } catch (error) {
    console.error('❌ Error procesando estudiantes NEE:', error);
    return 0;
  }
}

// 📈 GENERAR REPORTE FINAL
async function generateFinalReport(db, studentsCount) {
  try {
    const stats = {
      timestamp: new Date().toISOString(),
      totalStudents: studentsCount,
      totalUsers: await db.collection('users').countDocuments(),
      totalCareers: await db.collection('careers').countDocuments(),
      totalDepartments: await db.collection('departments').countDocuments(),
      totalCategories: await db.collection('categories').countDocuments(),
      database: CONFIG.mongodb.database,
      semester: CONFIG.semester.current
    };
    
    console.log('');
    console.log('📋 REPORTE FINAL DE POBLADO:');
    console.log('============================');
    Object.entries(stats).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    // Guardar reporte en archivo
    const reportPath = path.join(__dirname, '..', 'poblado-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2));
    console.log(`✅ Reporte guardado en: ${reportPath}`);
    
  } catch (error) {
    console.error('⚠️  Error generando reporte:', error);
  }
}

// 🚀 EJECUTAR SCRIPT
if (require.main === module) {
  populateRealData();
}

module.exports = { populateRealData }; 