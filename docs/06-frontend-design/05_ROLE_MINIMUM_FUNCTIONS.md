# 📌 **MVP: Funciones mínimas por rol (BACK + FRONT)**

### 📅 Fecha: 02-07-2025

> Este documento resume, de forma **realista y accionable**, las funcionalidades mínimas que cada rol debe poder realizar en la primera versión liberable (MVP).  Las fuentes utilizadas fueron `docs/assets/requisitos.txt`, entrevistas con stakeholders y el mapeo de endpoints existente (ver `docs/ALL_ENDPOINTS_SWAGGER.md`).

| Rol (Sistema) | Funcionalidades mínimas (CRUD / Flujo) | Endpoints REST / WS actualmente disponibles | Brecha detectada | Estado front |
|---------------|----------------------------------------|----------------------------------------------|------------------|--------------|
| **Incluye – Coordinadora / Educadora Social** | 1. Registrar estudiante NEE <br/>2. Editar diagnóstico y ajustes del estudiante <br/>3. Subir/validar documentos de respaldo <br/>4. Generar alerta a unidades en actualización de ajustes <br/>5. Exportar historial (Excel) | `POST /students` <br/>`PATCH /students/:id` <br/>`POST /adjustments` <br/>`PATCH /adjustments/:id` <br/>`POST /documents/upload` <br/>`GET /adjustments/student/:id` | • Falta endpoint para **exportar historial** a Excel (`GET /reports/adjustments?format=excel`) | **Dashboard Incluye** implementado; export Excel pendiente |
| **Jefatura de Carrera / Encargado Docente** | 1. Visualizar listado de estudiantes con NEE (con consentimiento) <br/>2. Recibir alertas de nuevos ingresos o actualizaciones <br/>3. Ver ficha de ajustes y guía <br/>4. Recordar a docentes que no han revisado ajustes <br/>5. Exportar reporte Excel | `GET /heads/department/statistics` <br/>`GET /heads/alerts/unreviewed-adjustments` <br/>`POST /heads/alerts/remind-teacher/:id` <br/>`GET /careers/:id/students` | • Falta endpoint dedicado para **exportar reporte Excel** | **NUEVO** `TeachersbyCareerScreen` + `TeacherStatsScreen` integrados en Home ➜ flujo operativo |
| **Docente** | 1. Listar estudiantes con NEE en su asignatura <br/>2. Marcar ajuste como leído / revisado <br/>3. Solicitar acompañamiento (sí / requiere) <br/>4. Comunicación (observaciones) con Incluye <br/>5. Ver actualizaciones en tiempo real | `GET /adjustments/course/:courseId` <br/>`PATCH /adjustments/:id/read` <br/>`POST /adjustments/:id/:index/help-request` (pendiente validar) | • WS para **alertas en tiempo real** (se puede reutilizar `notifications.gateway`) <br/>• Crear endpoint para **observaciones docente** | Front parcial (pantallas de cursos y ajustes listas) |
| **DIDDEC Staff** | 1. Ver diagnósticos y ajustes de todos los estudiantes <br/>2. Subir recursos / material de apoyo <br/>3. Seguimiento de solicitudes de ayuda docentes <br/>4. Reporte de seguimiento (Excel) | `GET /staff-adjustments/pending` <br/>`POST /resources` <br/>`GET /staff-adjustments/help-requests` | • Endpoint para **seguimiento encuestas** no existe todavía <br/>• Exportación Excel pendiente | Sin UI aún |
| **Estudiante** | 1. Ver sus ajustes vigentes <br/>2. Confirmar uso de ajuste de tiempo por ramo <br/>3. Informar cumplimiento o incumplimiento <br/>4. Subir documentos (certificados médicos) <br/>5. Descargar y volver a subir consentimiento firmado | `GET /students/profile` <br/>`GET /adjustments/student/:id` <br/>`POST /documents/student/upload` | • Falta endpoint `PATCH /adjustments/:id/confirmation` <br/>• Descargar plantilla consentimiento: ✅ `GET /documents/templates/:type` ya disponible | Pantallas completas; confirmación pendiente |

---

## 🔄 Cambios recientes (02-07-2025)
* Se integró **Google Login** (flujo Web + móvil) → ya disponible en screen `login_screen.dart`.
* Dashboard **Jefatura** implementado con vistas de profesores y métricas (`TeachersbyCareerScreen`, `TeacherStatsScreen`).
* Se añadió gestión de profesores en Home para rol Jefatura.

## 🗒️ Notas
1. Los endpoints marcados como **pendientes** se documentan como *issues técnicas* a crear en GitHub.
2. Todos los flujos **requieren autenticación** mediante JWT; el backend ya expone `/auth/login` y estrategias de roles.
3. El canal WebSocket (`/notifications`) se reutilizará para alertas de actualización de ajustes y recordatorios.
4. Este documento se revisará en cada sprint de refinamiento. 