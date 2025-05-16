const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Función para generar hash de contraseñas
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Función para generar un ObjectId
function generateObjectId() {
  return new ObjectId();
}

// Función principal para poblar la base de datos
async function seedDatabase() {
  try {
    await client.connect();
    console.log('Conectado a MongoDB');
    
    const db = client.db();
    
    // Limpiar colecciones existentes
    await db.collection('users').deleteMany({});
    await db.collection('students').deleteMany({});
    await db.collection('courses').deleteMany({});
    await db.collection('adjustments').deleteMany({});
    await db.collection('documents').deleteMany({});
    
    console.log('Colecciones limpiadas');
    
    // Crear usuarios
    const adminId = generateObjectId();
    const staffId = generateObjectId();
    const studentId = generateObjectId();
    const student2Id = generateObjectId();
    
    const users = [
      {
        _id: adminId,
        email: 'admin@ucn.cl',
        password: await hashPassword('admin123'),
        roles: ['ADMIN'],
        name: 'Administrador UCN',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: staffId,
        email: 'staff@ucn.cl',
        password: await hashPassword('staff123'),
        roles: ['STAFF'],
        name: 'Coordinador UCN',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: studentId,
        email: 'estudiante@ucn.cl',
        password: await hashPassword('estudiante123'),
        roles: ['STUDENT'],
        name: 'Juan Pérez',
        studentProfileId: studentId, // Referencia al perfil de estudiante
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: student2Id,
        email: 'estudiante2@ucn.cl',
        password: await hashPassword('estudiante123'),
        roles: ['STUDENT'],
        name: 'María González',
        studentProfileId: student2Id, // Referencia al perfil de estudiante
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('users').insertMany(users);
    console.log('Usuarios creados');
    
    // Crear perfiles de estudiantes
    const students = [
      {
        _id: studentId,
        rut: '12345678-9',
        nombres: 'Juan',
        apellidos: 'Pérez',
        email: 'estudiante@ucn.cl',
        carrera: 'Ingeniería Civil en Computación e Informática',
        fechaNacimiento: new Date('2000-05-15'),
        informacionContacto: '+56912345678',
        necesidadesEducativasEspeciales: 'Dislexia',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: student2Id,
        rut: '98765432-1',
        nombres: 'María',
        apellidos: 'González',
        email: 'estudiante2@ucn.cl',
        carrera: 'Ingeniería Civil Industrial',
        fechaNacimiento: new Date('2001-03-22'),
        informacionContacto: '+56987654321',
        necesidadesEducativasEspeciales: 'TDAH',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('students').insertMany(students);
    console.log('Perfiles de estudiantes creados');
    
    // Crear cursos
    const course1Id = generateObjectId();
    const course2Id = generateObjectId();
    const course3Id = generateObjectId();
    
    const courses = [
      {
        _id: course1Id,
        nombre: 'Cálculo I',
        codigo: 'MAT101',
        nrc: 'MAT101-1',
        semestre: '2025-1',
        profesor: 'Juan Pérez',
        descripcion: 'Curso de cálculo diferencial e integral',
        estudiantes: [studentId, student2Id],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: course2Id,
        nombre: 'Física I',
        codigo: 'FIS101',
        nrc: 'FIS101-1',
        semestre: '2025-1',
        profesor: 'María González',
        descripcion: 'Curso de física mecánica',
        estudiantes: [studentId],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: course3Id,
        nombre: 'Programación',
        codigo: 'ICI101',
        nrc: 'ICI101-1',
        semestre: '2025-1',
        profesor: 'Pedro Sánchez',
        descripcion: 'Curso de introducción a la programación',
        estudiantes: [student2Id],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('courses').insertMany(courses);
    console.log('Cursos creados');
    
    // Crear documentos
    const doc1Id = generateObjectId();
    const doc2Id = generateObjectId();
    const doc3Id = generateObjectId();
    
    const documents = [
      {
        _id: doc1Id,
        studentId: studentId,
        documentType: 'informe_medico',
        description: 'Informe médico de dislexia',
        category: 'MEDICO',
        fileNameOriginal: 'informe_dislexia.pdf',
        storageFileName: 'informe_dislexia-123456.pdf',
        filePath: '/uploads/informe_dislexia-123456.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024000,
        uploadedBy: staffId,
        uploadDate: new Date('2025-03-15'),
        status: 'VERIFICADO',
        verifiedBy: adminId,
        verificationDate: new Date('2025-03-16'),
        comments: 'Documento verificado correctamente',
        fileUrl: 'http://localhost:3000/documents/informe_dislexia-123456.pdf/download',
        createdAt: new Date('2025-03-15'),
        updatedAt: new Date('2025-03-16')
      },
      {
        _id: doc2Id,
        studentId: student2Id,
        documentType: 'certificado_discapacidad',
        description: 'Certificado de TDAH',
        category: 'LEGAL',
        fileNameOriginal: 'certificado_tdah.pdf',
        storageFileName: 'certificado_tdah-789012.pdf',
        filePath: '/uploads/certificado_tdah-789012.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 2048000,
        uploadedBy: student2Id,
        uploadDate: new Date('2025-04-10'),
        status: 'PENDIENTE',
        fileUrl: 'http://localhost:3000/documents/certificado_tdah-789012.pdf/download',
        createdAt: new Date('2025-04-10'),
        updatedAt: new Date('2025-04-10')
      },
      {
        _id: doc3Id,
        studentId: studentId,
        documentType: 'consentimiento',
        description: 'Consentimiento para ajustes académicos',
        category: 'LEGAL',
        fileNameOriginal: 'consentimiento.pdf',
        storageFileName: 'consentimiento-345678.pdf',
        filePath: '/uploads/consentimiento-345678.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 512000,
        uploadedBy: studentId,
        uploadDate: new Date('2025-04-05'),
        status: 'VERIFICADO',
        verifiedBy: staffId,
        verificationDate: new Date('2025-04-06'),
        comments: 'Consentimiento verificado',
        fileUrl: 'http://localhost:3000/documents/consentimiento-345678.pdf/download',
        createdAt: new Date('2025-04-05'),
        updatedAt: new Date('2025-04-06')
      }
    ];
    
    await db.collection('documents').insertMany(documents);
    console.log('Documentos creados');
    
    // Crear ajustes académicos
    const adjustment1Id = generateObjectId();
    const adjustment2Id = generateObjectId();
    
    const adjustments = [
      {
        _id: adjustment1Id,
        studentRut: '12345678-9',
        studentId: studentId,
        currentAdjustments: [
          {
            type: 'tiempo_extra',
            courseNrc: 'MAT101-1',
            courseId: course1Id,
            approvedBy: staffId,
            approvedAt: new Date('2025-04-10'),
            fechaInicio: new Date('2025-04-15'),
            requiresSemesterConfirmation: true,
            expirationDate: new Date('2025-12-31'),
            estado: 'ACTIVO',
            comentarios: '30 minutos adicionales en evaluaciones'
          },
          {
            type: 'material_adaptado',
            courseNrc: 'FIS101-1',
            courseId: course2Id,
            approvedBy: staffId,
            approvedAt: new Date('2025-04-10'),
            fechaInicio: new Date('2025-04-15'),
            requiresSemesterConfirmation: true,
            expirationDate: new Date('2025-12-31'),
            estado: 'ACTIVO',
            comentarios: 'Material en formato digital accesible'
          }
        ],
        history: [
          {
            type: 'tiempo_extra',
            status: 'aprobado',
            requestedBy: 'estudiante@ucn.cl',
            reviewedBy: 'staff@ucn.cl',
            timestamp: new Date('2025-04-10'),
            comments: 'Aprobado por alta necesidad'
          }
        ],
        semester: '2025-1',
        documentosAsociados: [doc1Id, doc3Id],
        createdAt: new Date('2025-04-10'),
        updatedAt: new Date('2025-04-10')
      },
      {
        _id: adjustment2Id,
        studentRut: '98765432-1',
        studentId: student2Id,
        currentAdjustments: [
          {
            type: 'ubicacion_preferente',
            courseNrc: 'MAT101-1',
            courseId: course1Id,
            approvedBy: adminId,
            approvedAt: new Date('2025-04-12'),
            fechaInicio: new Date('2025-04-15'),
            requiresSemesterConfirmation: false,
            expirationDate: new Date('2025-12-31'),
            estado: 'ACTIVO',
            comentarios: 'Ubicación en primera fila'
          }
        ],
        history: [],
        semester: '2025-1',
        documentosAsociados: [doc2Id],
        createdAt: new Date('2025-04-12'),
        updatedAt: new Date('2025-04-12')
      }
    ];
    
    await db.collection('adjustments').insertMany(adjustments);
    console.log('Ajustes académicos creados');
    
    console.log('Base de datos poblada exitosamente');
  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
  } finally {
    await client.close();
    console.log('Conexión a MongoDB cerrada');
  }
}

// Ejecutar la función principal
seedDatabase()
  .catch(console.error);
