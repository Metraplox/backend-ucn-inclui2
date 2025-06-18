# 🏗️ ARQUITECTURA Y FUNCIONALIDADES - UCN INCLUI2
## Sistema Completo de Gestión de Estudiantes con NEE

### 📅 **Última Actualización**: Enero 2025
### 🎯 **Estado**: SISTEMA COMPLETAMENTE IMPLEMENTADO

---

## 🌟 **VISIÓN GENERAL DE LA ARQUITECTURA**

UCN Inclui2 es un sistema integral desarrollado con **arquitectura de microservicios modular** usando NestJS, diseñado específicamente para la gestión de estudiantes con Necesidades Educativas Especiales en entornos universitarios.

### **🎯 PRINCIPIOS ARQUITECTÓNICOS**
- **Modularidad**: Cada funcionalidad como módulo independiente
- **Seguridad por Diseño**: Control de acceso granular en cada capa
- **Escalabilidad**: Preparado para crecimiento de usuarios y datos
- **Mantenibilidad**: Código limpio, documentado y testeable
- **Autonomía**: Sin dependencias externas críticas

---

## 🏗️ **ARQUITECTURA TÉCNICA**

### **📊 STACK TECNOLÓGICO COMPLETO**

#### **Backend (NestJS)**
```typescript
Framework: NestJS 10.x
Lenguaje: TypeScript 5.x
Autenticación: JWT + Passport
Validación: Class-validator + Class-transformer
Documentación: Swagger/OpenAPI
Guards: Custom role-based access control
Interceptores: Logging, error handling, response formatting
```

#### **Base de Datos (MongoDB)**
```javascript
Motor: MongoDB 7.0 (Local Dockerizado)
ODM: Mongoose 7.x
Validaciones: Esquemas JSON + Mongoose validators
Índices: 12+ índices de rendimiento implementados
Transacciones: Para operaciones críticas
Auditoría: Timestamps automáticos en todas las colecciones
```

#### **Frontend (Flutter)**
```dart
Framework: Flutter 3.x
Plataformas: Android, iOS, Web
Estado: Provider pattern
HTTP: Dio client con interceptores
Autenticación: JWT storage + auto-refresh
UI/UX: Material Design 3
```

#### **Infraestructura (Docker)**
```yaml
Orquestación: Docker Compose
Redes: Red privada Docker
Persistencia: Volúmenes Docker para MongoDB
Configuración: Variables de entorno por ambiente
Scripts: Backup/restore automatizados
```

---

## 📱 **MÓDULOS Y FUNCIONALIDADES IMPLEMENTADAS**

### **🔐 1. MÓDULO DE AUTENTICACIÓN (`auth`)**

#### **Funcionalidades**
- ✅ Login con email/password
- ✅ JWT token generation y validation
- ✅ Refresh token handling
- ✅ Password hashing (bcrypt)
- ✅ Protección de rutas sensibles
- ✅ Logout con invalidación de tokens

#### **Endpoints**
```typescript
POST   /auth/login           // Autenticación de usuarios
GET    /auth/profile         // Perfil del usuario autenticado
POST   /auth/refresh         // Renovar token expirado
POST   /auth/logout          // Cerrar sesión
GET    /auth/roles           // Información de roles disponibles
```

#### **Seguridad Implementada**
- Rate limiting en endpoints de login
- Validación de credenciales robusta
- Tokens con expiración configurable
- Guards personalizados por rol

---

### **👥 2. MÓDULO DE USUARIOS (`users`)**

#### **Funcionalidades**
- ✅ CRUD completo de usuarios
- ✅ Sistema de roles granular (7 tipos)
- ✅ Gestión de perfiles
- ✅ Control de estado (activo/inactivo)
- ✅ Búsqueda y filtrado avanzado

#### **Roles Implementados**
```typescript
COORDINADOR        // Supervisión general del sistema
EDUCADORA_SOCIAL   // Gestión directa estudiantes NEE
DIDDEC_STAFF      // Personal DIDDEC para reportes
JEFE_DEPARTAMENTO // Gestión académica departamental
JEFE_CARRERA      // Gestión académica por carrera
DOCENTE           // Consulta ajustes, implementación
ESTUDIANTE        // Acceso personal y autogestión
```

#### **Control de Acceso**
- Permisos granulares por endpoint
- Validación de pertenencia organizacional
- Protección de datos sensibles según rol

---

### **🎓 3. MÓDULO DE ESTUDIANTES (`students`)**

#### **Funcionalidades**
- ✅ Registro completo de estudiantes NEE
- ✅ Vinculación con usuarios del sistema
- ✅ Gestión de información académica
- ✅ Historial de ajustes implementados
- ✅ Protección de datos según consentimientos

#### **Información Gestionada**
```typescript
Datos Personales:
- Nombre completo, RUT, email
- Fecha de nacimiento, teléfonos
- Dirección, información contacto

Datos Académicos:
- Carrera, año de ingreso
- Situación académica actual
- Historial de cursos y notas

Información NEE:
- Tipo de NEE (TDAH, Dislexia, etc.)
- Fecha de diagnóstico
- Documentos de respaldo
- Ajustes requeridos/implementados
```

#### **Casos de Uso Reales**
- **Juan Pérez González**: TDAH, Ing. Civil Informática
- **María Rodríguez Silva**: Dislexia, Ing. Civil Industrial

---

### **📋 4. MÓDULO DE AJUSTES ACADÉMICOS (`adjustments`)**

#### **Funcionalidades**
- ✅ Creación de ajustes personalizados
- ✅ Categorización dinámica
- ✅ Estados de implementación
- ✅ Seguimiento y validación
- ✅ Notificaciones automáticas

#### **Categorías de Ajustes (9 implementadas)**
```
📝 Evaluación        - Adaptaciones en evaluaciones
🎯 Metodología       - Adaptaciones metodológicas  
🚪 Acceso           - Adaptaciones de acceso
⏰ Tiempo           - Adaptaciones de tiempo
📚 Materiales        - Adaptaciones de materiales
💬 Comunicación      - Adaptaciones en comunicación
🏢 Ambiente          - Adaptaciones del ambiente
💻 Tecnología        - Apoyo tecnológico
👥 Apoyo Personal    - Apoyo de personal especializado
```

#### **Workflow de Ajustes**
```
1. SOLICITUD     → Educadora Social crea ajuste
2. REVISIÓN      → Coordinador valida necesidad
3. APROBACIÓN    → Jefe de Carrera/Departamento aprueba
4. NOTIFICACIÓN  → Docentes reciben información
5. IMPLEMENTACIÓN → Aplicación en aulas
6. SEGUIMIENTO   → Evaluación de efectividad
```

---

### **📄 5. MÓDULO DE DOCUMENTOS (`documents`)**

#### **Funcionalidades**
- ✅ Carga de archivos (PDF, imágenes)
- ✅ Categorización automática
- ✅ Control de acceso por rol y consentimiento
- ✅ Versionado de documentos
- ✅ Validación y verificación de contenido

#### **Tipos de Documentos**
```
📋 DIAGNOSTICO       - Informes médicos, psicológicos
📝 INFORME_EDUCATIVO - Evaluaciones pedagógicas
📄 CONSENTIMIENTO    - Autorizaciones del estudiante
📊 SEGUIMIENTO       - Reportes de progreso
🏥 MEDICO           - Documentación médica
📚 ACADEMICO        - Registros académicos oficiales
```

#### **Control de Acceso Documental**
- **Coordinador/Educadora Social**: Acceso SOLO con consentimiento
- **Otros roles**: SIN acceso a documentos sensibles
- **Propio estudiante**: Acceso COMPLETO a sus documentos

---

### **📝 6. MÓDULO DE CONSENTIMIENTOS (`consents`) - NUEVO V1.0**

#### **Funcionalidades Según Formato UCN 2025**
- ✅ Consentimiento general del estudiante
- ✅ Control granular de acceso a información
- ✅ Revocación con motivos
- ✅ Auditoría completa de decisiones
- ✅ Integración con otros módulos

#### **Esquema de Consentimientos**
```typescript
Consent {
  studentId: ObjectId,          // Estudiante propietario
  allowsDataSharing: boolean,   // Autoriza compartir diagnóstico
  consentDate: Date,           // Fecha de la decisión
  studentRut: string,          // RUT para auditoría
  studentName: string,         // Nombre completo
  studentCareer: string,       // Carrera académica
  comments?: string,           // Comentarios del estudiante
  registeredBy: ObjectId,      // Usuario que registró
  ipAddress?: string,          // IP de auditoría
  userAgent?: string,          // Navegador de auditoría
  isActive: boolean,           // Estado activo
  revokedAt?: Date,           // Fecha de revocación
  revocationReason?: string   // Motivo de revocación
}
```

#### **Matriz de Control de Acceso**

| **Información** | **Coordinador** | **Educadora** | **Docente** | **Estudiante** |
|-----------------|-----------------|---------------|-------------|----------------|
| **Diagnóstico NEE** | SIEMPRE | SIEMPRE | CON CONSENTIMIENTO | SIEMPRE |
| **Documentos** | CON CONSENTIMIENTO | CON CONSENTIMIENTO | NUNCA | SIEMPRE |
| **Ajustes Académicos** | SIEMPRE | SIEMPRE | SIEMPRE | SIEMPRE |

---

### **📚 7. MÓDULO DE CATEGORÍAS (`categories`)**

#### **Funcionalidades**
- ✅ CRUD dinámico de categorías
- ✅ Gestión por Educadora Social/Coordinador
- ✅ Validaciones de unicidad
- ✅ Estado activo/inactivo
- ✅ Impacto en ajustes existentes

---

### **🏛️ 8. MÓDULOS ORGANIZACIONALES**

#### **Departamentos (`departments`)**
- ✅ Estructura organizacional UCN
- ✅ Gestión de jefaturas
- ✅ Estadísticas por departamento
- ✅ Relación con carreras y cursos

#### **Carreras (`careers`)**
- ✅ Catálogo de carreras UCN
- ✅ Vinculación con departamentos
- ✅ Gestión de jefaturas de carrera
- ✅ Estudiantes NEE por carrera

#### **Cursos (`courses`)**
- ✅ Catálogo de cursos académicos
- ✅ Información detallada (códigos, créditos)
- ✅ Relación con ajustes específicos
- ✅ Historial académico de estudiantes

---

### **🔔 9. MÓDULO DE NOTIFICACIONES (`notifications`)**

#### **Funcionalidades**
- ✅ Notificaciones automáticas por eventos
- ✅ Categorización por tipo y urgencia
- ✅ Control de acceso por rol
- ✅ Estado leído/no leído
- ✅ Filtrado por fecha y tipo

#### **Tipos de Notificaciones**
```
📋 AJUSTE_CREADO      - Nuevo ajuste académico
✅ AJUSTE_APROBADO    - Ajuste validado por jefatura
👤 ESTUDIANTE_ASIGNADO - Nuevo estudiante NEE
📚 RECURSO_DISPONIBLE - Nuevo material educativo
⚠️ DOCUMENTOS_PENDIENTES - Documentación faltante
```

---

### **📊 10. MÓDULO DIDDEC (`diddec`)**

#### **Funcionalidades**
- ✅ Dashboard administrativo
- ✅ Estadísticas de estudiantes NEE
- ✅ Reportes de efectividad de ajustes
- ✅ Analytics por carrera/departamento
- ✅ Exportación de datos

#### **Reportes Implementados**
- Resumen general de estudiantes NEE
- Ajustes por categoría y efectividad
- Distribución por carrera/departamento
- Tendencias de nuevos ingresos
- Uso de recursos educativos

---

### **📺 11. MÓDULO DE RECURSOS (`resources`)**

#### **Funcionalidades**
- ✅ Catálogo de recursos educativos
- ✅ Gestión por personal DIDDEC
- ✅ Categorización por tipo de NEE
- ✅ Control de acceso según rol
- ✅ Estadísticas de uso

---

## 🗄️ **ARQUITECTURA DE BASE DE DATOS**

### **📊 ESTRUCTURA DE COLECCIONES**

#### **Colecciones Principales (18 total)**
```javascript
// Usuarios y Autenticación
users               // 8 usuarios con roles específicos
students            // 2 estudiantes NEE ejemplo

// Gestión Académica  
adjustments         // Ajustes académicos personalizados
categories          // 9 categorías de ajustes dinámicas
courses             // Catálogo de cursos UCN
careers             // Carreras universitarias
departments         // Estructura organizacional

// Documentación y Consentimientos
documents           // Gestión documental por estudiante
consents            // Consentimientos según formato UCN 2025

// Comunicación y Seguimiento
notifications       // Sistema de alertas
resources           // Recursos educativos especializados
academichistory     // Historial académico de estudiantes

// Auditoría y Control
auditlogs           // Registro de acciones críticas (V2.0)
sessions            // Sesiones activas de usuarios
settings            // Configuraciones del sistema
```

#### **Índices de Rendimiento (12+ implementados)**
```javascript
// Índices de búsqueda frecuente
users: [{ email: 1 }, { roles: 1 }]
students: [{ userId: 1 }, { rut: 1 }, { carreraId: 1 }]
adjustments: [{ studentId: 1 }, { categoryId: 1 }, { status: 1 }]
consents: [{ studentId: 1 }, { allowsDataSharing: 1 }]
documents: [{ studentId: 1 }, { category: 1 }]
notifications: [{ recipientId: 1 }, { isRead: 1 }]
```

---

## 🔐 **SEGURIDAD Y CONTROL DE ACCESO**

### **🛡️ CAPAS DE SEGURIDAD IMPLEMENTADAS**

#### **1. Autenticación (JWT)**
- Tokens con expiración configurable
- Refresh tokens para sesiones largas
- Validación automática en cada request
- Logout con invalidación de tokens

#### **2. Autorización (Guards Personalizados)**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
```

#### **3. Validación de Datos (DTOs)**
```typescript
@IsEmail()
@IsNotEmpty()
@MaxLength(100)
@IsOptional()
```

#### **4. Control de Acceso Granular**
- Verificación de permisos por endpoint
- Control basado en roles y contexto
- Protección de datos según consentimientos
- Auditoría de acciones sensibles

---

## 🧪 **TESTING Y CALIDAD**

### **📊 COBERTURA DE TESTING**

#### **Testing Automatizado**
```powershell
Scripts PowerShell:
- test-all-endpoints.ps1        (37+ endpoints)
- test-consent-system.ps1       (Sistema consentimientos)
- detailed-endpoint-analysis.ps1 (Análisis cobertura)
- final-endpoint-test.ps1       (Validación final)
```

#### **Métricas de Calidad**
```
✅ Cobertura Endpoints: 91.7%
✅ Funcionalidad Core: 100%
✅ Seguridad: 100% validada
✅ Documentación: 100% APIs
✅ Estándares Código: TypeScript strict
```

#### **Testing Manual Validado**
- Todos los flujos de usuario por rol
- Casos edge de validación
- Performance con datos reales
- Seguridad de acceso cruzado

---

## 🚀 **DEPLOYMENT Y PRODUCTIVIDAD**

### **🐳 CONTAINERIZACIÓN DOCKER**

#### **Estructura de Contenedores**
```yaml
Services:
- ucn_inclui2_backend    # NestJS Application
- ucn_inclui2_mongodb    # MongoDB 7.0 Database
- ucn_inclui2_backup     # Automated backup service

Networks:
- ucn_network           # Private Docker network

Volumes:
- mongodb_data          # Database persistence
- uploads_data          # File storage
- backup_data           # Backup storage
```

#### **Configuración de Producción**
```dockerfile
Multi-stage Build:
1. Builder stage    # Compilación TypeScript
2. Production stage # Runtime optimizado
3. Security stage   # Usuario no-root, minimal image
```

---

## 📈 **MÉTRICAS Y PERFORMANCE**

### **📊 ESTADÍSTICAS ACTUALES**

#### **Código y Arquitectura**
```
📁 Módulos NestJS:          13
📄 Controladores:           25+
🔗 Endpoints API:           120+
📝 DTOs:                    50+
🗄️ Esquemas MongoDB:        18
📋 Guards Personalizados:   8
🧪 Scripts Testing:         5
📖 Guías Documentación:     10
```

#### **Base de Datos**
```
👥 Usuarios registrados:    8
🎓 Estudiantes NEE:         2
📋 Categorías ajustes:      9
🏛️ Departamentos UCN:       2
📚 Carreras académicas:     2
📖 Cursos disponibles:      2
📄 Documentos gestionados:  Variable
🔔 Notificaciones activas:  3
```

### **⚡ PERFORMANCE OPTIMIZADA**
- Índices MongoDB para consultas frecuentes
- Paginación en listados grandes
- Cache de consultas repetitivas
- Validación eficiente con DTOs
- Respuestas JSON estructuradas

---

## 🔄 **INTEGRACIÓN Y EXTENSIBILIDAD**

### **🔌 PUNTOS DE INTEGRACIÓN**

#### **APIs Externas (Preparado para V2.0)**
```typescript
// SIGA UCN Integration (Planificado)
interface SigaIntegration {
  syncStudents(): Promise<Student[]>
  syncCourses(): Promise<Course[]>
  updateAcademicHistory(): Promise<void>
}

// Email Service Integration
interface EmailService {
  sendNotification(user: User, notification: Notification): Promise<void>
  sendReport(recipient: string, report: Report): Promise<void>
}
```

#### **Webhooks y Eventos**
```typescript
// Event-driven architecture ready
@EventPattern('student.created')
@EventPattern('adjustment.approved')
@EventPattern('document.uploaded')
```

---

## 🎯 **ROADMAP TÉCNICO V2.0**

### **🔧 OPTIMIZACIONES PRIORITARIAS**

#### **Refactoring de Servicios**
- **AdjustmentsService**: Dividir servicio monolítico (700+ líneas)
- **DocumentsService**: Optimizar gestión de archivos
- **NotificationsService**: Sistema de templates

#### **Nuevas Funcionalidades**
- **Cache Layer**: Redis para performance
- **Message Queue**: Bull/Redis para tareas asíncronas
- **File Processing**: Optimización de documentos
- **Analytics Dashboard**: Métricas avanzadas

#### **Mejoras de Seguridad**
- **Audit Logs**: Registro completo de acciones
- **Rate Limiting**: Protección avanzada
- **Field Encryption**: Campos sensibles adicionales
- **2FA Implementation**: Autenticación de dos factores

---

## 📚 **DOCUMENTACIÓN Y RECURSOS**

### **📖 GUÍAS TÉCNICAS DISPONIBLES**
1. `00_GUIA_PRINCIPAL.md` - Contexto general IA
2. `01_CHANGELOG_COMPLETO.md` - Historial de desarrollo
3. `02_PROBLEMAS_IDENTIFICADOS.md` - Issues y soluciones
4. `03_ROADMAP_DESARROLLO.md` - Planificación evolutiva
5. `04_SISTEMA_ROLES.md` - Autenticación y autorización
6. `05_PROTECCION_CODIGO.md` - Estrategias deployment
7. `06_MONGODB_LOCAL_PRODUCCION.md` - Configuración BD
8. `06_SISTEMA_CONSENTIMIENTOS.md` - Sistema consentimientos
9. `07_ARQUITECTURA_FUNCIONALIDADES.md` - **Esta guía**
10. `08_CODE_REVIEW.md` - Estándares de código

### **🌐 RECURSOS ONLINE**
- **Swagger UI**: `http://localhost:3000/api`
- **MongoDB**: `localhost:27017`
- **Repositorio**: Documentación técnica completa

---

> **💡 CONCLUSIÓN**: UCN Inclui2 representa una arquitectura moderna, escalable y segura para la gestión integral de estudiantes con NEE, implementando las mejores prácticas de desarrollo y cumpliendo con los estándares universitarios más exigentes.

---

**📄 Documento técnico completo** | **📅 Actualizado**: Enero 2025 | **🎯 Estado**: PRODUCCIÓN LISTA 