# CREDENCIALES PARA TESTING - UCN INCLUI2
# ==========================================
# 
# Archivo generado automáticamente para testing exhaustivo
# Fecha: 2025-06-18T23:11:49.764Z
# 
# IMPORTANTE: Este archivo contiene credenciales de testing únicamente
# NO usar en producción

## USUARIOS DEL SISTEMA


### 1. Sin nombre (undefined)
- **Email:** `coordinadora.inclusion@ucn.cl`
- **Password:** `inclui2025`
- **Rol:** undefined

### 2. Sin nombre (undefined)
- **Email:** `educadora.social@ucn.cl`
- **Password:** `inclui2025`
- **Rol:** undefined

### 3. Sin nombre (undefined)
- **Email:** `director.diddec@ucn.cl`
- **Password:** `inclui2025`
- **Rol:** undefined

### 4. Sin nombre (undefined)
- **Email:** `jefe.disc@ucn.cl`
- **Password:** `inclui2025`
- **Rol:** undefined

### 5. Sin nombre (undefined)
- **Email:** `jefe.dii@ucn.cl`
- **Password:** `inclui2025`
- **Rol:** undefined

### 6. Sin nombre (undefined)
- **Email:** `jefe.dim@ucn.cl`
- **Password:** `inclui2025`
- **Rol:** undefined

### 7. Sin nombre (undefined)
- **Email:** `jefe.icci@ucn.cl`
- **Password:** `inclui2025`
- **Rol:** undefined

### 8. Sin nombre (undefined)
- **Email:** `jefe.ici@ucn.cl`
- **Password:** `inclui2025`
- **Rol:** undefined

### 9. Sin nombre (undefined)
- **Email:** `profesor.mat101@ucn.cl`
- **Password:** `inclui2025`
- **Rol:** undefined

### 10. Sin nombre (undefined)
- **Email:** `profesor.fis110@ucn.cl`
- **Password:** `inclui2025`
- **Rol:** undefined

### 11. Sin nombre (undefined)
- **Email:** `profesor.inf100@ucn.cl`
- **Password:** `inclui2025`
- **Rol:** undefined

### 12. Sin nombre (undefined)
- **Email:** `profesor.inf134@ucn.cl`
- **Password:** `inclui2025`
- **Rol:** undefined

### 13. Sin nombre (undefined)
- **Email:** `profesor.inf225@ucn.cl`
- **Password:** `inclui2025`
- **Rol:** undefined

### 14. Sin nombre (undefined)
- **Email:** `profesor.ici201@ucn.cl`
- **Password:** `inclui2025`
- **Rol:** undefined


## ESTUDIANTES DE PRUEBA ADICIONALES

### Estudiante con NEE
- **Email:** `estudiante.nee@alumnos.ucn.cl`
- **Password:** `test123`
- **Características:** Estudiante con necesidades educativas especiales

### Estudiante Regular
- **Email:** `estudiante.regular@alumnos.ucn.cl`
- **Password:** `test123`
- **Características:** Estudiante sin NEE

## CASOS DE PRUEBA RECOMENDADOS

1. **Testing de Autenticación:**
   - Login con cada rol
   - Verificar permisos específicos
   - Probar endpoints protegidos

2. **Testing de Funcionalidades NEE:**
   - Crear ajustes académicos
   - Subir documentos
   - Generar reportes

3. **Testing de Roles:**
   - Coordinador: Acceso completo
   - Educadora Social: Gestión NEE
   - DIDDEC Staff: Reportes y estadísticas
   - Estudiantes: Vista limitada

## ENDPOINTS DE PRUEBA

- **Health Check:** GET /health
- **Login:** POST /auth/login
- **Swagger UI:** GET /api
- **Estudiantes:** GET /students
- **Ajustes:** GET /adjustments

---
Generado por: Sistema de Testing UCN INCLUI2
