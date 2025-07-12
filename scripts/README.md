# 📜 Scripts del Backend - UCN Inclui2

**Última actualización: 10/07/2025**

Este directorio contiene scripts utilitarios esenciales organizados por categorías para el mantenimiento y despliegue del backend.

## 🎯 Scripts Principales

### 🌱 **Seeding y Testing (Raíz)**
```bash
# Seeder oficial - Poblar usuarios de prueba (idempotente)
node seed-database.js

# Testing de autenticación rápido
node test-login-quick.js
```

### 💾 **Base de Datos**
```bash
# Backup y restore
./scripts/backup-mongodb.sh
./scripts/restore-mongodb.sh

# Crear índices necesarios
node scripts/create-mongodb-indexes.js

# Migración de datos de consentimientos
node scripts/migrate-consents.js

# Verificación de BD
node scripts/verify-database.js
```

### 🏗️ **Build y Producción**
```bash
# Build de producción (Windows)
./scripts/build-production.ps1

# Build de producción (Linux/Mac)  
./scripts/build-production.sh
```

### ✅ **Validación y Testing**
```bash
# Validación exhaustiva de producción (recomendado)
node scripts/production-validation-comprehensive.js

# Validación de entorno de producción
./scripts/validate-production.ps1

# Validación de configuraciones críticas
./scripts/validate-critical-config.ps1
```

### 🔗 **Utilidades Específicas**
```bash
# Crear perfil de estudiante
node scripts/create-student-profile.js

# Vincular estudiante con usuario
node scripts/link-student-to-user.js

# Validar vínculos estudiante-usuario
node scripts/validate-student-user-link.js

# Generar reporte final de endpoints
node scripts/generate-final-endpoints-report.js
```

## 📋 Notas de Uso

### **Puerto y Configuración**
- ✅ **Puerto del backend**: 3001 (configurado en .env)
- ✅ **Base de datos**: ucn_inclui2 (estandarizada)
- ✅ **Usuarios de prueba**: Definidos en seeder oficial

### **Scripts Eliminados**
- Archivos temporales: `temp*.json`, `test-login.json`
- Scripts obsoletos: `load-initial-data.*`
- Scripts duplicados: `complete-system-validation.js`, `production-ready-test.js`

### **Mejores Prácticas**
1. **Usar seeder oficial**: `seed-database.js` es idempotente y no duplica datos
2. **Testing de login**: `test-login-quick.js` para pruebas rápidas
3. **Validación completa**: `production-validation-comprehensive.js` para testing exhaustivo
4. **Backup antes de migraciones**: Usar scripts de backup/restore

### **Estructura Actual (Limpia)**
```
scripts/
├── backup-mongodb.sh
├── build-production.ps1
├── build-production.sh
├── create-mongodb-indexes.js
├── create-student-profile.js
├── generate-final-endpoints-report.js
├── link-student-to-user.js
├── migrate-consents.js
├── production-validation-comprehensive.js
├── README.md
├── restore-mongodb.sh
├── validate-critical-config.ps1
├── validate-production.ps1
├── validate-student-user-link.js
└── verify-database.js
```

## 🔄 Política de Scripts

### **Scripts Permitidos**
- ✅ Backup y restore de BD
- ✅ Build y despliegue
- ✅ Validación y testing
- ✅ Migración de datos específicos
- ✅ Utilidades documentadas

### **Scripts NO Permitidos**
- ❌ Archivos temporales sin documentar
- ❌ Scripts de debugging personal
- ❌ Duplicados de funcionalidad existente
- ❌ Scripts con hardcoded URLs/credentials

### **Antes de Crear Nuevos Scripts**
1. Verificar si la funcionalidad ya existe
2. Documentar propósito y uso
3. Seguir convenciones de nomenclatura
4. Actualizar este README.md

---

**💡 Recordatorio**: Este directorio ha sido limpiado y optimizado. Mantener solo scripts esenciales y documentados.