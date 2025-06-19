# 🔍 ANÁLISIS DE PROBLEMAS DE PERMISOS - UCN INCLUI2

## 📋 **RESUMEN EJECUTIVO**
**Fecha:** 27 Enero 2025  
**Validación:** 52 endpoints testados - 51.9% funcional  
**Estado:** Requiere corrección de permisos críticos  

---

## 🚨 **PROBLEMAS CRÍTICOS IDENTIFICADOS**

### **1. COORDINADOR - Acceso Insuficiente (50% funcional)**

**❌ Problemas detectados:**
- Sin acceso a `/users` (403) - **CRÍTICO**: Coordinador debe gestionar usuarios
- Sin acceso a `/students` (403) - **CRÍTICO**: Debe ver todos los estudiantes  
- Sin acceso a `/adjustments` (403) - **CRÍTICO**: Debe gestionar ajustes
- Sin acceso a `/courses` (403) - **CRÍTICO**: Debe ver cursos del sistema
- Sin acceso a `/diddec/statistics` (403) - **CRÍTICO**: Debe acceder a reportes
- Sin acceso a `/admin/hawaii-sync/status` (403) - **CRÍTICO**: Debe administrar sync

**✅ Funcionando correctamente:**
- Perfil propio, categorías, departamentos, carreras, recursos, notificaciones

### **2. EDUCADORA_SOCIAL - Restricciones Incorrectas (75% funcional)**

**❌ Problemas detectados:**
- Sin acceso a `/students` (403) - **CRÍTICO**: Rol principal es gestionar estudiantes
- Sin acceso a `/adjustments` (403) - **CRÍTICO**: Debe crear/ver ajustes

**✅ Funcionando correctamente:**
- Categorías, recursos, notificaciones, restricciones de seguridad

### **3. DIDDEC_STAFF - Acceso Muy Limitado (25% funcional)**

**❌ Problemas detectados:**
- Sin acceso a `/diddec/statistics` (403) - **CRÍTICO**: Es su función principal
- Sin acceso a `/diddec/students/all` (403) - **CRÍTICO**: Debe analizar estudiantes NEE
- Sin acceso a `/diddec/adjustments/trends` (403) - **CRÍTICO**: Debe ver tendencias
- Sin acceso a `/diddec/resources` (403) - **CRÍTICO**: Gestión de recursos DIDDEC
- Sin acceso a `/students` (403) - **CRÍTICO**: Debe analizar estudiantes
- Sin acceso a `/adjustments` (403) - **CRÍTICO**: Debe ver ajustes para reportes

### **4. JEFE_DEPARTAMENTO - Funcionalidad Limitada (37.5% funcional)**

**❌ Problemas detectados:**
- Sin acceso a `/departments/heads/my-department` (403) - **CRÍTICO**: Debe ver su departamento
- Sin acceso a `/departments/heads/statistics` (403) - **CRÍTICO**: Estadísticas departamentales
- Sin acceso a `/departments/heads/students/nee` (403) - **CRÍTICO**: Estudiantes NEE del depto
- Sin acceso a `/departments/heads/teachers` (403) - **CRÍTICO**: Docentes del departamento

### **5. DOCENTE - Permisos Excesivos (50% funcional)**

**❌ Problemas detectados:**
- Sin acceso a `/students` (403) - **CRÍTICO**: Debe ver estudiantes de sus cursos
- Sin acceso a `/adjustments` (403) - **CRÍTICO**: Debe ver ajustes a implementar
- Sin acceso a `/courses` (403) - **CRÍTICO**: Debe ver sus cursos
- **🚨 ACCESO INDEBIDO:** `/categories` (200) - **PROBLEMA DE SEGURIDAD**: No debe crear categorías

### **6. ESTUDIANTE - Accesos Faltantes (75% funcional)**

**❌ Problemas detectados:**
- Sin acceso a `/students/profile` (403) - **CRÍTICO**: Debe ver su perfil
- Sin acceso a `/consents/student/my-consents` (403) - **CRÍTICO**: Debe gestionar consentimientos

### **7. FALLOS DE SEGURIDAD ENTRE ROLES**

**🚨 CRÍTICOS:**
- **JEFE_DEPARTAMENTO** puede acceder a `/careers` (200) - **NO DEBERÍA**
- **DOCENTE** puede acceder a `/categories` (200) - **NO DEBERÍA**

---

## 🔧 **ANÁLISIS TÉCNICO DE CAUSAS**

### **Causa Raíz 1: Inconsistencia en Decoradores @Roles**

**Problema:** Algunos endpoints no tienen el decorador `@Roles()` o tienen roles incorrectos.

**Ejemplos identificados:**
```typescript
// ❌ PROBLEMA en categories.controller.ts línea 30
@Get()
@UseGuards(JwtAuthGuard) // ← Falta RolesGuard y @Roles
@ApiOperation({ summary: 'Obtener todas las categorías de ajuste' })
findAll() {
  return this.categoriesService.findAll();
}

// ❌ PROBLEMA en students.controller.ts línea 50  
@Get()
@Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL) // ← Roles muy restrictivos
```

### **Causa Raíz 2: Guards Faltantes o Mal Configurados**

**Problema:** Algunos controladores no tienen `RolesGuard` aplicado globalmente.

### **Causa Raíz 3: Lógica de Autorización Incorrecta**

**Problema:** Roles definidos no coinciden con las necesidades funcionales del sistema.

---

## ✅ **PROPUESTA DE SOLUCIÓN PROFESIONAL**

### **FASE 1: CORRECCIONES CRÍTICAS (Alta Prioridad)**

#### **1.1 Coordinador - Acceso Completo al Sistema**
```typescript
// users.controller.ts - MANTENER (ya correcto)
@Get()
@Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)

// students.controller.ts - AGREGAR COORDINADOR
@Get()
@Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.DIDDEC_STAFF)

// adjustments.controller.ts - MANTENER (ya incluido)
@Get()
@Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, ...)

// diddec.controller.ts - MANTENER (ya incluido)
@Get('statistics')
@Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
```

#### **1.2 Educadora Social - Acceso a Estudiantes y Ajustes**
```typescript
// students.controller.ts - MANTENER (ya incluido)
@Get()
@Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)

// adjustments.controller.ts - MANTENER (ya incluido)  
@Get()
@Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, ...)
```

#### **1.3 DIDDEC Staff - Acceso Completo a Funciones DIDDEC**
```typescript
// diddec.controller.ts - YA CORRECTO
@Get('statistics')
@Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)

// students.controller.ts - AGREGAR DIDDEC_STAFF
@Get()
@Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.DIDDEC_STAFF)

// adjustments.controller.ts - MANTENER (ya incluido)
@Get()  
@Roles(..., UserRole.DIDDEC_STAFF, ...)
```

#### **1.4 Docente - Restricciones de Seguridad**
```typescript
// categories.controller.ts - CORREGIR ACCESO INDEBIDO
@Get()
@UseGuards(JwtAuthGuard, RolesGuard) // ← AGREGAR RolesGuard
@Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.DIDDEC_STAFF, UserRole.DOCENTE)
```

### **FASE 2: IMPLEMENTACIÓN DE GUARDIAS ESPECIALIZADOS**

#### **2.1 Guard para Jefes de Departamento**
```typescript
// Crear DepartmentAccessGuard
@Injectable()
export class DepartmentAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user;
    
    // Coordinador siempre tiene acceso
    if (user.roles.includes(UserRole.COORDINADOR)) return true;
    
    // Jefe de departamento con departamento asignado
    if (user.roles.includes(UserRole.JEFE_DEPARTAMENTO) && user.departmentId) {
      return true;
    }
    
    return false;
  }
}
```

#### **2.2 Guard para Estudiantes**
```typescript
// Crear StudentSelfAccessGuard  
@Injectable()
export class StudentSelfAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user;
    const studentId = context.switchToHttp().getRequest().params.studentId;
    
    // Solo el propio estudiante puede acceder
    if (user.roles.includes(UserRole.ESTUDIANTE)) {
      return user.studentId === studentId;
    }
    
    return false;
  }
}
```

### **FASE 3: MATRIZ DE PERMISOS DEFINITIVA**

| Endpoint | COORDINADOR | EDUCADORA | DIDDEC | JEFE_DEPTO | JEFE_CARRERA | DOCENTE | ESTUDIANTE |
|----------|------------|-----------|---------|------------|--------------|---------|------------|
| `/users` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/students` | ✅ | ✅ | ✅ | ✅* | ✅* | ✅* | ❌ |
| `/students/profile` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/adjustments` | ✅ | ✅ | ✅ | ✅* | ✅* | ✅* | ✅* |
| `/categories` | ✅ | ✅ | ✅ | ❌ | ❌ | 👀 | ❌ |
| `/diddec/*` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/departments/heads/*` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `/careers` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `/consents/student/*` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Leyenda:**
- ✅ = Acceso completo
- ✅* = Acceso filtrado por relación (ej: sus estudiantes)
- 👀 = Solo lectura
- ❌ = Sin acceso

---

## 🎯 **PLAN DE IMPLEMENTACIÓN**

### **Sprint 1 (1-2 días): Correcciones Críticas**
1. **Corregir categories.controller.ts** - Agregar guards faltantes
2. **Actualizar students.controller.ts** - Incluir roles faltantes  
3. **Verificar diddec.controller.ts** - Confirmar permisos DIDDEC_STAFF
4. **Testing inmediato** - Validar correcciones con script existente

### **Sprint 2 (2-3 días): Guards Especializados**
1. **Implementar DepartmentAccessGuard**
2. **Implementar StudentSelfAccessGuard**  
3. **Aplicar guards a endpoints específicos**
4. **Testing completo** - Validar nuevos guards

### **Sprint 3 (1 día): Validación Final**
1. **Ejecutar validador profesional completo**
2. **Documentar cambios**
3. **Actualizar documentación de permisos**
4. **Deploy a producción**

---

## 📊 **MÉTRICAS DE ÉXITO ESPERADAS**

**Objetivo:** Alcanzar **95%+ de funcionalidad** en validador

| Rol | Estado Actual | Objetivo | 
|-----|---------------|----------|
| COORDINADOR | 50% | 95% |
| EDUCADORA_SOCIAL | 75% | 95% |
| DIDDEC_STAFF | 25% | 90% |
| JEFE_DEPARTAMENTO | 37.5% | 85% |
| DOCENTE | 50% | 85% |
| ESTUDIANTE | 75% | 90% |

**Fallos de Seguridad:** De 2 críticos a 0

---

## ⚡ **ACCIONES INMEDIATAS RECOMENDADAS**

1. **🔥 URGENTE:** Corregir acceso de categories para DOCENTE
2. **🔥 URGENTE:** Habilitar acceso COORDINADOR a usuarios y ajustes  
3. **⚠️ ALTA:** Corregir permisos DIDDEC_STAFF para estadísticas
4. **⚠️ ALTA:** Implementar acceso estudiante a su perfil
5. **📋 MEDIA:** Implementar guards especializados para filtrado

**El sistema tiene una base sólida, solo requiere ajustes específicos de permisos para alcanzar nivel production-ready.**