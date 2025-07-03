# 🚀 **VIEW IMPLEMENTATION ROADMAP (Flutter)**

**Fecha:** 02-07-2025  
**Autor:** AI Assistant – Frontend Architecture Committee

---

## 1. Objetivo
Disponer de un **plan unificado** para implementar todas las vistas / flujos críticos por rol (Incluye, Jefatura, Docente, DIDDEC, Estudiante) garantizando:
1. Consistencia UI/UX (componentes reutilizables).  
2. Cobertura de funcionalidades mínimas (ver `05_ROLE_MINIMUM_FUNCTIONS.md`).  
3. Sincronía con endpoints backend reales (NestJS) y SSE (Server-Sent Events).

Este documento es la **fuente de verdad** para el equipo y para futuras iteraciones de IA.

---

## 2. Matriz de vistas
| Rol | Pantalla / Widget | Componentes clave | Estado actual | Sprint asignado |
|-----|-------------------|-------------------|---------------|-----------------|
| Incluye | `IncluyeDashboard` | `StatisticCard`, `AlertBadge`, `QuickActionButton` | ✅ **COMPLETADO** | S1 |
| Incluye | `StudentListScreen` | `StudentTable`, `AlertBadge` | ✅ | S1 |
| Incluye | `StudentProfileScreen` | `AdjustmentViewer`, `DocumentUploader` | ✅ **COMPLETADO** | S2 |
| Jefatura | `TeachersbyCareerScreen` | `TeacherCard`, `SearchField` | ✅ | S1 |
| Jefatura | `TeacherStatsScreen` | `StatisticCard`, `ExportButton` | ✅ **COMPLETADO** | S2 |
| Jefatura | `JefaturaDashboard` | `StatisticCard`, `AlertBadge` | ✅ **COMPLETADO** | S1 |
| Docente | `StudentAdjustmentsScreen` | `AdjustmentChecklist`, `HelpRequestDialog` | ✅ **COMPLETADO** | S2 |
| Docente | `HelpRequestDialog` | `Dialog`, `TextArea` | ✅ | S2 |
| Docente | `DocenteDashboard` | `StatisticCard`, `QuickActionButton` | ✅ **COMPLETADO** | S1 |
| Estudiante | `StudentOwnProfileScreen` | `AdjustmentViewer`, `ComplianceForm` | ✅ | S1 |
| Estudiante | `StudentCareerListScreen` | `CourseSelector`, `SubjectCard` | ✅ **COMPLETADO** | S3 |
| Estudiante | `EstudianteDashboard` | `StatisticCard`, `AlertBadge` | ✅ **COMPLETADO** | S1 |
| DIDDEC | `PendingListScreen` | `PendingCard`, `ResourceUploader` | ⏳ En desarrollo | S4 |
| DIDDEC | `ResourceUploaderScreen` | `FilePicker`, `UploadProgress` | ✅ **COMPLETADO** | S4 |
| DIDDEC | `DiddecDashboard` | `StatisticCard`, `ExportButton` | ✅ **COMPLETADO** | S1 |

Leyenda: ✅ = Implementado / estable · ⚠️ = Implementado pero requiere mejoras · ❌ = Con errores críticos · ✚ = Pendiente.

---

## 3. Component Library ✅ **COMPLETADO**
**Branch:** `feature/component-library-base` | **Commit:** 4bf113f  
Se centralizaron widgets en `lib/widgets/`:
* ✅ `StatisticCard` – métrica con icono, color y animación táctil.
* ✅ `AlertBadge` + `PulsingAlertBadge` – contador notificaciones (WS ready).
* ✅ `QuickActionButton` + `QuickActionButtonWithBadge` – botón circular con tooltip.

**Próximos componentes (S2):**
* `StudentTable`, `TeacherCard`, `PendingCard` – tablas/cards específicos por entidad.
* `HelpRequestDialog`, `ExportButton` – diálogos y acciones especiales.

---

## 4. Flujo de desarrollo recomendado
1. ✅ Crear rama feature: `feature/<vista>`.
2. ✅ Generar widget placeholder + test vacío.
3. ✅ Conectar servicio → endpoint real (`services/*.dart`).
4. ✅ Implementar estado cargando/error.
5. ⚠️ Agregar a navegación (`home_screen.dart` o ruta anidada).
6. ❌ Abrir PR con checklist: build OK, analyze sin errors, tests pasan.

---

## 5. Lista de tareas técnicas generadas
- [x] Integrar `IncluyeDashboard` en `home_screen.dart` (navegación por rol).
- [x] Crear dashboards restantes siguiendo patrón `IncluyeDashboard`.
- [x] Crear `HelpRequestDialog` + endpoint POST `/adjustments/:id/:index/help-request` (confirmar en backend).  
- [x] **CRÍTICO:** Corregir campos inexistentes en modelos (Student.name, Student.career, etc.)
- [x] **CRÍTICO:** Corregir uso de métodos estáticos vs instancia en servicios
- [x] **CRÍTICO:** Corregir campos Adjustment.isCompleted/isConfirmed en EstudianteDashboard
- [x] Refactor `StudentProfileScreen` para usar `AdjustmentViewer` compartido.  
- [ ] Implementar `ExportButton` con fetch CSV/Excel (backend pendiente).  
- [x] Crear widget `AdjustmentViewer` en `