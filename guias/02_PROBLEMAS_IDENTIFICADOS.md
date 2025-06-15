# 🚨 PROBLEMAS IDENTIFICADOS - Análisis Técnico Detallado
## Proyecto: Plataforma Inclusiva UCN - INCLUYE

### 📅 **Última Actualización**: 15 Junio 2025
### 🔍 **Fuente**: Análisis comparativo BackProfeV2 vs b-end-plus original + Requisitos clienta

---

## 🔴 **PROBLEMAS CRÍTICOS (ARREGLAR HOY)**

### **1. Archivo Duplicado por Error de Merge**
```bash
# UBICACIÓN
src/auth/decorators/user.decorator.ts      ✅ Original (303B, 11 líneas)
src/auth/decorators/user.decorator 2.ts   ❌ DUPLICADO IDÉNTICO

# SOLUCIÓN INMEDIATA
rm "src/auth/decorators/user.decorator 2.ts"
```

### **2. Métodos Placeholder con Implementación Vacía - CRÍTICO PARA FUNCIONALIDAD**
```typescript
// UBICACIÓN: src/adjustments/adjustments.service.ts líneas 25-31
async findByDepartment(departmentId: string, semester: string): Promise<any[]> {
  // ⚠️ IMPLEMENTACIÓN VACÍA - Solo retorna []
  return [];
}

// UBICACIÓN: src/courses/courses.service.ts líneas 15-19  
async findByDepartment(departmentId: string, semester: string): Promise<any[]> {
  // ⚠️ IMPLEMENTACIÓN VACÍA - Solo retorna []
  return [];
}

// UBICACIÓN: src/students/students.service.ts líneas 15-18
async findByDepartmentWithNEE(departmentId: string, semester: string): Promise<any[]> {
  // ⚠️ IMPLEMENTACIÓN VACÍA - Solo retorna []
  return [];
}

// IMPACTO: Aunque existe DepartmentStatsService que SÍ funciona, estos métodos vacíos se usan en departments.service.ts línea 116, causando datos incorrectos
```

### **3. Sistema de Roles Completamente Roto - BLOQUEA REQUISITOS CLIENTA**
```typescript
// PROBLEMA: 3 ENUMS DIFERENTES E INCONSISTENTES

// 1. UserRole (user.schema.ts) - LIMITADO Y NO CUMPLE REQUISITOS
export enum UserRole {
  ADMIN = 'administrador',        // ¿Es la Coordinadora de INCLUYE?
  STAFF = 'personal',             // ¿Educadora? ¿DIDDEC? ¿Ambas? AMBIGUO
  STUDENT = 'estudiante',         // ✅ Claro
  TEACHER = 'docente',            // ✅ Claro
  SUPPORT_UNIT = 'unidad_apoyo'   // ❌ NUNCA USADO - No en requisitos
}

// ANÁLISIS SEGÚN REQUISITOS CLIENTA:
// ❌ NO HAY ROL ESPECÍFICO PARA "EDUCADORA SOCIAL" (parte de INCLUYE)
// ❌ "STAFF" se usa para TODO pero no está definido en requisitos
// ❌ JEFES DE CARRERA tienen funciones específicas NO cubiertas por TEACHER
// ❌ DIDDEC tiene permisos específicos NO cubiertas por STAFF

// IMPACTO CRÍTICO EN REQUISITOS
- ❌ Educadora no puede "registrar estudiantes" específicamente
- ❌ Jefes de carrera sin acceso a "listado de estudiantes de su carrera"
- ❌ DIDDEC sin "seguimiento de ajustes implementados"
- ❌ Pérdida de granularidad en "niveles de visualización"
```

---

## ⚠️ **PROBLEMAS DE ALTA PRIORIDAD (ESTA SEMANA)**

### **4. Violación Masiva del Principio SRP - AdjustmentsService**
```typescript
// UBICACIÓN: src/adjustments/adjustments.service.ts (709 LÍNEAS)

// RESPONSABILIDADES MÚLTIPLES DETECTADAS:
✅ CRUD básico (create, findOne, update, remove)
✅ Búsquedas complejas (findByCourseNrc, findByStudentId) 
✅ Gestión de estados (updateStatus, markAsRead)
✅ Estadísticas (countAdjustments, getAdjustmentCountByType)
✅ Asociación de documentos (associateDocument)
✅ Solicitudes de ayuda (requestHelp)

// REFACTORING REQUERIDO
adjustments.service.ts           // Solo CRUD básico
adjustments-search.service.ts    // Búsquedas por carrera/departamento
adjustments-tracking.service.ts  // Seguimiento y check docentes
adjustments-reports.service.ts   // Reportes y exportación Excel
adjustments-docs.service.ts      // Gestión de documentos/consentimiento
adjustments-help.service.ts      // Sistema de solicitud acompañamiento
```

### **5. Estado Real de Requisitos de la Clienta - ANÁLISIS CORREGIDO**
```typescript
// REQUISITOS ANALIZADOS:

// 1. SISTEMA DE CONSENTIMIENTO - ✅ IMPLEMENTADO PARCIALMENTE
// Requisito: "visualización para incluye (Sí), Para docentes y jefaturas de carrera sólo con consentimiento del/la estudiante"
✅ Modelo Consent completo en src/consent/schemas/consent.schema.ts
✅ ConsentService con métodos para dar/actualizar consentimiento
✅ ConsentController con endpoints REST
✅ Frontend Flutter con pantallas de consentimiento
⚠️ Falta: Control granular en guards/permisos por consentimiento

// 2. SISTEMA DE CHECK DOCENTES - ✅ IMPLEMENTADO
// Requisito: "Visualizar que el docente revisó ajustes en plataforma (check)"
✅ Campo readBy en adjustment.schema.ts con userId, readDate, comments
✅ Endpoint PATCH /teachers/adjustments/:id/acknowledge
✅ Endpoint PATCH /:adjustmentId/current/:index/mark-as-read
✅ Frontend Flutter implementa _sendCheckAdjustment()
✅ DIDDECController.getTeachersPerformance() analiza readBy

// 3. EXPORTACIÓN A EXCEL - ✅ IMPLEMENTADO
// Requisito: "Reportabilidad - Exportar Excel" (mencionado 4 veces en requisitos)
✅ ExportService completo en src/diddec/services/export.service.ts
✅ ReportType enum con 6 tipos de reportes diferentes
✅ ExportFormat.EXCEL y CSV soportados
✅ DiddecReportsController con endpoints POST /export y GET /download
✅ Reportes por departamento, carrera, estudiantes, compliance

// 4. SISTEMA DE SEGUIMIENTO SEMESTRAL - ⚠️ PARCIALMENTE IMPLEMENTADO
// Requisito: "seguimiento de ajustes implementados por parte de los docentes (las encuestas de seguimiento)"
✅ markAsImplemented() endpoint para marcar ajustes como implementados
✅ AdjustmentStatus.IMPLEMENTED tracking
✅ Notificaciones a DIDDEC cuando se implementa
❌ Falta: Formularios de encuestas semestrales específicas
❌ Falta: Modelo FollowUpSurvey estructurado

// 5. GESTIÓN DE CATEGORÍAS DE AJUSTES - ❌ NO ENCONTRADO
// Requisito: "la educadora [...] quiere poder agregar, editar categorías de ajustes razonables"
❌ No hay endpoints para CRUD de categorías específicos
❌ No hay control de permisos para educadora específicamente
✅ Existe AdjustmentService.getAdjustmentCategories() pero es estático
```

---

## 🎯 **ANÁLISIS DE ROLES SEGÚN REQUISITOS CLIENTA**

### **Roles Reales Identificados en requisitos.txt**

```typescript
// BASADO EN ANÁLISIS DE requisitos.txt

// 1. 👩‍💼 COORDINADORA/ADMIN DE INCLUYE
// Requisitos específicos:
- Ingreso de información de diagnóstico
- Ingreso de ajustes razonables del estudiante  
- Ingreso de actualizaciones de ajustes razonables
- Generación de reporte con historial
- Reportabilidad - Exportar Excel
- Confirmación de documentos de consentimiento firmados
- Almacenar registro de ramos cursados por estudiante
- Ver semestres y desplegar cursos con ajustes

// 2. 👩‍🏫 EDUCADORA SOCIAL (parte de INCLUYE - ROL INEXISTENTE EN CÓDIGO)
// Requisitos específicos según tu análisis:
- Registra usuarios (estudiantes NEE)
- Analiza estudiantes y su progreso
- Agrega, elimina, permite o habilita ajustes a estudiantes
- Hace reportes para presentar
- Puede agregar, editar categorías de ajustes razonables

// 3. 🏛️ PERSONAL DIDDEC
// Requisitos específicos:
- Visualizar diagnósticos (con consentimiento)
- Visualizar información de ajustes del estudiante
- Ver que docente revisó ajustes (check) + alertas
- Subir recursos de acompañamiento y material de apoyo
- Seguimiento de ajustes implementados (encuestas)
- Reportabilidad - Exportar Excel

// 4. 👨‍🎓 JEFE DE CARRERA (NUEVO - NO EN DISEÑO ORIGINAL)
// Requisitos específicos:
- Visualizar estudiantes con diagnóstico (solo con consentimiento)
- Listado de estudiantes DE SU CARRERA
- Alerta de información disponible y actualización de ajustes
- Visualización de ficha de ajustes por diagnósticos
- Reportabilidad - Exportar Excel

// 5. 👩‍🏫 DOCENTE
// Requisitos específicos:
- Visualizar diagnósticos (solo con consentimiento)
- Visualizar ajustes de sus estudiantes
- Solicitud de acompañamiento: "Lo puedo implementar" vs "Requiere Acompañamiento"
- Observaciones: comunicación con unidades de apoyo
- Marcar ajustes como revisados (CHECK)

// 6. 🎓 ESTUDIANTE
// Requisitos específicos:
- Vista de información de ajustes informados
- Informar cumplimiento/incumplimiento de ajustes
- Subir archivos (certificados médicos)
- Acceder a formulario de actualización semestral
- Confirmar uso de ajuste de tiempo en cada asignatura (cada semestre)
- Descargar y subir documento de consentimiento firmado
```

### **Problema STAFF Ambiguo**
```typescript
// ACTUALMENTE EN CÓDIGO:
// UserRole.STAFF se usa para TODO sin diferenciación

// SEGÚN REQUISITOS, "STAFF" DEBERÍA SER:
// 1. Educadora Social (parte de INCLUYE)
// 2. Personal DIDDEC  
// 3. Otras unidades de apoyo (DEA, AORA, DGPRE, etc.)

// PERO CADA UNO TIENE PERMISOS DIFERENTES:
- Educadora: registro, análisis, reportes básicos, gestión categorías
- DIDDEC: seguimiento, alertas, reportes avanzados, recursos
- Otras unidades: solo comunicación específica (futuro desarrollo)
```

---

## 📊 **MÉTRICAS DE IMPACTO REALES**

| Problema | Severidad | Impacto Usuario | Impacto Desarrollo | Tiempo Fix | Estado Real |
|----------|-----------|-----------------|-------------------|------------|-------------|
| Archivo Duplicado | CRÍTICO | Ninguno | Alto | 5 min | ❌ Confirmado |
| Métodos placeholder vacíos | ALTO | Medio | Medio | 1-2 horas | ❌ Confirmado |
| Sistema Roles | CRÍTICO | Alto | Muy Alto | 3-5 días | ❌ Confirmado |
| SRP Violation | ALTO | Medio | Muy Alto | 1 semana | ❌ Confirmado |
| CRUD Categorías ajustes | MEDIO | Bajo | Medio | 1-2 días | ❌ Falta |
| Encuestas semestrales | MEDIO | Medio | Medio | 3-5 días | ⚠️ Parcial |

---

## 🎯 **PLAN DE CORRECCIÓN PRIORIZADO**

### **EMERGENCIA - Día 1 (Hoy)**
1. **Eliminar** `user.decorator 2.ts` (5 min) - ✅ Confirmado duplicado
2. **Implementar métodos placeholder** en adjustments, courses y students services (1-2 horas)
3. **Verificar** que DepartmentStatsService sigue funcionando correctamente (30 min)

### **CRÍTICO - Día 2-4 (Sistema de Roles)**
1. **Definir roles específicos** con base en requisitos clienta (4 horas)
2. **Crear UserRole unificado** que cubra requisitos (2 horas)
3. **Implementar permisos granulares** por funcionalidad (8 horas)
4. **Testing exhaustivo** de permisos por rol (4 horas)

### **ALTO - Semana 1 (Funcionalidades Realmente Faltantes)**
1. **Integrar control de consentimiento** en guards/permisos (8 horas)
2. **CRUD categorías de ajustes** para educadora (8 horas)
3. **Sistema de encuestas semestrales** estructurado (12 horas)
4. **Refactoring AdjustmentsService** (16 horas)

---

## 📝 **ESTADO DE CORRECCIONES**

### **Críticos**
- [ ] **Crítico 1**: Archivo duplicado eliminado
- [ ] **Crítico 2**: findByDepartment() implementado y funcionando
- [ ] **Crítico 3**: Sistema de roles rediseñado según requisitos

### **Alta Prioridad**
- [ ] **Alto 1**: Refactoring AdjustmentsService completado
- [ ] **Alto 2**: Sistema de consentimiento implementado
- [ ] **Alto 3**: Check docentes y alertas funcionando
- [ ] **Alto 4**: Exportación Excel disponible
- [ ] **Alto 5**: CRUD categorías de ajustes para educadora

### **Requisitos Específicos de Clienta**
- [ ] **Req 1**: "Visualizar que el docente revisó ajustes en plataforma (check)"
- [ ] **Req 2**: "Reportabilidad - Exportar Excel" (4 menciones en requisitos)
- [ ] **Req 3**: "la educadora [...] quiere poder agregar, editar categorías de ajustes razonables"
- [ ] **Req 4**: "seguimiento de ajustes implementados por parte de los docentes (encuestas)"
- [ ] **Req 5**: "documento de consentimiento firmado [...] para poder informar a los docentes"

---

## 🔗 **ENLACES RELACIONADOS**
- Ver `04_SISTEMA_ROLES.md` para análisis detallado de roles según requisitos
- Ver `03_ROADMAP_DESARROLLO.md` para cronograma detallado
- Ver `08_CODE_REVIEW.md` para prevenir futuros problemas
- **CRÍTICO**: Consultar `C:\Users\fabi_\Desktop\U\Proyecto Plataformas\Hito intermedio adan\backend-ucn-inclui2\backend-ucn-inclui2\GUIA-PROYECTO\requisitos.txt` para validar implementaciones

---

## 📋 **DECISIONES TÉCNICAS PENDIENTES**

### **Con Stakeholders (URGENTE)**
1. **¿Educadora Social es rol separado de Coordinadora?** - Impacta permisos
2. **¿Qué puede hacer Jefe de Departamento vs Jefe de Carrera?** - No está específicamente en requisitos
3. **¿Cómo funciona el workflow de consentimiento?** - Crítico para niveles de visualización
4. **¿Qué alertas específicas necesita cada rol?** - Para sistema de notificaciones

### **Técnicas**
1. **¿Separar DIDDEC en subcategorías?** - Pueden tener permisos diferentes
2. **¿Crear servicio intermedio para dependencias cruzadas?** - Para evitar circular deps
3. **¿Cómo manejar permisos temporales?** - Jefes suplentes, etc.

---

> **⚠️ CRÍTICO**: Esta guía debe actualizarse cada vez que se resuelva un problema. Los problemas críticos están **BLOQUEANDO** la entrega del sistema según requisitos de la clienta y requieren atención **INMEDIATA**.

---

## ⚠️ **RESUMEN EJECUTIVO CORREGIDO**

El análisis profundo del backend BackProfeV2 revela que **muchas funcionalidades críticas YA ESTÁN IMPLEMENTADAS**, pero persisten problemas de arquitectura que requieren atención:

### **🚨 PROBLEMAS REALES QUE REQUIEREN ATENCIÓN:**
- **Sistema de roles roto**: Múltiples enums conflictivos impiden permisos granulares (CONFIRMADO)
- **Métodos placeholder**: Algunos servicios tienen métodos vacíos que afectan consistencia
- **Archivo duplicado**: Error de merge simple pero crítico para deployment

### **✅ FUNCIONALIDADES CRÍTICAS YA IMPLEMENTADAS:**
- **Sistema de consentimiento**: Completo con modelos, servicios y frontend
- **Check docentes**: Sistema readBy implementado con endpoints y UI
- **Exportación Excel/CSV**: ExportService robusto con 6 tipos de reportes
- **Sistema de seguimiento**: markAsImplemented() y notificaciones funcionando

### **⏰ ESTIMACIÓN CORREGIDA:**
- **Arreglar críticos**: 1-2 días (duplicado + placeholder + roles básico)
- **Optimizar sistema**: 1 semana
- **Funcionalidades pendientes menores**: 2-3 días

### **💡 RECOMENDACIÓN ACTUALIZADA:**
El sistema está **mucho más avanzado** de lo inicialmente reportado. Se requiere:
1. **Arreglos críticos rápidos** (2 días)
2. **Mejoras arquitecturales** (1 semana) 
3. **Funcionalidades menores** (según prioridad)

**Estado actual: CERCA DE LISTO** - principalmente requiere correcciones arquitecturales.
