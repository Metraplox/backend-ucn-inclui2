# 🤖 GUÍA PRINCIPAL - IA ASSISTANT CONTEXTO
## Proyecto: Plataforma Inclusiva UCN - Backend Microservicios

### 📅 **Última Actualización**: 17 Diciembre 2025
### 🎯 **Objetivo**: Mantener contexto eficiente para desarrollo asistido por IA

---

## 📁 **ESTRUCTURA DE GUÍAS**

### **Guías de Contexto**
- `00_GUIA_PRINCIPAL.md` - **Esta guía** (índice y contexto general)
- `01_ARQUITECTURA_ACTUAL.md` - Estado actual del sistema y diseño
- `02_PROBLEMAS_IDENTIFICADOS.md` - Issues críticos y técnicos encontrados
- `03_ROADMAP_DESARROLLO.md` - Plan de desarrollo y prioridades

### **Guías Técnicas Específicas**
- `04_SISTEMA_ROLES.md` - Análisis y refactoring del sistema de roles
- `05_SERVICIOS_AJUSTES.md` - Estado y mejoras del módulo de ajustes
- `06_BASE_DATOS.md` - Esquemas, agregaciones y optimizaciones
- `07_API_ENDPOINTS.md` - Documentación de endpoints y cambios

### **Guías de Proceso**
- `08_CODE_REVIEW.md` - Estándares y checklist de revisión
- `09_DEPLOYMENT.md` - Configuración y despliegue
- `10_TESTING.md` - Estrategia de testing y casos

---

## 🎯 **CONTEXTO DEL PROYECTO**

### **¿Qué es Inclui2?**
Plataforma web para gestionar **ajustes razonables** para estudiantes con Necesidades Educativas Especiales (NEE) en la Universidad Católica del Norte (UCN).

### **Stakeholders Principales**
- **👩‍💼 Coordinadora** - Admin del proyecto, cliente principal
- **👩‍🏫 Educadora Social** - Entrevistas iniciales, registro usuarios
- **🏛️ Personal DIDDEC** - Dirección Desarrollo Estudiantil  
- **👨‍🎓 Jefes de Carrera** - Gestión académica por carrera
- **👨‍🏫 Jefes de Departamento** - Gestión académica por departamento
- **👩‍🏫 Docentes** - Profesores que implementan ajustes
- **🎓 Estudiantes** - Beneficiarios con NEE

### **Tecnologías Principales**
- **Backend**: NestJS + TypeScript + MongoDB
- **Frontend**: Flutter (móvil) + React (web - planificado)
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: JWT + Google OAuth
- **Documentación**: Swagger/OpenAPI

---

## 🔄 **ESTADO ACTUAL DEL DESARROLLO**

### **✅ Funcionalidades Implementadas**
1. **Sistema de Autenticación** - JWT + Google OAuth
2. **Gestión de Usuarios** - CRUD completo con roles
3. **Módulo de Estudiantes** - Perfil y gestión académica
4. **Módulo de Ajustes** - CRUD, estados, notificaciones
5. **Sistema de Documentos** - Upload, gestión, verificación
6. **Módulo de Cursos** - Gestión académica
7. **Sistema de Notificaciones** - Tiempo real
8. **Sincronización Hawaii** - Integración con sistema UCN
9. **Estadísticas y Reportes** - Dashboard DIDDEC

### **⚠️ Áreas con Problemas Identificados**
1. **Sistema de Roles** - Inconsistente, confuso, inseguro
2. **Servicios Sobrecargados** - Violación principios SOLID
3. **Archivos Duplicados** - Error de merge
4. **Métodos Placeholder** - Funcionalidad incompleta
5. **Exception Handling** - Inconsistente

---

## 📊 **MÉTRICAS DE CALIDAD ACTUAL**

| Módulo | Estado | Calidad | Prioridad Fix |
|--------|--------|---------|---------------|
| Auth | ✅ Estable | 8/10 | Baja |
| Users | ⚠️ Roles confusos | 6/10 | **ALTA** |
| Adjustments | ⚠️ Sobrecargado | 6/10 | **ALTA** |
| Documents | ✅ Funcional | 7/10 | Media |
| Courses | ✅ Estable | 8/10 | Baja |
| Notifications | ✅ Funcional | 7/10 | Media |
| Departments | ❌ Stats rotas | 4/10 | **CRÍTICA** |

---

## 🎯 **CÓMO USAR ESTAS GUÍAS COMO IA**

### **Inicio de Sesión de Desarrollo**
1. **Lee `01_ARQUITECTURA_ACTUAL.md`** para contexto técnico
2. **Revisa `02_PROBLEMAS_IDENTIFICADOS.md`** para issues conocidos
3. **Consulta `03_ROADMAP_DESARROLLO.md`** para prioridades

### **Para Tareas Específicas**
- **Roles/Permisos** → `04_SISTEMA_ROLES.md`
- **Módulo Ajustes** → `05_SERVICIOS_AJUSTES.md`
- **Base de Datos** → `06_BASE_DATOS.md`
- **APIs** → `07_API_ENDPOINTS.md`

### **Para Code Review**
- **Consulta `08_CODE_REVIEW.md`** para estándares
- **Verifica problemas conocidos** en guías específicas
- **Actualiza guías** con nuevos hallazgos

### **Actualización de Guías**
- **Fecha** cada cambio significativo
- **Documenta** nuevos problemas encontrados
- **Actualiza** estado de resolución de issues
- **Mantén** roadmap sincronizado

---

## 🚨 **ISSUES CRÍTICOS ACTUALES**

### **CRÍTICO (Arreglar HOY)**
1. ❌ `user.decorator 2.ts` duplicado
2. ❌ `findByDepartment()` retorna siempre `[]`
3. ❌ Estadísticas departamentales rotas

### **ALTO (Esta Semana)**
1. ⚠️ Refactorizar `AdjustmentsService` (709 líneas)
2. ⚠️ Unificar sistema de roles
3. ⚠️ Exception handling consistente

### **MEDIO (2 Semanas)**
1. 📋 Documentar APIs faltantes
2. 📋 Tests para nuevos endpoints
3. 📋 Optimizar queries MongoDB

---

## 📝 **NOTAS PARA COLABORACIÓN**

### **Con el Equipo de Desarrollo**
- **Los compañeros** tienen competencia técnica sólida
- **Problemas** son típicos de desarrollo junior colaborativo
- **Enfoque** en mentoring y mejores prácticas

### **Comunicación con Stakeholders**
- **Coordinadora** es cliente principal y admin
- **Necesario definir** roles específicos claramente
- **Validar** permisos con usuarios reales

### **Mantenimiento de Contexto IA**
- **Actualizar** esta guía después de cada sesión importante
- **Documentar** decisiones técnicas y razones
- **Mantener** enlaces entre problemas y soluciones

---

## 🔗 **ENLACES RÁPIDOS**

### **Repositorios**
- **Backend Actual**: `C:\Users\fabi_\Desktop\U\Proyecto Plataformas\V2\backend-ucn-inclui2`
- **Backend Original**: `C:\Users\fabi_\Desktop\U\Proyecto Plataformas\Hito intermedio adan\backend-ucn-inclui2\backend-ucn-inclui2`

### **Documentación Externa**
- **Diseño Original**: `../Hito intermedio adan/backend-ucn-inclui2/backend-ucn-inclui2/GUIA-PROYECTO/Diseño Final.md`
- **API Reference**: `./API_REFERENCE.json`
- **Swagger**: `http://localhost:3000/api` (cuando servidor esté corriendo)

---

## 🎯 **PRÓXIMOS PASOS INMEDIATOS**

1. **Leer/Actualizar** `02_PROBLEMAS_IDENTIFICADOS.md`
2. **Revisar** `04_SISTEMA_ROLES.md` para plan de refactoring
3. **Consultar** `03_ROADMAP_DESARROLLO.md` para prioridades
4. **Implementar** correcciones críticas identificadas

---

> **💡 Nota**: Esta guía debe ser el **primer archivo consultado** en cada sesión de desarrollo para mantener contexto completo y eficiente. 