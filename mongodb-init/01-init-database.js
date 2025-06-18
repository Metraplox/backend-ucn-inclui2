// 🗄️ Script de Inicialización de Base de Datos UCN Inclui2
// Este script se ejecuta automáticamente cuando MongoDB se inicia por primera vez

print('🗄️ Iniciando configuración de base de datos UCN Inclui2...');

// Cambiar a la base de datos de la aplicación
db = db.getSiblingDB('ucn_inclui2_prod');

// Crear usuario específico para la aplicación con permisos limitados
db.createUser({
  user: 'ucn_app_user',
  pwd: 'app_secure_password_456',
  roles: [
    {
      role: 'readWrite',
      db: 'ucn_inclui2_prod'
    }
  ]
});

print('✅ Usuario de aplicación creado: ucn_app_user');

// Crear colecciones básicas con validaciones de esquema
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'role', 'isActive'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Email válido requerido'
        },
        role: {
          enum: ['COORDINADORA', 'EDUCADORA_SOCIAL', 'JEFE_CARRERA', 'JEFE_DEPARTAMENTO', 'DOCENTE', 'DIDDEC', 'ESTUDIANTE'],
          description: 'Rol debe ser uno de los valores permitidos'
        },
        isActive: {
          bsonType: 'bool',
          description: 'Estado activo debe ser booleano'
        },
        name: {
          bsonType: 'string',
          description: 'Nombre del usuario'
        },
        rut: {
          bsonType: 'string',
          description: 'RUT del usuario'
        }
      }
    }
  }
});

db.createCollection('students', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['rut', 'name', 'email'],
      properties: {
        rut: {
          bsonType: 'string',
          pattern: '^[0-9]{7,8}-[0-9kK]$',
          description: 'RUT debe tener formato válido'
        },
        name: {
          bsonType: 'string',
          minLength: 2,
          description: 'Nombre es requerido'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Email válido requerido'
        }
      }
    }
  }
});

db.createCollection('adjustments', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['studentId', 'categoryId', 'status', 'description'],
      properties: {
        status: {
          enum: ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'EN_REVISION'],
          description: 'Estado debe ser uno de los valores permitidos'
        },
        priority: {
          enum: ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'],
          description: 'Prioridad debe ser uno de los valores permitidos'
        }
      }
    }
  }
});

// Crear otras colecciones básicas
db.createCollection('courses');
db.createCollection('careers');
db.createCollection('departments');
db.createCollection('categories');
db.createCollection('documents');
db.createCollection('notifications');
db.createCollection('synclogs');

print('✅ Colecciones básicas creadas con validaciones de esquema');

// Crear índices de rendimiento y unicidad
print('📊 Creando índices de rendimiento...');

// Índices únicos
db.users.createIndex({ email: 1 }, { unique: true, name: 'idx_users_email_unique' });
db.students.createIndex({ rut: 1 }, { unique: true, name: 'idx_students_rut_unique' });
db.courses.createIndex({ code: 1 }, { unique: true, name: 'idx_courses_code_unique' });

// Índices de rendimiento
db.adjustments.createIndex({ studentId: 1 }, { name: 'idx_adjustments_student' });
db.adjustments.createIndex({ status: 1 }, { name: 'idx_adjustments_status' });
db.adjustments.createIndex({ categoryId: 1 }, { name: 'idx_adjustments_category' });
db.adjustments.createIndex({ createdAt: 1 }, { name: 'idx_adjustments_created' });

db.notifications.createIndex({ createdAt: 1 }, { name: 'idx_notifications_created' });
db.notifications.createIndex({ userId: 1 }, { name: 'idx_notifications_user' });
db.notifications.createIndex({ isRead: 1 }, { name: 'idx_notifications_read' });

db.documents.createIndex({ adjustmentId: 1 }, { name: 'idx_documents_adjustment' });
db.documents.createIndex({ uploadedBy: 1 }, { name: 'idx_documents_uploader' });

// Índices compuestos
db.adjustments.createIndex({ studentId: 1, status: 1 }, { name: 'idx_adjustments_student_status' });
db.adjustments.createIndex({ categoryId: 1, status: 1 }, { name: 'idx_adjustments_category_status' });

print('✅ Índices de rendimiento creados');

// Insertar categorías predefinidas del sistema
print('📝 Insertando categorías predefinidas...');

db.categories.insertMany([
  {
    name: 'Evaluación Diferenciada',
    description: 'Ajustes en modalidades de evaluación según las necesidades del estudiante',
    isActive: true,
    createdAt: new Date(),
    examples: ['Evaluación oral en lugar de escrita', 'Formato de pregunta múltiple', 'Evaluación práctica']
  },
  {
    name: 'Tiempo Adicional',
    description: 'Extensión de tiempo para evaluaciones y actividades académicas',
    isActive: true,
    createdAt: new Date(),
    examples: ['50% más de tiempo en evaluaciones', 'Tiempo extra en presentaciones', 'Pausas durante exámenes']
  },
  {
    name: 'Material de Apoyo',
    description: 'Uso de material adicional durante evaluaciones y clases',
    isActive: true,
    createdAt: new Date(),
    examples: ['Calculadora en evaluaciones', 'Formularios de referencia', 'Diccionario especializado']
  },
  {
    name: 'Ubicación Preferencial',
    description: 'Asignación de asientos específicos y condiciones ambientales',
    isActive: true,
    createdAt: new Date(),
    examples: ['Primera fila', 'Cerca del docente', 'Ambiente con menos distracciones']
  },
  {
    name: 'Apoyo Tecnológico',
    description: 'Uso de herramientas tecnológicas de apoyo',
    isActive: true,
    createdAt: new Date(),
    examples: ['Software de lectura', 'Grabadora de audio', 'Computador personal']
  },
  {
    name: 'Metodología Adaptada',
    description: 'Adaptaciones en metodologías de enseñanza',
    isActive: true,
    createdAt: new Date(),
    examples: ['Explicaciones visuales', 'Instrucciones paso a paso', 'Ejemplos concretos']
  }
]);

print('✅ Categorías predefinidas insertadas');

// Crear configuración inicial del sistema
print('⚙️ Creando configuración inicial...');

db.createCollection('system_config');
db.system_config.insertOne({
  _id: 'app_settings',
  version: '1.0.0',
  initialized: true,
  initDate: new Date(),
  settings: {
    maxFileUploadSize: 10485760, // 10MB
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
    notificationRetentionDays: 90,
    autoBackupEnabled: true,
    backupFrequencyHours: 24
  }
});

print('✅ Configuración inicial creada');

// Crear estadísticas iniciales
db.createCollection('statistics');
db.statistics.insertOne({
  _id: 'init_stats',
  totalUsers: 0,
  totalStudents: 0,
  totalAdjustments: 0,
  lastUpdated: new Date(),
  createdAt: new Date()
});

print('📊 Estadísticas iniciales creadas');

print('🎉 Inicialización de base de datos completada exitosamente');
print('📋 Resumen de configuración:');
print('   - Base de datos: ucn_inclui2_prod');
print('   - Usuario aplicación: ucn_app_user');
print('   - Colecciones creadas: 11');
print('   - Índices creados: 12');
print('   - Categorías predefinidas: 6');
print('   - Sistema configurado y listo para uso'); 