Última actualización: 07/07/2025 (revisión profunda)

# Informe de Implementación de Botones y Funcionalidades por Rol

Este documento detalla, para cada rol de usuario, las funcionalidades que actualmente están implementadas en la interfaz y aquellas cuyo botón no ejecuta la acción esperada.

---

## 1. Estudiante

### Funcionalidades Completadas

- Autenticación (login/logout) con Google y JWT.
- Consulta de cursos inscritos.

### Funcionalidades Incompletas (Botones sin función real)

- Visualización de perfil y datos académicos. No cargan, puede ser falta de vinculacion del
- **Solicitar Ajuste**: el botón aparece en la sección de ajustes, pero no dispara ninguna petición al servicio.
  - Observación: el método `_navigateToAdjustmentDetail` muestra un `AlertDialog` genérico sin invocar `AdjustmentService.createAdjustment` ni formulario de solicitud.
- **Descarga de documentos**: el botón de descargar constancia no inicia descarga.
  - Observación: en `StudentOwnProfileScreen` el método `_downloadTemplate()` está declarado pero vacío (`/* ... */`), no hay llamada a `DocumentService.getTemplate`.
- **Enviar comentario**: en pantalla de reportes, el botón no envía datos ni muestra confirmación.
  - Observación: la vista de feedback en `teacher_reports_screen.dart` carece de implementación de envío, no existe invocación a ningún `CommentService`.

---

## 2. Docente

### Funcionalidades Completadas

- Visualización de lista de estudiantes.
- Aprobación/Rechazo de solicitudes de ajuste.
- Acceso a materiales de curso.

### Funcionalidades Incompletas (Botones sin función real)

- **Enviar calificaciones**: el botón no envía el formulario al backend.
  - Observación: en `student_adjustments_screen.dart`, el botón de guardar calificaciones no está enlazado a `AdjustmentService.submitGrades`.
- **Generar reporte de avance**: no ejecuta ninguna acción.
  - Observación: en pantalla `teacher_reports_screen.dart`, el botón carece de `onPressed` o invocación a `ReportService.generateProgressReport()`.
- **Notificar estudiante**: carece de integración con servicio de notificaciones.
  - Observación: el tooltip `Notificar estudiante` en `DocenteDashboard` muestra contador pero la acción `_navigateToNotifications` solo abre `NotificationsScreen` vacío.

---

## 3. Jefatura

### Funcionalidades Completadas

- Vista consolidada de reportes de docentes y estudiantes.
- Aprobación masiva de solicitudes.

### Funcionalidades Incompletas (Botones sin función real)

- **Exportar a Excel**: el botón no produce archivo descargable.
  - Observación: `jefatura_dashboard.dart` no incluye implementación de `ExcelService.exportReports`, el botón está ausente o sin handler.
- **Filtrar por periodo**: la opción de filtrado no actualiza la lista.
  - Observación: el dropdown de períodos en `alerts_screen.dart` no dispara llamada a `_applyFilter`, mantiene lista sin cambios.

---

## 4. DIDDEC

### Funcionalidades Completadas

- Gestión de alumnos con necesidades especiales.
- Consulta de historial de intervenciones.

### Funcionalidades Incompletas (Botones sin función real)

- **Asignar tutor**: no invoca la API para asignación.
  - Observación: en `students_nee_screen.dart`, el botón de asignación solo muestra diálogo, no llama a `TutorService.assignTutor`.
- **Registrar informe**: el formulario aparece, pero no guarda datos.
  - Observación: en pantalla de creación de informes, el envío no utiliza `DiddecService.createReport`, método `onSubmit` vacío.

---

## 5. Administración (Admin)

### Funcionalidades Completadas

- Gestión de usuarios (alta/baja) básica.
- Ajustes generales de la aplicación.

### Funcionalidades Incompletas (Botones sin función real)

- **Restablecer contraseña**: no envía correo ni actualiza credencial.
  - Observación: en el `ChangePasswordDialog`, la llamada `UserService.adminSetPassword` se invoca pero no maneja envíos de correo; falta `MailService.sendResetEmail`.
- **Eliminar usuario**: carece de confirmación y acción en backend.
  - Observación: aunque `_confirmDelete` llama a `UserService.deleteUser`, no hay manejo de errores ni actualización de vista tras eliminación.

---

> Este informe deberá revisarse con el equipo de frontend y backend para asignar prioridades y corregir las implementaciones faltantes.
