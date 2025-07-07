# 👥 USUARIOS DE PRUEBA - UCN INCLUI2

**Última actualización: 06/07/2025**

## 🔐 CREDENCIALES DE DESARROLLO

### 👨‍💼 **PERSONAL ADMINISTRATIVO**

#### **Coordinador de Carrera**
```
Email: coordinador@ucn.cl
Password: password123
Roles: COORDINADOR
Acceso: Gestión de estudiantes de su carrera
```

#### **Educadora Social**
```
Email: educadora@ucn.cl
Password: password123
Roles: EDUCADORA_SOCIAL
Acceso: Gestión de ajustes académicos
```

#### **Personal DIDDEC**
```
Email: diddec@ucn.cl
Password: password123
Roles: DIDDEC_STAFF
Acceso: Reportes y estadísticas completas
```

#### **Jefe de Departamento**
```
Email: jefe.informatica@ucn.cl
Password: password123
Roles: JEFE_DEPARTAMENTO
Acceso: Gestión departamental
```

### 👨‍🏫 **DOCENTES**

#### **Docente de Prueba**
```
Email: docente@ucn.cl
Password: password123
Roles: DOCENTE
Acceso: Ver ajustes de sus cursos
```

### 👨‍🎓 **ESTUDIANTES**

#### **Estudiante con NEE**
```
Email: estudiante@alumnos.ucn.cl
Password: password123
Roles: ESTUDIANTE
Acceso: Ver su perfil y ajustes
```

#### **Estudiante Test**
```
Email: juan.perez@alumnos.ucn.cl
Password: 15011990 (fecha nacimiento: 15/01/1990)
Roles: ESTUDIANTE
Acceso: Perfil básico
```

---

## 🧪 TESTING DE ENDPOINTS

### 🔐 **Obtener Token de Autenticación**

```bash
# Login con coordinador
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coordinador@ucn.cl",
    "password": "password123"
  }'

# Respuesta esperada:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "email": "coordinador@ucn.cl",
    "roles": ["COORDINADOR"]
  }
}
```

### 📊 **Endpoints de Prueba**

```bash
# Obtener estudiantes (requiere token)
curl -X GET http://localhost:3000/students \
  -H "Authorization: Bearer TU_TOKEN_AQUI"

# Obtener carreras
curl -X GET http://localhost:3000/careers \
  -H "Authorization: Bearer TU_TOKEN_AQUI"

# Verificar salud del sistema
curl -X GET http://localhost:3000/health
```

---

## 🗄️ DATOS DE BASE DE DATOS

### 🏢 **Carreras Disponibles**
- Ingeniería Civil Informática (ICI)
- Ingeniería Civil Industrial (ICIN)
- Ingeniería Comercial (ICOM)

### 🏛️ **Departamentos**
- Departamento de Ingeniería de Sistemas y Computación
- Departamento de Ingeniería Industrial y de Sistemas
- Departamento de Economía y Administración

### 📚 **Cursos de Ejemplo**
- Programación I (INFO-001)
- Matemáticas I (MAT-001)
- Física I (FIS-001)

---

## 🔄 FLUJOS DE PRUEBA RECOMENDADOS

### 1️⃣ **Flujo de Autenticación**
1. Login con coordinador
2. Verificar token válido
3. Acceder a endpoint protegido

### 2️⃣ **Flujo de Estudiante**
1. Login como coordinador
2. Crear nuevo estudiante
3. Login como estudiante creado
4. Ver perfil propio

### 3️⃣ **Flujo de Ajustes**
1. Login como educadora social
2. Crear ajuste para estudiante
3. Login como docente
4. Ver ajustes pendientes

### 4️⃣ **Flujo de Reportes**
1. Login como DIDDEC
2. Generar reporte de estudiantes
3. Exportar estadísticas

---

## 🚨 TROUBLESHOOTING

### ❌ **Error: Usuario no encontrado**
```bash
# Verificar que la BD tenga datos
mongosh ucn_inclui2_dev
db.users.find({email: "coordinador@ucn.cl"})

# Si no existe, ejecutar:
npm run seed:db
```

### ❌ **Error: Token inválido**
```bash
# Verificar que JWT_SECRET esté configurado
grep JWT_SECRET .env

# Debe tener algo como:
JWT_SECRET=mi-secreto-desarrollo-123
```

### ❌ **Error de conexión a BD**
```bash
# Verificar MongoDB
mongosh --eval "db.runCommand({ping: 1})"

# Si falla, iniciar MongoDB:
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

---

## 💡 TIPS PARA DESARROLLO

### 🔍 **Debugging**
```bash
# Ver logs en tiempo real
LOG_LEVEL=debug npm run start:dev

# Verificar estructura de BD
mongosh ucn_inclui2_dev --eval "show collections"
```

### 🧪 **Testing Rápido**
```bash
# Validar todo el sistema
npm run validate:prod

# Solo tests unitarios
npm test

# Solo tests e2e
npm run test:e2e
```

### 📝 **Documentación Interactiva**
- **Swagger UI:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health

---

¡Estas credenciales te permitirán probar todas las funcionalidades del sistema! 🚀
