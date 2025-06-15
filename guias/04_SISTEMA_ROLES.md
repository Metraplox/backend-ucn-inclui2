# 🔐 SISTEMA DE ROLES - Análisis y Plan de Refactoring
## Proyecto: Plataforma Inclusiva UCN

### 📅 **Última Actualización**: 17 Diciembre 2025
### 🎯 **Objetivo**: Refactorizar sistema de roles inconsistente y confuso

---

## 🚨 **PROBLEMA ACTUAL CRÍTICO**

### **Arquitectura Rota: 3 Enums Diferentes**
```typescript
// 1. UserRole (user.schema.ts) - LIMITADO Y CONFUSO
export enum UserRole {
  ADMIN = 'administrador',
  STAFF = 'personal',        // ⚠️ "Equivalente a coordinadora" - AMBIGUO
  STUDENT = 'estudiante',
  TEACHER = 'docente',
  SUPPORT_UNIT = 'unidad_apoyo' // ⚠️ NUNCA USADO
}

// 2. Role (users/enums/role.enum.ts) - COMPLETO PERO MAYÚSCULAS
export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',           // ⚠️ Sin propósito claro
  CAREER_HEAD = 'CAREER_HEAD',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  DIDDEC = 'DIDDEC'
}

// 3. Role (auth/enums/role.enum.ts) - COMPLETO PERO minúsculas
export enum Role {
  ADMIN = 'admin',
  STAFF = 'staff',           // ⚠️ Sin propósito claro
  CAREER_HEAD = 'career_head',
  DEPARTMENT_HEAD = 'department_head',
  DIDDEC = 'diddec'
}
```

### **Mapeo Problemático en RolesGuard**
```typescript
// PROBLEMA: Pérdida de especificidad en roles.guard.ts
function mapToUserRole(role: Role | UserRole | string): UserRole {
  if (role === Role.CAREER_HEAD) return UserRole.TEACHER;      // ❌ Pierde especificidad
  if (role === Role.DEPARTMENT_HEAD) return UserRole.TEACHER;  // ❌ Pierde especificidad  
  if (role === Role.DIDDEC) return UserRole.STAFF;            // ❌ Pierde especificidad
}

// RESULTADO: Todos los roles específicos se convierten en TEACHER o STAFF
// IMPACTO: No hay granularidad de permisos real
```

---

## 🏢 **ESTRUCTURA ORGANIZACIONAL REAL**

### **Roles Identificados con Stakeholders**
1. **👩‍💼 Coordinadora** - Admin del proyecto, cliente principal
2. **👩‍🏫 Educadora Social** - Entrevistas iniciales, registro usuarios
3. **🏛️ Personal DIDDEC** - Dirección Desarrollo Estudiantil  
4. **👨‍🎓 Jefe de Carrera** - Gestión académica por carrera
5. **👨‍🏫 Jefe de Departamento** - Gestión académica por departamento
6. **👩‍🏫 Docente** - Profesores que implementan ajustes
7. **🎓 Estudiante** - Beneficiarios con NEE

### **Problema: "STAFF" Ambiguo**
```typescript
// ACTUALMENTE UserRole.STAFF se usa para TODO:
- Personal de documentos
- Sincronización Hawaii
- Gestión de estudiantes
- Departamentos
- Solicitudes de ayuda

// ¿PERO QUÉ ES STAFF REALMENTE?
// user.schema.ts línea 6: STAFF = 'personal', // Equivalente a coordinadora o personal de inclusión
```

---

## ✅ **PROPUESTA DE REFACTORING COMPLETO**

### **1. UserRole Unificado y Específico**
```typescript
// ✅ NUEVA ESTRUCTURA PROPUESTA
export enum UserRole {
  // Administración
  COORDINADOR = 'coordinador',           // Admin/Cliente del proyecto
  
  // Personal Especializado  
  EDUCADOR_SOCIAL = 'educador_social',   // Entrevistas, registro usuarios
  DIDDEC_STAFF = 'diddec_staff',         // Personal DIDDEC
  
  // Académicos con Responsabilidades
  JEFE_CARRERA = 'jefe_carrera',         // Gestión académica de carrera
  JEFE_DEPARTAMENTO = 'jefe_departamento', // Gestión académica de departamento
  
  // Personal Académico
  DOCENTE = 'docente',                   // Profesores de asignaturas
  
  // Estudiantes
  ESTUDIANTE = 'estudiante'              // Estudiantes con NEE
}
```

### **2. Matriz de Permisos por Funcionalidad**
```typescript
// ✅ PERMISOS GRANULARES POR ÁREA

// === GESTIÓN DE USUARIOS ===
@Roles(UserRole.COORDINADOR, UserRole.EDUCADOR_SOCIAL)

// === GESTIÓN DE DOCUMENTOS ===
@Roles(UserRole.COORDINADOR, UserRole.EDUCADOR_SOCIAL, UserRole.DIDDEC_STAFF)

// === APROBACIÓN DE AJUSTES ===
@Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)

// === ESTADÍSTICAS DEPARTAMENTALES ===
@Roles(UserRole.COORDINADOR, UserRole.JEFE_DEPARTAMENTO, UserRole.DIDDEC_STAFF)

// === GESTIÓN DE CURSOS ===
@Roles(UserRole.COORDINADOR, UserRole.JEFE_DEPARTAMENTO, UserRole.DOCENTE)

// === IMPLEMENTACIÓN DE AJUSTES ===
@Roles(UserRole.DOCENTE)

// === CONSULTA DE AJUSTES PROPIOS ===
@Roles(UserRole.ESTUDIANTE)
```

---

## 🔄 **PLAN DE MIGRACIÓN**

### **FASE 1 - Preparación (1 día)**
1. Actualizar UserRole en user.schema.ts
2. Crear migration script para BD
3. Mapear roles existentes a nuevos

### **FASE 2 - Actualización de Controladores (2 días)**
1. Actualizar todos los @Roles() decorators
2. Eliminar enums duplicados
3. Actualizar imports

### **FASE 3 - Simplificación RolesGuard (1 día)**
1. Eliminar mapeos confusos
2. Verificación directa de roles
3. Testing exhaustivo

---

## 📊 **BENEFICIOS ESPERADOS**
- ✅ **Seguridad**: Permisos granulares reales
- ✅ **Mantenibilidad**: Un solo enum, lógica simple
- ✅ **Usabilidad**: Roles claros para usuarios
- ✅ **Escalabilidad**: Fácil agregar nuevos roles

---

## 🎯 **ROLES SEGÚN REQUISITOS CLIENTA ANALIZADOS**

### **Análisis Completo de requisitos.txt**

#### **1. 👩‍💼 COORDINADORA INCLUYE (Admin Principal)**
```typescript
// PERMISOS SEGÚN REQUISITOS:
- "Ingreso de información de diagnóstico"
- "Ingreso de ajustes razonables del estudiante"
- "Ingreso de actualizaciones de ajustes razonables"
- "Generación de reporte con historial"
- "Reportabilidad - Exportar Excel"
- "Confirmación de documentos de consentimiento firmados"
- "Almacenar registro de ramos cursados por estudiante"
```

#### **2. 👩‍🏫 EDUCADORA SOCIAL (Operativa INCLUYE)**
```typescript
// PERMISOS ESPECÍFICOS IDENTIFICADOS:
- "Registra usuarios (estudiantes NEE)" - TU ANÁLISIS
- "Analiza estudiantes y su progreso" - TU ANÁLISIS
- "Agrega, elimina, permite o habilita ajustes a estudiantes" - TU ANÁLISIS
- "Hace reportes para presentar" - TU ANÁLISIS
- "puede agregar, editar categorías de ajustes razonables" - REQUISITOS
// NOTA: ROL INEXISTENTE EN CÓDIGO ACTUAL
```

#### **3. 🏛️ PERSONAL DIDDEC (Seguimiento Especializado)**
```typescript
// PERMISOS SEGÚN REQUISITOS:
- "Visualizar diagnósticos (sólo con consentimiento del estudiante)"
- "Visualizar información de ajustes del estudiante"
- "Visualizar que el docente revisó ajustes (check)"
- "recibir alerta de quienes no han revisado ajustes"
- "Subir recursos de acompañamiento y/o material de apoyo"
- "Alerta de solicitud de apoyo de parte del docente, según carrera y sede"
- "Seguimiento de ajustes implementados (encuestas de seguimiento)"
- "Reporte de seguimiento"
- "Reportabilidad - Exportar Excel"
```

#### **4. 👨‍🎓 JEFE DE CARRERA (Gestión Académica)**
```typescript
// PERMISOS SEGÚN REQUISITOS:
- "Visualizar estudiantes del Programa con diagnóstico (sólo con consentimiento)"
- "Listado de estudiantes" [DE SU CARRERA ESPECÍFICAMENTE]
- "Alerta de información disponible (NUEVOS INGRESOS)"
- "actualización de ajustes"
- "Opción de envío de algún requerimiento"
- "Visualización de ficha de ajustes por diagnósticos"
- "Alerta de qué docente no ha revisado los ajustes a implementar"
- "Reportabilidad - Exportar Excel"
```

#### **5. 👩‍🏫 DOCENTE (Implementación Directa)**
```typescript
// PERMISOS SEGÚN REQUISITOS:
- "Visualizar diagnósticos (sólo con consentimiento)"
- "ajustes de sus estudiantes"
- "Listado de estudiantes de su asignatura que son parte del programa"
- "Solicitud de requerimiento de acompañamiento para implementar ajustes"
- "a)Lo puedo implementar b)Requiere Acompañamiento"
- "Observaciones: comunicación entre docente y unidades de apoyo"
- "Alerta de actualización de ajustes"
- "Visualización de ficha de ajustes por diagnósticos"
```

#### **6. 🎓 ESTUDIANTE (Usuario Final)**
```typescript
// PERMISOS SEGÚN REQUISITOS:
- "Vista de información de ajustes informados a la unidad académica"
- "Informar cumplimiento o incumplimiento de implementación de ajustes"
- "incorporar observaciones"
- "Subir archivos (certificados médicos)"
- "Acceder a formulario de actualización y seguimiento semestral"
- "confirmar si hará uso del ajuste de tiempo en cada asignatura"
- "Esta confirmación debe realizarse cada semestre"
```

### **ROLES ADICIONALES MENCIONADOS**
```typescript
// 7. OTRAS UNIDADES DE APOYO (Futuro desarrollo)
- DEA (Acompañamientos académicos y psicoeducativos)
- Programa AORA
- DGPRE
- Registro Curricular
- COORDINACIÓN SALAS
- DPI
// Requisito: "Comunicación entre Incluye y otras unidades"
```

## 📝 **DECISIONES BASADAS EN ANÁLISIS**

### **Respuestas a Preguntas Críticas**
1. **¿Educadora Social es separada de Coordinadora?** → **SÍ**, según tu análisis tiene funciones operativas específicas
2. **¿Personal DIDDEC múltiple?** → **NO CLARO**, pero tienen funciones muy específicas de seguimiento
3. **¿Jefes de Carrera ven otros departamentos?** → **NO**, solo "estudiantes DE SU CARRERA"
4. **¿Jefes de Departamento aprueban ajustes?** → **NO ESPECIFICADO** en requisitos (rol agregado en desarrollo)
5. **¿Otros roles?** → **SÍ**, "Otras unidades de apoyo" para desarrollo futuro

---

## 🔗 **ARCHIVOS A MODIFICAR**

### **Principales**
- `src/users/schemas/user.schema.ts` - Actualizar UserRole
- `src/auth/guards/roles.guard.ts` - Simplificar lógica
- `src/auth/enums/role.enum.ts` - Actualizar

### **A Eliminar**
- `src/users/enums/role.enum.ts` - Duplicado
- Staff-adjustments enum local - Duplicado

### **Controladores (20+ archivos)**
- Todos los archivos con @Roles() decorator

---

> **🎯 Próximo Paso**: Definir roles específicos con stakeholders antes de iniciar migración técnica. 