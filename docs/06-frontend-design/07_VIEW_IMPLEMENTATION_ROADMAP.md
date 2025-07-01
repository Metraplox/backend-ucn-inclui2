# 🚀 **VIEW IMPLEMENTATION ROADMAP (Flutter)**

**Fecha:** 02-07-2025  
**Autor:** AI Assistant – Frontend Architecture Committee

---

## 1. Objetivo
Disponer de un **plan unificado** para implementar todas las vistas / flujos críticos por rol (Incluye, Jefatura, Docente, DIDDEC, Estudiante) garantizando:
1. Consistencia UI/UX (componentes reutilizables).  
2. Cobertura de funcionalidades mínimas (ver `05_ROLE_MINIMUM_FUNCTIONS.md`).  
3. Sincronía con endpoints backend reales (NestJS) y WebSockets.

Este documento es la **fuente de verdad** para el equipo y para futuras iteraciones de IA.

---

## 2. Matriz de vistas
| Rol | Pantalla / Widget | Componentes clave | Estado actual | Sprint asignado |
|-----|-------------------|-------------------|---------------|-----------------|
| Incluye | `IncluyeDashboard` | `StatisticCard`, `AlertBadge`, `QuickActionButton` | ✅ **COMPLETADO** | S1 |
| Incluye | `StudentListScreen` | `StudentTable`, `AlertBadge` | ✅ | S1 |
| Incluye | `StudentProfileScreen` | `AdjustmentViewer`, `DocumentUploader` | ⚠️ Falta refactor | S2 |
| Jefatura | `TeachersbyCareerScreen` | `TeacherCard`, `SearchField` | ✅ | S1 |
| Jefatura | `TeacherStatsScreen` | `StatisticCard`, `ExportButton` | ⚠️ Métricas dummy | S2 |
| Jefatura | `JefaturaDashboard` | `StatisticCard`, `AlertBadge` | ✅ **COMPLETADO** | S2 |
| Docente | `StudentAdjustmentsScreen` | `AdjustmentChecklist`, `HelpRequestDialog` | 🆗 Básico | S2 |
| Docente | `HelpRequestDialog` | `Dialog`, `TextArea` | ✅ | S2 |
| Docente | `DocenteDashboard` | `StatisticCard`, `QuickActionButton` | ✅ **COMPLETADO** | S2 |
| Estudiante | `StudentOwnProfileScreen` | `AdjustmentViewer`, `ComplianceForm` | ✅ | S1 |
| Estudiante | `StudentCareerListScreen` | `CourseSelector`, `SubjectCard` | ✚ Nuevo | S3 |
| Estudiante | `EstudianteDashboard` | `StatisticCard`, `AlertBadge` | ⚠️ **Con errores menores** | S2 |
| DIDDEC | `PendingListScreen` | `PendingCard`, `ResourceUploader` | ✚ Nuevo | S4 |
| DIDDEC | `ResourceUploaderScreen` | `FilePicker`, `UploadProgress` | ✚ Nuevo | S4 |
| DIDDEC | `DiddecDashboard` | `StatisticCard`, `ExportButton` | ✚ **NEXT** | S3 |

Leyenda: ✅ = Implementado / estable · ⚠️ = Implementado pero requiere mejoras · ✚ = Pendiente.

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
6. ⚠️ Abrir PR con checklist: build OK, analyze sin errors, tests pasan.

---

## 5. Lista de tareas técnicas generadas
- [x] Integrar `IncluyeDashboard` en `home_screen.dart` (navegación por rol).
- [x] Crear dashboards restantes siguiendo patrón `IncluyeDashboard`.
- [x] Crear `HelpRequestDialog` + endpoint POST `/adjustments/:id/:index/help-request` (confirmar en backend).  
- [ ] Refactor `StudentProfileScreen` para usar `AdjustmentViewer` compartido.  
- [ ] Implementar `ExportButton` con fetch CSV/Excel (backend pendiente).  
- [ ] Crear módulo WebSocket listener común (`notification_service.dart`) para AlertBadge.
- [ ] Corregir errores modelos en `EstudianteDashboard` (campos inexistentes en Adjustment).

---

## 6. Progreso actual (02-07-2025 18:45) ⚡ **GRAN AVANCE**
### ✅ Completados:
- Librería de componentes base (3 widgets principales)
- Dashboard Incluye con métricas en tiempo real
- **🆕 Dashboard Jefatura** - gestión docentes y estadísticas carrera
- **🆕 Dashboard Docente** - cursos, estudiantes NEE, solicitudes ayuda
- **🆕 Dashboard Estudiante** - ajustes personales y progreso académico
- **🆕 Integración completa en home_screen.dart** por rol
- **🆕 Modelo TeacherStats** actualizado
- Corrección warnings deprecación Flutter
- Git workflow establecido

### ⚠️ Problemas menores:
- EstudianteDashboard: campos inexistentes en modelo Adjustment (isCompleted, isConfirmed)
- Algunos servicios requieren métodos estáticos vs instancia

### ⏭️ Próximo objetivo:
Corregir errores menores y crear dashboard DIDDEC para completar todos los roles.

---

## 7. Integración continua
En `.github/workflows/flutter-ci.yml` (pendiente) ejecutar:  
```yaml
- name: Flutter Analyze
  run: flutter analyze --no-pub
- name: Flutter Test
  run: flutter test --coverage
```

---

## 8. Próxima revisión
La tabla de estado se actualizará al final de cada sprint durante la **Reunión de Demo & Retro**. 