# 🎓 UCN Inclui2 - Sistema de Gestión Inclusiva

## 📋 **Descripción**

Sistema de gestión para estudiantes con Necesidades Educativas Especiales (NEE) de la Universidad Católica del Norte, desarrollado con NestJS, MongoDB y arquitectura de microservicios.

### **Características Principales**
- ✅ **Sistema de Consentimientos UCN 2025** - Gestión granular de permisos
- ✅ **Control de Acceso por Roles** - 7 roles diferenciados con permisos específicos
- ✅ **Gestión de Documentos** - Upload, download y validación de documentos NEE
- ✅ **Ajustes Académicos** - Gestión de adaptaciones curriculares
- ✅ **Notificaciones en Tiempo Real** - WebSockets para comunicación instantánea
- ✅ **API RESTful Completa** - 37+ endpoints documentados con Swagger
- ✅ **Testing Exhaustivo** - 91.7% de cobertura de funcionalidad

---

## 🏗️ **Arquitectura**

### **Stack Tecnológico**
- **Backend**: NestJS 10.x + TypeScript
- **Base de Datos**: MongoDB 7.0 
- **Autenticación**: JWT + Google OAuth2
- **WebSockets**: Socket.IO para notificaciones
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Deployment**: Docker + Docker Compose

### **Módulos Principales**
- **Auth**: Autenticación y autorización
- **Users**: Gestión de usuarios y roles
- **Students**: Información de estudiantes NEE
- **Consent**: Sistema de consentimientos UCN 2025
- **Documents**: Gestión de documentos
- **Adjustments**: Ajustes académicos
- **Notifications**: Notificaciones en tiempo real

---

## 🚀 **Inicio Rápido**

### **Prerrequisitos**
- Node.js 18+ 
- Docker y Docker Compose
- MongoDB 7.0+

### **Instalación**

```bash
# Clonar repositorio
git clone [repo-url]
cd backend-ucn-inclui2

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar con Docker
docker-compose up -d

# Verificar instalación
curl http://localhost:3000/health
```

### **Acceso a la Aplicación**
- **API**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

---

## 📚 **Documentación**

### **Estructura de Documentación**
```
📁 docs/
├── 📁 00-getting-started/     # Inicio rápido y setup
├── 📁 01-architecture/        # Documentación técnica
├── 📁 02-development/         # Guías de desarrollo  
├── 📁 03-testing/            # Testing y validación
├── 📁 04-deployment/         # Deployment y producción
└── 📁 05-history/            # Historial y changelog
```

### **Accesos Rápidos**
- 📖 [**Guía de Inicio**](docs/00-getting-started/README.md) - Para nuevos desarrolladores
- 🏗️ [**Arquitectura del Sistema**](docs/01-architecture/README.md) - Documentación técnica
- 🧪 [**Guías de Testing**](docs/03-testing/README.md) - Testing y validación
- 🚀 [**Deployment**](docs/04-deployment/README.md) - Configuración de producción

---

## 🔧 **Comandos de Desarrollo**

### **Desarrollo Local**
```bash
# Modo desarrollo con watch
npm run start:dev

# Build de producción
npm run build

# Ejecutar tests
npm run test

# Coverage de tests
npm run test:cov
```

### **Scripts Automatizados**
```bash
# Testing completo de endpoints
powershell -ExecutionPolicy Bypass -File scripts/advanced-testing.ps1

# Build de producción
powershell -ExecutionPolicy Bypass -File scripts/build-production.ps1

# Backup de MongoDB
chmod +x scripts/backup-mongodb.sh && ./scripts/backup-mongodb.sh
```

---

## 🐳 **Docker y Deployment**

### **Desarrollo con Docker**
```bash
# Ejecutar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios  
docker-compose down
```

### **Producción**
```bash
# Build de imagen de producción
docker build -f docker/Dockerfile.production -t ucn-inclui2:production .

# Deployment con compose de producción
docker-compose -f docker/docker-compose.production.yml up -d
```

---

## 🧪 **Testing**

### **Métricas de Testing**
- **Funcionalidad**: ✅ 91.7% (34/37 endpoints)
- **Seguridad**: ✅ 100% (Control de acceso)
- **Integración**: ✅ 90% (Módulos conectados)

### **Ejecutar Tests**
```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Testing completo automatizado
powershell scripts/advanced-testing.ps1
```

---

## 🔐 **Sistema de Roles**

| Rol | Acceso a Diagnóstico/NEE | Acceso a Documentos | Acceso a Ajustes |
|-----|-------------------------|-------------------|------------------|
| **COORDINADOR** | ✅ SIEMPRE | 🔒 Con consentimiento | ✅ SIEMPRE |
| **EDUCADORA** | ✅ SIEMPRE | 🔒 Con consentimiento | ✅ SIEMPRE |
| **DOCENTE** | ❌ NUNCA | 🔒 Con consentimiento | ✅ SIEMPRE |
| **JEFE_CARRERA** | ❌ NUNCA | 🔒 Con consentimiento | ✅ Con autorización |
| **ESTUDIANTE** | ✅ Propio | ✅ Propios | ❌ NUNCA |

---

## 🌟 **Características Destacadas**

### **Sistema de Consentimientos UCN 2025**
- Consentimiento general del estudiante para compartir diagnóstico
- Control granular por tipo de información
- Trazabilidad completa de accesos
- Cumplimiento normativo UCN

### **Notificaciones Inteligentes**
- WebSockets para tiempo real
- Notificaciones por email
- Alertas de vencimiento de documentos
- Sistema de recordatorios

### **API RESTful Robusta**
- 37+ endpoints documentados
- Swagger UI interactivo
- Validación automática de DTOs
- Rate limiting y seguridad

---

## 📊 **Estado del Proyecto**

### **Versión Actual**: V2.0 - Sistema de Consentimientos UCN
### **Estado**: ✅ **PRODUCCIÓN READY**

#### **Últimas Actualizaciones**
- ✅ Sistema de consentimientos UCN 2025 implementado
- ✅ Reorganización completa de documentación
- ✅ Testing exhaustivo completado
- ✅ Scripts de deployment automatizados

---

## 🤝 **Contribución**

### **Estructura de Branches**
- `main` - Producción estable
- `develop` - Desarrollo activo  
- `feature/*` - Nuevas características
- `hotfix/*` - Correcciones urgentes

### **Estándares de Código**
- TypeScript estricto
- ESLint + Prettier
- Commits en español
- Testing obligatorio para nuevas features

---

## 📞 **Soporte**

### **Documentación**
- 📚 [Documentación Completa](docs/README.md)
- 🔧 [Scripts Disponibles](scripts/README.md)
- 🐳 [Configuración Docker](docker/README.md)

### **Testing y Validación**
- 🧪 [Guías de Testing](docs/03-testing/README.md)
- 📊 [Reportes de Testing](docs/03-testing/)

---

**Desarrollado para Universidad Católica del Norte**  
**Versión**: V2.0 - Sistema de Consentimientos UCN 2025  
**Última actualización**: 18 de Enero 2025
