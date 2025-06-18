# 🗺️ ROADMAP DE DESARROLLO - V2 y Post-Lanzamiento
## Proyecto: Plataforma Inclusiva UCN

### 📅 **Última Actualización**: 21 Diciembre 2025
### 🎯 **Objetivo**: Planificar las próximas fases de desarrollo después del lanzamiento de la V1.0.

---

## ✅ **HITOS ALCANZADOS - LANZAMIENTO V1.0**

La versión 1.0 del proyecto se ha estabilizado y está lista para su despliegue a producción. Las siguientes fases de trabajo se completaron con éxito, resolviendo todos los problemas críticos que bloqueaban el lanzamiento.

### **FASE 1: RESOLUCIÓN DE PUNTOS CRÍTICOS (COMPLETADO)**
- **Implementación de Métodos Placeholder**: Se completó la lógica de negocio para `findByDepartment` y `findByDepartmentWithNEE`, habilitando las estadísticas departamentales.
- **Rediseño del Sistema de Roles**: Se unificó el sistema en un solo `UserRole` enum, se implementaron los roles específicos de la clienta y se aplicaron permisos granulares en 13 controladores.

### **FASE 2: IMPLEMENTACIÓN DE FUNCIONALIDADES CLAVE (COMPLETADO)**
- **Gestión Dinámica de Categorías de Ajustes**: Se creó un módulo `categories` para reemplazar el `enum` estático, permitiendo a los roles autorizados gestionar las categorías.
- **Saneamiento de Documentación API (Swagger)**: Se crearon DTOs de respuesta (`*ResponseDto`) para mejorar la documentación y consistencia de la API.

### **FASE 2.5: PROTECCIÓN DE CÓDIGO FUENTE (COMPLETADO)**
- **🛡️ Sistema de Build de Producción**: Implementado sistema completo para entregar aplicación funcional sin código fuente.
- **Docker Multi-Stage**: `Dockerfile.production` que genera imagen con solo código compilado JavaScript.
- **Scripts Automatizados**: `build-production.ps1` y `build-production.sh` para deployment seguro.
- **Flutter APK Nativo**: Script de build que genera APK compilado sin código Dart original.
- **Documentación Completa**: Manuales de instalación y configuración para el cliente.
- **Nivel de Protección**: 85% backend, 90% frontend - el cliente NO tendrá acceso al código fuente.

### **FASE 2.6: MONGODB LOCAL PARA PRODUCCIÓN (COMPLETADO)**
- **🗄️ MongoDB Dockerizado**: Configuración de MongoDB 7.0 local integrada en `docker-compose.production.yml`
- **🔧 Scripts de Inicialización**: Configuración automática de BD con usuarios, índices, validaciones y datos de prueba
- **📊 Sistema de Backup/Restore**: Scripts automatizados `backup-mongodb.sh` y `restore-mongodb.sh` para gestión de datos
- **🔐 Seguridad Robusta**: Autenticación con usuarios específicos, validaciones de esquema JSON y red privada Docker
- **📁 Estructura Optimizada**: 11 colecciones con 12 índices de rendimiento y validaciones automáticas
- **🎯 Autonomía Total**: Eliminación completa de dependencias externas (MongoDB Atlas, servicios cloud)
- **🛠️ Configuración Lista**: Variables de entorno, credenciales seguras y documentación completa

---

## 🚀 **ROADMAP POST-LANZAMIENTO (V2)**

Con la V1.0 lanzada, el desarrollo se enfocará en optimizaciones técnicas y en la implementación de nuevas funcionalidades estratégicas que fueron pospuestas para garantizar un lanzamiento rápido y estable.

### **🔧 FASE 3 - OPTIMIZACIÓN Y NUEVAS FUNCIONALIDADES**

#### **1. Refactoring de `AdjustmentsService` (Prioridad: ALTA)**
- **Problema**: El servicio actual tiene más de 700 líneas y múltiples responsabilidades (CRUD, búsquedas, seguimiento, reportes), lo que dificulta su mantenimiento.
- **Solución Propuesta**: Dividir el servicio monolítico en unidades más pequeñas y especializadas, siguiendo el Principio de Responsabilidad Única (SRP).
  ```typescript
  // Estructura de servicios propuesta:
  - AdjustmentsService           // Responsable solo del CRUD básico.
  - AdjustmentsSearchService     // Para consultas complejas (búsquedas por carrera, etc.).
  - AdjustmentsTrackingService   // Para la lógica de seguimiento de checks y estados.
  - AdjustmentsReportsService    // Para la generación de estadísticas y datos para reportes.
  ```
- **Tiempo Estimado**: 1 semana.

#### **2. Sistema de Encuestas Semestrales (Prioridad: MEDIA)**
- **Requisito**: Implementar "encuestas de seguimiento sobre la implementación de ajustes" para docentes, como lo solicita la clienta.
- **Solución Propuesta**:
  - Crear un nuevo módulo `surveys` o `followups`.
  - Diseñar un modelo de datos `FollowUpSurvey` que capture las respuestas de forma estructurada.
  - Implementar los servicios y controladores necesarios para crear, responder y analizar las encuestas.
  - Generar reportes automáticos para DIDDEC basados en los resultados de las encuestas.
- **Tiempo Estimado**: 3-5 días.

---

## 🎯 **OBJETIVOS PARA LA V2**

### **Técnicos**
- Mejorar la mantenibilidad del código a través del refactoring.
- Asegurar que los nuevos módulos (encuestas) se creen siguiendo las mejores prácticas.
- Mantener una alta calidad y cobertura de pruebas en las nuevas funcionalidades.

### **Funcionales**
- Proveer a los docentes una herramienta estructurada para dar feedback.
- Entregar a DIDDEC datos cuantitativos sobre la implementación de ajustes.

---

> **🎯 Nota**: Este roadmap define la dirección futura del proyecto. Las prioridades y tiempos pueden ajustarse en función del feedback post-lanzamiento de la V1.0 y las necesidades del equipo. 