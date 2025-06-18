# 🚀 SETUP RÁPIDO - UCN INCLUI2
## Configuración de Entorno de Desarrollo

### 📅 **Última Actualización**: Enero 2025
### ⏱️ **Tiempo Estimado**: 15-20 minutos

---

## 🎯 **OBJETIVO**

Esta guía te permite tener el sistema UCN Inclui2 funcionando localmente en **menos de 20 minutos** para desarrollo.

---

## ✅ **PREREQUISITOS**

### **🛠️ Software Requerido**
```bash
✅ Node.js 18+ (LTS recomendado)
✅ Docker Desktop
✅ Git
✅ VS Code (recomendado)
✅ PowerShell 7+ (Windows)
```

### **📋 Verificar Instalaciones**
```bash
# Verificar versiones
node --version    # >= 18.0.0
npm --version     # >= 9.0.0
docker --version  # >= 20.0.0
git --version     # >= 2.30.0
```

---

## 🚀 **SETUP EN 5 PASOS**

### **1️⃣ Clonar Repositorio**
```bash
git clone [URL_REPOSITORIO]
cd backend-ucn-inclui2
```

### **2️⃣ Instalar Dependencias**
```bash
npm install
```

### **3️⃣ Configurar Variables de Entorno**
```bash
# Copiar archivo de ejemplo
copy .env.example .env

# Editar variables necesarias (usar valores por defecto para desarrollo)
# Las variables críticas ya tienen valores para desarrollo local
```

### **4️⃣ Levantar Base de Datos**
```bash
# Iniciar MongoDB local con Docker
docker-compose up -d mongodb

# Verificar que MongoDB está corriendo
docker ps
```

### **5️⃣ Iniciar Aplicación**
```bash
# Modo desarrollo con hot reload
npm run start:dev

# Verificar que la aplicación está corriendo
# ✅ API: http://localhost:3000
# ✅ Swagger: http://localhost:3000/api
```

---

## 🧪 **VERIFICACIÓN RÁPIDA**

### **✅ Health Check**
```bash
curl http://localhost:3000
# Respuesta esperada: { "message": "UCN Inclui2 API is running!" }
```

### **📋 Testing Básico**
```powershell
# Ejecutar test rápido de endpoints
.\scripts\test-all-endpoints.ps1

# Resultado esperado: 91.7%+ funcionalidad
```

### **📖 Documentación API**
- **Swagger UI**: http://localhost:3000/api
- **Health Check**: http://localhost:3000

---

## 👥 **USUARIOS DE PRUEBA**

### **🔐 Credenciales por Rol**
```javascript
// Coordinadora (acceso completo)
email: "coordinadora@ucn.cl"
password: "password123"

// Educadora Social (gestión estudiantes NEE)
email: "educadora@ucn.cl"  
password: "password123"

// Docente (consulta ajustes)
email: "docente1@ucn.cl"
password: "password123"

// Estudiante (información personal)
email: "estudiante1@ucn.cl"
password: "password123"
```

### **🧪 Testing de Login**
```bash
# Test de autenticación
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coordinadora@ucn.cl","password":"password123"}'
```

---

## 📊 **DATOS DE PRUEBA INCLUIDOS**

### **🎓 Estudiantes NEE**
- **Juan Pérez González** (TDAH, Ing. Civil Informática)
- **María Rodríguez Silva** (Dislexia, Ing. Civil Industrial)

### **📋 Categorías de Ajustes**
- Evaluación, Metodología, Acceso, Tiempo
- Materiales, Comunicación, Ambiente
- Tecnología, Apoyo Personal

### **🏛️ Estructura UCN**
- **Departamentos**: Informática, Matemáticas
- **Carreras**: ICI, Industrial
- **Cursos**: INFO101, MATE201

---

## 🔧 **COMANDOS ÚTILES DESARROLLO**

### **📦 NPM Scripts**
```bash
npm run start         # Producción
npm run start:dev     # Desarrollo con hot reload
npm run start:debug   # Debug mode
npm run build         # Build para producción
npm run test          # Tests unitarios
npm run test:e2e      # Tests end-to-end
npm run lint          # Linting código
```

### **🐳 Docker Commands**
```bash
# Levantar todos los servicios
docker-compose up -d

# Solo MongoDB
docker-compose up -d mongodb

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### **🗄️ MongoDB Commands**
```bash
# Conectar a MongoDB
docker exec -it ucn_inclui2_mongodb mongosh -u admin -p secure_password_123 --authenticationDatabase admin

# Usar base de datos
use ucn_inclui2_prod

# Ver colecciones
show collections

# Contar documentos
db.users.countDocuments()
```

---

## 🐛 **TROUBLESHOOTING COMÚN**

### **❌ Puerto 3000 en uso**
```bash
# Verificar qué usa el puerto
netstat -ano | findstr :3000

# Cambiar puerto en .env
PORT=3001
```

### **❌ MongoDB no conecta**
```bash
# Verificar contenedor
docker ps | grep mongodb

# Revisar logs
docker logs ucn_inclui2_mongodb

# Reiniciar contenedor
docker-compose restart mongodb
```

### **❌ Dependencias no instalan**
```bash
# Limpiar caché npm
npm cache clean --force

# Eliminar node_modules
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

### **❌ Scripts PowerShell no ejecutan**
```powershell
# Cambiar política de ejecución
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Verificar política
Get-ExecutionPolicy
```

---

## 📚 **PRÓXIMOS PASOS**

### **📖 Después del Setup**
1. **Explorar API**: http://localhost:3000/api
2. **Leer arquitectura**: [`../01-architecture/system-architecture.md`](../01-architecture/system-architecture.md)
3. **Revisar estándares**: [`../02-development/coding-standards.md`](../02-development/coding-standards.md)
4. **Ejecutar testing**: [`../03-testing/testing-guide.md`](../03-testing/testing-guide.md)

### **🚀 Para Desarrollo Activo**
1. **Configurar VS Code** con extensiones recomendadas
2. **Instalar Thunder Client** para testing API
3. **Configurar debugger** para NestJS
4. **Explorar base de datos** con MongoDB Compass

---

## 🆘 **¿NECESITAS AYUDA?**

### **📖 Documentación Completa**
- **Arquitectura**: [`../01-architecture/`](../01-architecture/)
- **Desarrollo**: [`../02-development/`](../02-development/)
- **Testing**: [`../03-testing/`](../03-testing/)

### **🔍 Debugging**
- **Issues Conocidos**: [`../05-history/issues-resolved.md`](../05-history/issues-resolved.md)
- **Scripts de Testing**: [`../03-testing/scripts/`](../03-testing/scripts/)

---

> **💡 TIP**: Si tienes problemas, revisa primero los **issues conocidos** en la documentación histórica. La mayoría de problemas comunes ya tienen solución documentada.

---

**📄 Guía de setup rápido** | **📅 Actualizada**: Enero 2025 | **⏱️ Tiempo**: 15-20 minutos 