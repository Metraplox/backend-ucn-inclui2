# 📁 Scripts del Proyecto UCN Inclui2

## 🎯 **Propósito**
Esta carpeta contiene scripts automatizados para testing, deployment y mantenimiento del sistema UCN Inclui2.

---

## 📋 **Scripts Disponibles**

### **🧪 Testing y Validación**

#### **`advanced-testing.ps1`**
- **Propósito**: Testing exhaustivo de todos los endpoints del sistema
- **Características**:
  - Testing de 37+ endpoints
  - Validación de autenticación JWT
  - Verificación de roles y permisos
  - Testing del sistema de consentimientos
  - Generación de reportes detallados
- **Uso**: `powershell -ExecutionPolicy Bypass -File advanced-testing.ps1`

#### **`test-all-endpoints.ps1`**
- **Propósito**: Testing completo de endpoints principales
- **Características**:
  - Validación de conectividad
  - Testing de endpoints públicos y protegidos
  - Verificación de respuestas de API
- **Uso**: `powershell -ExecutionPolicy Bypass -File test-all-endpoints.ps1`

#### **`validate-production.ps1`**
- **Propósito**: Validación del entorno de producción
- **Características**:
  - Verificación de servicios Docker
  - Validación de base de datos
  - Testing de endpoints críticos
- **Uso**: `powershell -ExecutionPolicy Bypass -File validate-production.ps1`

---

### **🚀 Build y Deployment**

#### **`build-production.ps1`**
- **Propósito**: Build automatizado para producción
- **Características**:
  - Compilación optimizada de NestJS
  - Creación de imagen Docker
  - Validación de build
  - Preparación de entregables
- **Uso**: `powershell -ExecutionPolicy Bypass -File build-production.ps1`

#### **`build-production.sh`**
- **Propósito**: Build para entornos Linux/Unix
- **Características**:
  - Equivalente en bash del script de PowerShell
  - Optimizado para servidores Linux
- **Uso**: `chmod +x build-production.sh && ./build-production.sh`

---

### **💾 Backup y Restauración**

#### **`backup-mongodb.sh`**
- **Propósito**: Backup automatizado de MongoDB
- **Características**:
  - Dump completo de la base de datos
  - Compresión de archivos
  - Timestamping automático
  - Limpieza de backups antiguos
- **Uso**: `chmod +x backup-mongodb.sh && ./backup-mongodb.sh`

#### **`restore-mongodb.sh`**
- **Propósito**: Restauración de backups de MongoDB
- **Características**:
  - Restauración desde archivos de backup
  - Validación de integridad
  - Modo de recuperación segura
- **Uso**: `chmod +x restore-mongodb.sh && ./restore-mongodb.sh [backup-file]`

---

### **🔄 Migración y Mantenimiento**

#### **`migrate-consents.js`**
- **Propósito**: Migración del sistema de consentimientos
- **Características**:
  - Migración de datos de consentimientos antiguos
  - Actualización a formato UCN 2025
  - Validación de datos migrados
- **Uso**: `node migrate-consents.js`

---

## 🔧 **Configuración de Entorno**

### **Prerrequisitos**
- **PowerShell**: Para scripts .ps1 (Windows)
- **Node.js**: Para scripts .js
- **Docker**: Para scripts de deployment
- **MongoDB Tools**: Para scripts de backup

### **Variables de Entorno Requeridas**
```bash
MONGODB_URI=mongodb://admin:secure_password_123@localhost:27017/ucn_inclui2_prod?authSource=admin
JWT_SECRET=[tu-jwt-secret]
NODE_ENV=development|production
```

---

## 📊 **Uso Recomendado**

### **Para Desarrollo**
1. **Testing**: `advanced-testing.ps1`
2. **Validación**: `test-all-endpoints.ps1`

### **Para Producción**
1. **Build**: `build-production.ps1`
2. **Validación**: `validate-production.ps1`
3. **Backup**: `backup-mongodb.sh`

### **Para Mantenimiento**
1. **Migración**: `migrate-consents.js`
2. **Restauración**: `restore-mongodb.sh`

---

## ⚠️ **Consideraciones Importantes**

### **Seguridad**
- Los scripts contienen credenciales de desarrollo
- **NO** usar credenciales de desarrollo en producción
- Revisar y actualizar credenciales antes del deployment

### **Permisos**
- Scripts de PowerShell requieren `ExecutionPolicy Bypass`
- Scripts de bash requieren permisos de ejecución (`chmod +x`)

### **Logging**
- Todos los scripts generan logs detallados
- Revisar salida para identificar errores
- Los reportes se guardan en `/docs/03-testing/`

---

## 🔄 **Mantenimiento de Scripts**

### **Actualización**
- Revisar scripts después de cambios en API
- Actualizar endpoints en testing scripts
- Mantener credenciales sincronizadas

### **Versionado**
- Scripts versionados junto con el proyecto
- Cambios documentados en commits
- Historial disponible en Git

---

**Última actualización**: 18 de Enero 2025  
**Versión del sistema**: UCN Inclui2 V2.0 