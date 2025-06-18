# 🗄️ GUÍA MONGODB LOCAL PARA PRODUCCIÓN
## Proyecto: Plataforma Inclusiva UCN - Base de Datos Local

### 📅 **Última Actualización**: Enero 2025
### 🎯 **Objetivo**: Configurar MongoDB local para entorno de producción autónomo

---

## 🌟 **VENTAJAS DE MONGODB LOCAL EN PRODUCCIÓN**

### **✅ Control Total**
- **Autonomía**: No dependes de servicios externos como Atlas
- **Performance**: Latencia mínima al estar en el mismo servidor
- **Costos**: Sin costos mensuales por servicios cloud
- **Datos**: Control completo sobre backups y migración

### **✅ Seguridad Mejorada**
- **Red Privada**: Base de datos inaccesible desde internet
- **Autenticación**: Credenciales controladas localmente
- **Firewall**: Solo la aplicación puede acceder a la BD

---

## 🏗️ **ARQUITECTURA DE PRODUCCIÓN**

```
┌─────────────────────────────────────┐
│            SERVIDOR CLIENTE         │
├─────────────────────────────────────┤
│  🐳 Docker Container Network        │
│  ┌─────────────┐  ┌─────────────┐  │
│  │   App UCN   │  │  MongoDB    │  │
│  │  (NestJS)   │←→│   Local     │  │
│  │   :3000     │  │   :27017    │  │
│  └─────────────┘  └─────────────┘  │
├─────────────────────────────────────┤
│  📱 Red Externa                     │
│  ┌─────────────┐                    │
│  │ App Móvil   │                    │
│  │ (Flutter)   │                    │
│  └─────────────┘                    │
└─────────────────────────────────────┘
```

---

## 🛠️ **CONFIGURACIÓN TÉCNICA**

### **1. Docker Compose con MongoDB**

El archivo `docker-compose.production.yml` ya incluye:

```yaml
services:
  mongodb:
    image: mongo:7.0
    container_name: ucn_inclui2_mongodb
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=secure_password_123
      - MONGO_INITDB_DATABASE=ucn_inclui2_prod
    volumes:
      - mongodb_data:/data/db
      - ./mongodb-init:/docker-entrypoint-initdb.d
    restart: unless-stopped
    networks:
      - ucn_network

  app:
    environment:
      - MONGODB_URI=mongodb://admin:secure_password_123@mongodb:27017/ucn_inclui2_prod?authSource=admin
    depends_on:
      - mongodb
    networks:
      - ucn_network
```

### **2. Variables de Entorno Actualizadas**

```bash
# .env.production
NODE_ENV=production
PORT=3000

# MongoDB Local (ya no necesitas Atlas)
MONGODB_URI=mongodb://admin:secure_password_123@mongodb:27017/ucn_inclui2_prod?authSource=admin

# JWT
JWT_SECRET=tu-jwt-secret-super-seguro-aqui
JWT_EXPIRES_IN=24h

# Google OAuth (si aplica)
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

---

## 📁 **SCRIPTS DE INICIALIZACIÓN DE BD**

### **Crear Directorio de Inicialización**
```bash
mkdir -p mongodb-init
```

### **Script de Inicialización Principal**
```javascript
// mongodb-init/01-init-database.js
// Inicialización de la base de datos UCN Inclui2

print('🗄️ Iniciando configuración de base de datos UCN Inclui2...');

// Cambiar a la base de datos de la aplicación
db = db.getSiblingDB('ucn_inclui2_prod');

// Crear usuario específico para la aplicación
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

// Crear colecciones básicas con validaciones
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'role', 'isActive'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        role: {
          enum: ['COORDINADORA', 'EDUCADORA_SOCIAL', 'JEFE_CARRERA', 'JEFE_DEPARTAMENTO', 'DOCENTE', 'DIDDEC', 'ESTUDIANTE']
        },
        isActive: {
          bsonType: 'bool'
        }
      }
    }
  }
});

db.createCollection('students');
db.createCollection('adjustments');
db.createCollection('courses');
db.createCollection('careers');
db.createCollection('departments');
db.createCollection('categories');
db.createCollection('documents');
db.createCollection('notifications');
db.createCollection('synclogs');

print('✅ Colecciones básicas creadas con validaciones');

// Crear índices de rendimiento
db.users.createIndex({ email: 1 }, { unique: true });
db.students.createIndex({ rut: 1 }, { unique: true });
db.adjustments.createIndex({ studentId: 1 });
db.adjustments.createIndex({ status: 1 });
db.courses.createIndex({ code: 1 }, { unique: true });
db.notifications.createIndex({ createdAt: 1 });

print('✅ Índices de rendimiento creados');

// Insertar categorías predefinidas
db.categories.insertMany([
  {
    name: 'Evaluación Diferenciada',
    description: 'Ajustes en modalidades de evaluación',
    isActive: true,
    createdAt: new Date()
  },
  {
    name: 'Tiempo Adicional',
    description: 'Extensión de tiempo para evaluaciones',
    isActive: true,
    createdAt: new Date()
  },
  {
    name: 'Material de Apoyo',
    description: 'Uso de material adicional durante evaluaciones',
    isActive: true,
    createdAt: new Date()
  },
  {
    name: 'Ubicación Preferencial',
    description: 'Asignación de asientos específicos',
    isActive: true,
    createdAt: new Date()
  }
]);

print('✅ Categorías predefinidas insertadas');

print('🎉 Inicialización de base de datos completada exitosamente');
```

### **Script de Datos de Prueba (Opcional)**
```javascript
// mongodb-init/02-sample-data.js
// Datos de prueba para desarrollo (OPCIONAL)

print('📊 Insertando datos de prueba...');

db = db.getSiblingDB('ucn_inclui2_prod');

// Usuario coordinadora por defecto
db.users.insertOne({
  email: 'coordinadora@ucn.cl',
  name: 'Coordinadora Sistema',
  role: 'COORDINADORA',
  isActive: true,
  createdAt: new Date(),
  lastLogin: null
});

// Departamento de ejemplo
db.departments.insertOne({
  name: 'Departamento de Informática',
  code: 'INFO',
  isActive: true,
  createdAt: new Date()
});

print('✅ Datos de prueba insertados');
```

---

## 🔧 **SCRIPTS DE ADMINISTRACIÓN**

### **Backup Automatizado**
```bash
#!/bin/bash
# scripts/backup-mongodb.sh

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="ucn_inclui2_backup_${TIMESTAMP}"

echo "🗄️ Iniciando backup de MongoDB..."

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

# Realizar backup
docker exec ucn_inclui2_mongodb mongodump \
  --username admin \
  --password secure_password_123 \
  --authenticationDatabase admin \
  --db ucn_inclui2_prod \
  --out /tmp/backup

# Copiar backup al host
docker cp ucn_inclui2_mongodb:/tmp/backup ./backups/$BACKUP_FILE

# Comprimir backup
cd $BACKUP_DIR
tar -czf "${BACKUP_FILE}.tar.gz" $BACKUP_FILE
rm -rf $BACKUP_FILE

echo "✅ Backup completado: ${BACKUP_FILE}.tar.gz"
```

### **Restauración de Backup**
```bash
#!/bin/bash
# scripts/restore-mongodb.sh

if [ -z "$1" ]; then
    echo "❌ Uso: ./restore-mongodb.sh <archivo_backup.tar.gz>"
    exit 1
fi

BACKUP_FILE=$1
echo "🔄 Restaurando desde: $BACKUP_FILE"

# Extraer backup
tar -xzf $BACKUP_FILE

# Restaurar en MongoDB
docker exec -i ucn_inclui2_mongodb mongorestore \
  --username admin \
  --password secure_password_123 \
  --authenticationDatabase admin \
  --db ucn_inclui2_prod \
  --drop \
  /tmp/restore/

echo "✅ Restauración completada"
```

---

## 📋 **CHECKLIST DE IMPLEMENTACIÓN**

### **Preparación**
- [ ] Crear directorio `mongodb-init/`
- [ ] Copiar scripts de inicialización
- [ ] Actualizar `.env.production` con nueva URI
- [ ] Crear scripts de backup/restore

### **Deployment**
- [ ] Ejecutar `docker-compose -f docker-compose.production.yml up -d`
- [ ] Verificar que MongoDB se inicializa correctamente
- [ ] Verificar conexión de la aplicación
- [ ] Probar funcionalidades básicas

### **Post-Deployment**
- [ ] Configurar backups automáticos
- [ ] Verificar persistencia de datos
- [ ] Documentar credenciales de manera segura
- [ ] Establecer monitoreo básico

---

## 🔐 **SEGURIDAD Y MEJORES PRÁCTICAS**

### **Credenciales Seguras**
```bash
# Generar passwords seguros
openssl rand -base64 32  # Para MONGO_INITDB_ROOT_PASSWORD
openssl rand -base64 24  # Para app_user password
```

### **Firewall (Recomendado)**
```bash
# Solo permitir acceso local a MongoDB
sudo ufw deny 27017
sudo ufw allow from 172.0.0.0/8 to any port 27017
```

### **Monitoreo Básico**
```bash
# Ver logs de MongoDB
docker logs ucn_inclui2_mongodb

# Verificar estado de la BD
docker exec ucn_inclui2_mongodb mongo \
  --username admin \
  --password secure_password_123 \
  --authenticationDatabase admin \
  --eval "db.adminCommand('serverStatus')"
```

---

## 🎯 **PRÓXIMOS PASOS**

1. **✅ Implementar scripts de inicialización**
2. **Probar configuración con Docker Compose**
3. **Configurar backups automáticos**
4. **Documentar procedimientos de mantenimiento**
5. **Actualizar scripts de build de producción**

---

> **💡 Nota**: Esta configuración proporciona una base de datos MongoDB completamente autónoma y controlada localmente, eliminando dependencias externas y mejorando el control sobre los datos. 