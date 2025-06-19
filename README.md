# 🚀 UCN INCLUI2 - Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0+-red.svg)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green.svg)](https://www.mongodb.com/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)](#)

> **🎯 Sistema de gestión para estudiantes con Necesidades Educativas Especiales (NEE) de la Universidad Católica del Norte**

## 📋 Estado del Proyecto

**✅ COMPLETAMENTE FINALIZADO - LISTO PARA FRONTEND**  
**📅 Última actualización:** 19/06/2025  
**🔧 Versión:** 2.0 Production Ready  

---

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- MongoDB 7.0+
- npm o yarn

### Instalación
```bash
# Clonar repositorio
git clone [repository-url]
cd backend-ucn-inclui2

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run start:dev
```

### 🌐 Acceso
- **API:** http://localhost:3000
- **Documentación Swagger:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health

---

## 📚 Para Desarrolladores Frontend

### 🔗 Endpoints Principales

#### Autenticación
```typescript
POST /auth/login        # Login con credenciales
POST /auth/google       # Login con Google OAuth
POST /auth/refresh      # Renovar token JWT
```

#### Estudiantes
```typescript
GET  /students          # Listar estudiantes (con filtros)
POST /students          # Crear estudiante
GET  /students/profile  # Perfil del usuario actual
GET  /students/:id      # Obtener estudiante por ID
```

#### Carreras y Departamentos
```typescript
GET  /careers           # Listar carreras
GET  /departments       # Listar departamentos
GET  /careers/:id/students # Estudiantes por carrera
```

#### Documentos y Ajustes
```typescript
GET  /documents         # Listar documentos
POST /documents         # Subir documento
GET  /adjustments       # Listar ajustes académicos
POST /adjustments       # Crear ajuste
```

### 🔐 Autenticación JWT

```typescript
// Headers requeridos
Authorization: Bearer <jwt-token>

// Respuesta de login
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "email": "user@ucn.cl",
    "roles": ["ESTUDIANTE"],
    "nombres": "Juan",
    "apellidos": "Pérez"
  }
}
```

### 👤 Sistema de Roles

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `ESTUDIANTE` | Estudiante con NEE | Ver perfil propio, documentos propios |
| `COORDINADOR` | Coordinador de carrera | Gestionar estudiantes de su carrera |
| `EDUCADORA_SOCIAL` | Educadora social | Gestionar ajustes y documentos |
| `DIDDEC_STAFF` | Personal DIDDEC | Reportes y administración |
| `ADMIN` | Administrador | Acceso completo |

---

## 🏗️ Arquitectura

### 📁 Estructura de Módulos
```
src/
├── auth/           # Autenticación y autorización
├── students/       # Gestión de estudiantes
├── careers/        # Carreras académicas
├── departments/    # Departamentos UCN
├── adjustments/    # Ajustes académicos
├── documents/      # Gestión de documentos
├── notifications/  # Sistema de notificaciones
├── diddec/        # Reportes DIDDEC
├── hawaii/        # Integración Hawaii API
└── sync/          # Sincronización de datos
```

### 🛡️ Seguridad
- **JWT Authentication** con refresh tokens
- **Roles y permisos** granulares
- **Validación de datos** con DTOs
- **Rate limiting** configurado
- **CORS** habilitado para frontend

### 📊 Base de Datos
- **MongoDB** con Mongoose ODM
- **Esquemas validados** con decoradores
- **Índices optimizados** para consultas
- **Datos de prueba** incluidos

---

## 🧪 Testing y Desarrollo

### 📋 Scripts Disponibles
```bash
npm run start:dev      # Desarrollo con hot-reload
npm run start:prod     # Producción
npm run build          # Compilar TypeScript
npm run test           # Tests unitarios
npm run test:e2e       # Tests end-to-end
npm run lint           # ESLint
npm run format         # Prettier
```

### 🔍 Herramientas
- **Swagger UI:** Documentación interactiva
- **MongoDB Compass:** Visualizar base de datos
- **Postman:** Colección de endpoints incluida
- **VS Code:** Configuración incluida

---

## 📊 Métricas del Sistema

### ✅ Estado Actual
- **146 endpoints** implementados
- **100% funcionalidad core** operativa
- **11 módulos** completamente desarrollados
- **5 roles de usuario** configurados
- **Base de datos** poblada y validada

### 📈 Cobertura
- **Autenticación:** 100% ✅
- **Gestión de estudiantes:** 100% ✅
- **Sistema de roles:** 100% ✅
- **API Hawaii:** 100% ✅
- **Reportes DIDDEC:** 100% ✅
- **Notificaciones:** 100% ✅

---

## 🔔 Sistema de Notificaciones

### WebSocket Connection
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'jwt-token' }
});

socket.on('notification', (data) => {
  console.log('Nueva notificación:', data);
});
```

### Tipos de Eventos
- `adjustment_created` - Nuevo ajuste académico
- `adjustment_approved` - Ajuste aprobado
- `document_uploaded` - Documento subido
- `semester_updated` - Cambio de semestre

---

## 📚 Documentación Completa

### 📖 Guías Disponibles
- **[Inicio Rápido](docs/00-getting-started/README.md)**
- **[Arquitectura](docs/01-architecture/README.md)**
- **[API Reference](docs/01-architecture/API_DOCUMENTATION.md)**
- **[Desarrollo](docs/02-development/README.md)**
- **[Testing](docs/03-testing/README.md)**
- **[Deployment](docs/04-deployment/README.md)**

### 🎯 Para Frontend Developers
- **[📄 PROYECTO FINALIZADO](PROYECTO_FINALIZADO_README.md)** - Guía completa
- **[🔧 API Endpoints](docs/ALL_ENDPOINTS_SWAGGER.md)** - Lista completa
- **[🔐 Auth Guide](docs/02-development/auth-guide.md)** - Implementación
- **[📊 Data Models](docs/01-architecture/data-models.md)** - Esquemas

---

## 🚀 Deployment

### 🐳 Docker
```bash
# Desarrollo
docker-compose up -d

# Producción
docker-compose -f docker/docker-compose.production.yml up -d
```

### 🌍 Variables de Entorno
```env
DATABASE_URL=mongodb://localhost:27017/ucn_inclui2_test
JWT_SECRET=your-super-secret-jwt-key
HAWAII_BASE_URL=https://losvilos.ucn.cl/hawaii/api
GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 🤝 Contribución

### 📋 Estándares
- **TypeScript** estricto habilitado
- **ESLint + Prettier** configurado
- **Conventional Commits** para mensajes
- **Tests** requeridos para nuevas features

### 🔄 Workflow
1. Fork del repositorio
2. Crear feature branch
3. Desarrollar con tests
4. Pull request con descripción

---

## 📞 Soporte

### 🆘 Problemas Comunes
- **CORS errors:** Verificar configuración en `main.ts`
- **Auth failures:** Validar JWT secret y tokens
- **DB connection:** Confirmar MongoDB running
- **Port conflicts:** Cambiar puerto en variables de entorno

### 📧 Contacto
- **Issues:** GitHub Issues
- **Documentación:** Ver carpeta `/docs`
- **API Testing:** Swagger UI disponible

---

## 📜 Licencia

Este proyecto está desarrollado para la **Universidad Católica del Norte** como parte del sistema INCLUI2 para la gestión de estudiantes con Necesidades Educativas Especiales.

---

**🎯 Estado:** ✅ **PRODUCTION READY - LISTO PARA FRONTEND**  
**📅 Última actualización:** 19/06/2025  
**👨‍💻 Mantenido por:** Equipo DIDDEC UCN
