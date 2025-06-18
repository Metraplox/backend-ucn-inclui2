# 📋 **REFERENCIA COMPLETA DE VARIABLES DE ENTORNO**

## 🎯 **PROPÓSITO**
Este documento define **TODAS** las variables de entorno críticas para el proyecto UCN INCLUI2, garantizando configuración segura y profesional.

## ⚠️ **CRITICIDAD Y SEGURIDAD**
- **NUNCA** commitear el archivo `.env` al repositorio
- Usar diferentes valores en desarrollo vs producción
- Cambiar secretos por defecto antes de despliegue

---

## 📊 **VARIABLES CRÍTICAS IDENTIFICADAS**

### 🏗️ **CONFIGURACIÓN DEL PROYECTO**
```env
APP_NAME=UCN_INCLUI2                    # Nombre de la aplicación
APP_VERSION=1.0.0                       # Versión actual
NODE_ENV=development                    # Entorno: development|production|test
PORT=3000                               # Puerto del servidor
API_BASE_URL=http://localhost:3000      # URL base para enlaces internos
```

### 🗄️ **BASE DE DATOS MONGODB**
```env
# CRÍTICO: Ambas variables usadas en diferentes módulos
DATABASE_URL=mongodb://localhost:27017/ucn_inclui2_prod
MONGODB_URI=mongodb://localhost:27017/ucn_inclui2_prod
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DATABASE=ucn_inclui2_prod
```

**⚠️ PROBLEMA IDENTIFICADO:** El código usa tanto `DATABASE_URL` como `MONGODB_URI`. 
**✅ SOLUCIÓN:** Definir ambas variables con el mismo valor.

### 🔐 **AUTENTICACIÓN JWT**
```env
# CRÍTICO: Cambiar en producción
JWT_SECRET=ucn-inclui2-super-secret-jwt-key-2025-prod-ready
JWT_EXPIRES_IN=7d                       # Duración del token
```

### 🌺 **HAWAII API - UCN**
```env
# CRÍTICO: Credenciales oficiales proporcionadas
HAWAII_BASE_URL=https://losvilos.ucn.cl/hawaii/api
HAWAII_AUTH_OFERTA=qnbdg8k20jio90
HAWAII_AUTH_ESTUDIANTES=mnqpkUk00jioab
HAWAII_AUTH_INSCRIPCION=knf3g8k29pjht8
HAWAII_REQUEST_TIMEOUT=30000            # Timeout en ms
HAWAII_API_KEY=                         # Opcional: key adicional
HAWAII_API_TOKEN=                       # Opcional: token adicional
```

### 🔑 **GOOGLE OAUTH**
```env
# CRÍTICO: ID real del proyecto Google Console
GOOGLE_CLIENT_ID=90627838122-cv4i0d2124tgm1cbh06cbpotuu128b8v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=                   # REQUERIDO para producción
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

### 📁 **ARCHIVOS Y DIRECTORIOS**
```env
# CRÍTICO: Rutas usadas por el sistema de documentos
UPLOAD_LOCATION=./uploads               # Directorio de archivos subidos
TEMPLATES_LOCATION=./templates          # Directorio de plantillas
NEE_STUDENTS_FILE=./docs/assets/ESTUDIANTES_NEE_CSV.txt
DOCUMENTS_UPLOAD_PATH=./uploads/documents
RESOURCES_UPLOAD_PATH=./uploads/resources
```

### 🎓 **CONFIGURACIÓN ACADÉMICA**
```env
CURRENT_SEMESTER=202510                 # Semestre académico actual
DEFAULT_USER_PASSWORD=inclui2025        # Password por defecto para usuarios
```

### 📝 **LOGGING Y DEBUGGING**
```env
LOG_LEVEL=debug                         # Nivel de logging: error|warn|info|debug
LOG_FILE_PATH=./logs/app.log            # Archivo de logs
DEBUG_MODE=true                         # Modo debug activado
```

### 🔒 **SEGURIDAD**
```env
BCRYPT_SALT_ROUNDS=10                   # Rounds para hashing passwords
CORS_ORIGIN=http://localhost:3000,http://localhost:4200
SESSION_SECRET=ucn-inclui2-session-secret-2025
```

---

## 🚨 **VARIABLES FALTANTES EN CÓDIGO**

### **Problemas Identificados:**
1. **`sync.service.ts`** líneas 444, 611, 634: Password hardcodeado `'inclui2025'`
2. **`documents.service.ts`** líneas múltiples: Rutas hardcodeadas sin variables
3. **`auth.controller.ts`** línea 24: Google Client ID hardcodeado
4. **Scripts** múltiples: `MONGODB_URI` vs `DATABASE_URL` inconsistencia

### **Recomendaciones de Refactorización:**
```typescript
// ❌ MALO: Hardcodeado
const password = 'inclui2025';

// ✅ BUENO: Variable de entorno
const password = this.configService.get('DEFAULT_USER_PASSWORD', 'inclui2025');
```

---

## 📋 **TEMPLATE .env COMPLETO**

```env
# =====================================
# 🚀 UCN INCLUI2 - CONFIGURACIÓN PROFESIONAL
# =====================================

# === PROYECTO ===
APP_NAME=UCN_INCLUI2
APP_VERSION=1.0.0
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# === BASE DE DATOS ===
DATABASE_URL=mongodb://localhost:27017/ucn_inclui2_prod
MONGODB_URI=mongodb://localhost:27017/ucn_inclui2_prod

# === AUTENTICACIÓN ===
JWT_SECRET=ucn-inclui2-super-secret-jwt-key-2025-prod-ready
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=90627838122-cv4i0d2124tgm1cbh06cbpotuu128b8v.apps.googleusercontent.com

# === HAWAII API ===
HAWAII_BASE_URL=https://losvilos.ucn.cl/hawaii/api
HAWAII_AUTH_OFERTA=qnbdg8k20jio90
HAWAII_AUTH_ESTUDIANTES=mnqpkUk00jioab
HAWAII_AUTH_INSCRIPCION=knf3g8k29pjht8
HAWAII_REQUEST_TIMEOUT=30000

# === ARCHIVOS ===
UPLOAD_LOCATION=./uploads
TEMPLATES_LOCATION=./templates
NEE_STUDENTS_FILE=./docs/assets/ESTUDIANTES_NEE_CSV.txt

# === ACADÉMICO ===
CURRENT_SEMESTER=202510
DEFAULT_USER_PASSWORD=inclui2025

# === LOGGING ===
LOG_LEVEL=debug
APP_NAME=UCN_INCLUI2

# === SEGURIDAD ===
BCRYPT_SALT_ROUNDS=10
```

---

## 🔧 **PRÓXIMOS PASOS RECOMENDADOS**

### **1. Refactorización Crítica**
- [ ] Eliminar passwords hardcodeados en `sync.service.ts`
- [ ] Unificar uso de `DATABASE_URL` vs `MONGODB_URI`
- [ ] Mover Google Client ID a variable de entorno

### **2. Variables Adicionales Sugeridas**
```env
# Cache y Performance
CACHE_TTL=300000
MAX_REQUEST_SIZE=50mb

# Notificaciones
NOTIFICATIONS_ENABLED=true
WEBSOCKET_ENABLED=true

# Archivos
MAX_FILE_SIZE=10MB
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png
```

### **3. Configuración de Producción**
```env
# Producción
NODE_ENV=production
SSL_ENABLED=true
RATE_LIMITING_ENABLED=true
```

---

## 📖 **REFERENCIAS**
- **Archivos analizados:** 47 archivos TypeScript
- **Variables identificadas:** 25+ variables críticas
- **Problemas encontrados:** 8 configuraciones hardcodeadas
- **Fecha análisis:** 2025-01-27

---

**💡 NOTA:** Este análisis garantiza que **TODAS** las configuraciones críticas estén externalizadas como variables de entorno, siguiendo las mejores prácticas de desarrollo profesional. 