# 👥 UCN INCLUI2 BACKEND - GUÍA PARA DESARROLLADORES

**Última actualización: 06/07/2025**

¡Bienvenido al equipo de desarrollo! Esta guía te ayudará a configurar el proyecto en tu entorno local y comenzar a contribuir.

---

## 🚀 CONFIGURACIÓN INICIAL (5 MINUTOS)

### 📋 **PRERREQUISITOS**
Asegúrate de tener instalado:
- **Node.js 18+** ([Descargar aquí](https://nodejs.org/))
- **MongoDB 7.0+** ([Descargar aquí](https://www.mongodb.com/try/download/community))
- **Git** ([Descargar aquí](https://git-scm.com/))
- **Un editor de código** (VS Code recomendado)

### ⚡ **INSTALACIÓN RÁPIDA**

```bash
# 1. Clonar el repositorio
git clone [URL-DEL-REPOSITORIO]
cd backend-ucn-inclui2

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores (ver sección siguiente)

# 4. Iniciar MongoDB
# Windows: Servicio de MongoDB
# Mac/Linux: mongod --dbpath /data/db

# 5. Poblar base de datos con datos de prueba
npm run setup:dev

# 6. Iniciar servidor en modo desarrollo
npm run start:dev
```

### 🌐 **VERIFICAR INSTALACIÓN**
- **API:** http://localhost:3000
- **Documentación Swagger:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health

---

## ⚙️ CONFIGURACIÓN DE VARIABLES DE ENTORNO

### 🔧 **CONFIGURACIÓN MÍNIMA (.env)**
```bash
# 🗄️ BASE DE DATOS (REQUERIDO)
DATABASE_URL=mongodb://localhost:27017/ucn_inclui2_dev
MONGODB_URI=mongodb://localhost:27017/ucn_inclui2_dev

# 🔐 JWT (REQUERIDO)
JWT_SECRET=mi-secreto-desarrollo-123
JWT_REFRESH_SECRET=mi-refresh-secreto-456

# 🚀 SERVIDOR
PORT=3000
NODE_ENV=development
```

### 🔍 **CONFIGURACIÓN OPCIONAL**
```bash
# Para integración con Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id

# Para integración con Hawaii API UCN
HAWAII_BASE_URL=https://losvilos.ucn.cl/hawaii/api
HAWAII_AUTH_OFERTA=tu-auth-hawaii
# ... otros valores Hawaii
```

---

## 🛠️ COMANDOS DE DESARROLLO

### 📦 **COMANDOS PRINCIPALES**
```bash
# Desarrollo con hot-reload
npm run start:dev

# Compilar TypeScript
npm run build

# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Linting y formato
npm run lint
npm run format

# Verificar tipos TypeScript
npm run type-check
```

### 🧪 **COMANDOS DE TESTING**
```bash
# Tests unitarios
npm test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov

# Validación completa de producción
npm run validate:prod
```

---

## 🗄️ BASE DE DATOS - CONFIGURACIÓN

### 🚀 **CONFIGURACIÓN AUTOMÁTICA**
```bash
# Poblar BD con datos de prueba
npm run setup:dev

# Este comando:
# 1. Crea las colecciones necesarias
# 2. Agrega usuarios de prueba
# 3. Agrega carreras y departamentos
# 4. Configura índices de BD
```

### 👤 **USUARIOS DE PRUEBA DISPONIBLES**
```bash
# Coordinador
email: coordinador@ucn.cl
password: password123

# Educadora Social
email: educadora@ucn.cl
password: password123

# Personal DIDDEC
email: diddec@ucn.cl
password: password123

# Estudiante
email: estudiante@alumnos.ucn.cl
password: password123
```

### 🔍 **COMANDOS DE BD ÚTILES**
```bash
# Verificar conexión a MongoDB
mongo ucn_inclui2_dev

# Ver colecciones
show collections

# Contar documentos
db.users.countDocuments()
db.students.countDocuments()
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
src/
├── auth/              # Autenticación y autorización
├── users/             # Gestión de usuarios
├── students/          # Gestión de estudiantes con NEE
├── careers/           # Carreras académicas
├── departments/       # Departamentos UCN
├── courses/           # Cursos y materias
├── adjustments/       # Ajustes académicos
├── documents/         # Gestión de documentos
├── diddec/           # Reportes y estadísticas DIDDEC
├── hawaii/           # Integración API Hawaii UCN
├── notifications/    # Sistema de notificaciones
├── config/           # Configuración global
└── common/           # Utilidades compartidas
```

---

## 🔄 FLUJO DE DESARROLLO

### 📝 **CREAR NUEVA FUNCIONALIDAD**
```bash
# 1. Crear rama para feature
git checkout -b feature/mi-nueva-funcionalidad

# 2. Desarrollar (seguir patrones existentes)
# - Crear DTOs en dto/
# - Implementar service
# - Crear controller
# - Agregar tests

# 3. Verificar que todo funciona
npm test
npm run lint

# 4. Commit y push
git add .
git commit -m "Agregar nueva funcionalidad X"
git push origin feature/mi-nueva-funcionalidad
```

### 🧪 **TESTING**
```bash
# Antes de hacer commit
npm test                    # Tests unitarios
npm run test:e2e           # Tests end-to-end
npm run lint               # Verificar código
npm run validate:prod      # Validación completa
```

---

## 🔐 AUTENTICACIÓN Y ROLES

### 👥 **SISTEMA DE ROLES**
- `ESTUDIANTE`: Estudiante con NEE
- `DOCENTE`: Profesor de la universidad
- `COORDINADOR`: Coordinador de carrera
- `EDUCADORA_SOCIAL`: Educadora social NEE
- `JEFE_DEPARTAMENTO`: Jefe de departamento
- `DIDDEC_STAFF`: Personal de DIDDEC
- `ADMIN`: Administrador del sistema

### 🔑 **USAR AUTENTICACIÓN EN DESARROLLO**
```typescript
// En controladores, usar decorators
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
@Get()
async getDatos() {
  // Solo coordinadores y DIDDEC pueden acceder
}
```

---

## 📚 API ENDPOINTS PRINCIPALES

### 🔐 **Autenticación**
```bash
POST /auth/login              # Login con credenciales
POST /auth/google             # Login con Google
POST /auth/refresh            # Renovar token
```

### 👨‍🎓 **Estudiantes**
```bash
GET /students                 # Listar estudiantes
POST /students                # Crear estudiante
GET /students/profile         # Perfil del estudiante actual
GET /students/:id             # Obtener estudiante por ID
```

### 🏢 **Carreras y Departamentos**
```bash
GET /careers                  # Listar carreras
GET /departments              # Listar departamentos
```

### 📄 **Documentos y Ajustes**
```bash
GET /adjustments              # Listar ajustes
POST /adjustments             # Crear ajuste
POST /documents               # Subir documento
```

---

## 🐛 DEBUGGING Y TROUBLESHOOTING

### 🔍 **PROBLEMAS COMUNES**

#### ❌ Error de conexión a MongoDB
```bash
# Verificar que MongoDB esté ejecutándose
mongosh

# Si no está instalado
# Windows: Descargar MongoDB Community Server
# Mac: brew install mongodb-community
# Linux: sudo apt install mongodb
```

#### ❌ Error en variables de entorno
```bash
# Verificar que .env existe
ls -la .env

# Copiar desde ejemplo
cp .env.example .env
```

#### ❌ Error en dependencias
```bash
# Limpiar e instalar
rm -rf node_modules package-lock.json
npm install
```

### 📝 **LOGS ÚTILES**
```bash
# Ver logs en tiempo real
npm run logs

# Logs con más detalle
LOG_LEVEL=debug npm run start:dev
```

---

## 🤝 CONVENCIONES DE CÓDIGO

### 📋 **REGLAS IMPORTANTES**
- **Usar TypeScript** siempre
- **DTOs** para validación de entrada
- **Servicios** para lógica de negocio
- **Guards** para autorización
- **Tests** para funcionalidades críticas
- **Commits en español** sin prefijos

### 🎯 **PATRONES A SEGUIR**
```typescript
// ✅ Bueno - DTO con validaciones
export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  nombres: string;
}

// ✅ Bueno - Service con inyección
@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) 
    private studentModel: Model<StudentDocument>
  ) {}
}
```

---

## 📞 AYUDA Y CONTACTO

### 🆘 **¿NECESITAS AYUDA?**
1. **Revisa este README** - Cubre los casos más comunes
2. **Consulta la documentación** en `/docs/`
3. **Revisa issues** en el repositorio
4. **Pregunta al equipo** en el chat del proyecto

### 📖 **RECURSOS ADICIONALES**
- **Documentación técnica:** `/docs/`
- **Swagger UI:** http://localhost:3000/api
- **Postman Collection:** `/docs/api/`
- **Ejemplos de uso:** `/examples/`

---

## ✅ CHECKLIST PARA NUEVOS DESARROLLADORES

- [ ] Node.js 18+ instalado
- [ ] MongoDB ejecutándose
- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Base de datos poblada (`npm run setup:dev`)
- [ ] Servidor iniciado (`npm run start:dev`)
- [ ] Swagger accesible (http://localhost:3000/api)
- [ ] Tests pasando (`npm test`)
- [ ] Linting sin errores (`npm run lint`)

---

**¡Listo para desarrollar! 🚀**

Si tienes problemas con la configuración, no dudes en preguntar al equipo. ¡Bienvenido a UCN INCLUI2!
