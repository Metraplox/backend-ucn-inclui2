# 🔐 SISTEMA DE ROLES - Arquitectura Implementada (V1.0)
## Proyecto: Plataforma Inclusiva UCN

### 📅 **Última Actualización**: 21 Diciembre 2025
### 🎯 **Objetivo**: Documentar el sistema de roles y permisos unificado y granular implementado en la versión 1.0.

---

## ✅ **ARQUITECTURA FINAL DEL SISTEMA DE ROLES**

Tras un proceso de refactoring, se ha consolidado un sistema de roles único, claro y seguro. Este documento describe su funcionamiento final. Se eliminaron los múltiples `enum` de roles y la lógica de mapeo confusa, centralizando toda la definición en un solo lugar.

### **1. `UserRole` Enum Unificado**

La única fuente de verdad para los roles en todo el sistema es el `enum UserRole`, ubicado en `src/users/schemas/user.schema.ts`.

```typescript
// Ubicación: src/users/schemas/user.schema.ts
export enum UserRole {
  // Administración del Sistema
  COORDINADOR = 'coordinador', // Rol con máximos privilegios, gestiona todo el sistema.

  // Personal de Apoyo Especializado
  EDUCADORA_SOCIAL = 'educadora_social', // Gestiona estudiantes, ajustes y categorías.
  DIDDEC_STAFF = 'diddec_staff',         // Personal de DIDDEC, enfocado en seguimiento y reportes.

  // Académicos con Responsabilidades de Gestión
  JEFE_CARRERA = 'jefe_carrera',         // Acceso a datos de los estudiantes de su carrera.
  JEFE_DEPARTAMENTO = 'jefe_departamento', // Acceso a datos de los cursos de su departamento.

  // Personal Académico Directo
  DOCENTE = 'docente',                   // Acceso a los ajustes de los estudiantes en sus cursos.

  // Estudiantes
  ESTUDIANTE = 'estudiante'              // Acceso a su propia información de ajustes.
}
```

### **2. Lógica del `RolesGuard`**

El `RolesGuard` (`src/auth/guards/roles.guard.ts`) ahora realiza una comprobación directa y estricta:
1.  Obtiene los roles requeridos del decorador `@Roles(...)` en un endpoint.
2.  Obtiene los roles del usuario autenticado a través del token JWT.
3.  Comprueba si **alguno** de los roles del usuario coincide con **alguno** de los roles requeridos por el endpoint.
4.  Si hay coincidencia, permite el acceso. Si no, lanza una `ForbiddenException`.

No existen mapeos intermedios ni conversiones de roles, lo que garantiza que los permisos son explícitos y predecibles.

---

##  MATRIX DE PERMISOS POR ROL Y ENDPOINT (V1.0)

La siguiente tabla resume los permisos asignados a los roles principales en los controladores más importantes.

| Controlador | Endpoint | COORDINADOR | EDUCADORA S. | DIDDEC | JEFE DEP. | JEFE CARRERA | DOCENTE | ESTUDIANTE |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `AdjustmentsController` | `POST /` (Crear) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `AdjustmentsController` | `GET /` (Listar Todos) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `TeacherAdj.` | `GET /my-courses`| ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `TeacherAdj.` | `PATCH /:id/ack`| ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `StudentAdj.` | `GET /my` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `DepHeadsController`| `GET /stats` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `CareerHeadsController`|`GET /students`| ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `CategoriesController`| `POST, PATCH, DELETE` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `DiddecReports` | `POST /export` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `DocumentsController` | `POST /upload` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |

**Nota**: Esta es una representación simplificada. La lógica de negocio dentro de los servicios puede aplicar filtros adicionales (ej. un Jefe de Carrera solo ve estudiantes de su carrera).

---

## 🌟 **BENEFICIOS DEL SISTEMA ACTUAL**

- **Claridad**: Los roles se corresponden directamente con los perfiles de usuario del negocio.
- **Seguridad**: Los permisos son granulares y explícitos, reduciendo el riesgo de acceso no autorizado.
- **Mantenibilidad**: Gestionar permisos es tan simple como añadir o quitar un rol de un decorador `@Roles`. No hay lógica compleja que mantener.
- **Escalabilidad**: Agregar un nuevo rol con permisos específicos es un proceso sencillo y de bajo riesgo.

---