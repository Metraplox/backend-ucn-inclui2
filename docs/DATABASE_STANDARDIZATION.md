# Estandarización de Base de Datos UCN INCLUI2

**Última actualización: 10/07/2025**

## 🎯 Objetivo

Eliminar la confusión causada por múltiples nombres de bases de datos y estandarizar todo el backend para usar una sola base de datos MongoDB.

## 📋 Problemas Identificados

Anteriormente, el proyecto tenía referencias inconsistentes a diferentes bases de datos:
- `ucn_inclui2`
- `ucn_inclui2_db` 
- `ucn_inclui2_prod`
- `ucn_inclui2_dev`
- `ucn_inclui2_test`
- `inclui2`

Esto causaba:
- Usuarios creados en una BD pero el backend consultando otra
- Scripts apuntando a BDs incorrectas
- Fallos de autenticación
- Inconsistencias en testing y desarrollo

## ✅ Solución Implementada

### Base de Datos Estándar

**Nombre único**: `ucn_inclui2`

### Cadenas de Conexión Estándar

**Desde Docker (contenedores)**:
```
mongodb://mongodb_prod:27017/ucn_inclui2
```

**Desde host local (desarrollo/scripts)**:
```
mongodb://localhost:27017/ucn_inclui2
```

### Archivos Actualizados

#### Configuración Principal
- ✅ `.env`
- ✅ `.env.example`
- ✅ `docker-compose.yml`
- ✅ `src/app.module.ts` (ya estaba correcto)

#### Scripts de Seeding
- ✅ `seed-database.js` (nuevo seeder oficial)
- ✅ `test-login-quick.js`

#### Scripts de Validación
- ✅ `scripts/production-validation-comprehensive.js`

#### Archivos de Configuración
- ✅ `src/config/database.config.js` (nuevo)

## 🔧 Uso

### Seeder Oficial

```bash
node seed-database.js
```

Este script:
- Se conecta a la BD estándar `ucn_inclui2`
- **NO limpia** usuarios existentes (preserva datos)
- Verifica si cada usuario de prueba ya existe
- **Solo crea** usuarios que no existen (evita duplicados)
- Muestra tabla resumen de usuarios disponibles
- Informa usuarios nuevos vs existentes

**Comportamiento inteligente**:
- Si todos los usuarios existen: 0 nuevos, 7 existentes
- Si faltan usuarios: crea solo los faltantes
- Si la BD está vacía: crea todos los usuarios

### Prueba de Login

```bash
node test-login-quick.js
```

Prueba autenticación de todos los usuarios del seeder.

### Usuarios de Prueba

| Email | Rol | Password |
|-------|-----|----------|
| coordinador@ucn.cl | COORDINADOR | password123 |
| estudiante1@ucn.cl | ESTUDIANTE | password123 |
| docente@ucn.cl | DOCENTE | password123 |
| diddec@ucn.cl | DIDDEC_STAFF | password123 |
| educadora@ucn.cl | EDUCADORA_SOCIAL | password123 |
| jefe.carrera@ucn.cl | JEFE_CARRERA | password123 |
| jefe.departamento@ucn.cl | JEFE_DEPARTAMENTO | password123 |

## 🚨 Reglas Importantes

1. **NO crear más bases de datos** con nombres diferentes
2. **SIEMPRE usar** `ucn_inclui2` como nombre de BD
3. **VALIDAR** que scripts usen las cadenas de conexión estándar
4. **EJECUTAR** `seed-database.js` para asegurar usuarios de prueba (idempotente)
5. **PROBAR** autenticación con `test-login-quick.js`
6. **El seeder es seguro**: no duplica usuarios ni borra datos existentes

## 🔄 Flujo de Desarrollo

1. **Desarrollo local**: Scripts se conectan a `localhost:27017/ucn_inclui2`
2. **Docker**: Backend se conecta a `mongodb_prod:27017/ucn_inclui2`
3. **Seeding**: Ejecutar `node seed-database.js`
4. **Testing**: Ejecutar `node test-login-quick.js`
5. **Validación**: Backend y scripts usan la misma BD

## ✅ Verificación

Para verificar que todo está funcionando:

```bash
# 1. Verificar contenedores
docker ps

# 2. Ejecutar seeder
node seed-database.js

# 3. Probar login
node test-login-quick.js

# 4. Verificar variable de entorno del backend
docker exec nestjs_app_ucn_dge printenv | Select-String MONGO
```

## 📁 Archivos Pendientes de Actualización

Los siguientes archivos aún contienen referencias a bases de datos antiguas y deben actualizarse según sea necesario:

- `scripts/*.js` (varios scripts)
- `src/scripts/*.ts` (scripts TypeScript)
- `README.md` y documentación
- Scripts de backup y restore

**IMPORTANTE**: Solo actualizar estos archivos cuando se vayan a usar, para evitar cambios innecesarios.
