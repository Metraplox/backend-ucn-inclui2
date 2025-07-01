# 📊 **GAP ANALYSIS – Cobertura vs Requisitos (código fuente real)**

**Fecha:** 01-07-2025  
**Autor:** AI Assistant (revisión de código NestJS + Flutter)

---

## 1. Alcance
Documento único de referencia que resume, **a partir del código fuente auditado**, qué funcionalidades del proyecto UCN INCLUI2 se encuentran implementadas y cuáles faltan.  Debe usarse como input para:

1. Priorización de backlog.
2. Generación automática de issues.
3. Orientar prompts futuros de la IA (evita re-analizar todo el repo cada vez).

---

## 2. Backend (NestJS)

### 2.1 Funcionalidades **implementadas**
| Área | Endpoint(s) clave | Archivo controlador |
|------|------------------|--------------------|
| Estudiantes CRUD | `POST /students`, `PATCH /students/:id`, `PATCH /students/:id/semester/:semester` | `src/students/students.controller.ts` |
| Ajustes razonables | CRUD completo + `PATCH /adjustments/:id/read` | `src/adjustments/adjustments.controller.ts` |
| Documentos | `/documents/upload`, `/documents/templates/*` | `src/documents/documents.controller.ts` |
| Reportes DIDDEC | `POST /diddec/reports/export`, `GET /diddec/reports/download/:file` | `src/diddec/controllers/diddec-reports.controller.ts` |
| Recursos de apoyo | CRUD archivos + metadatos | `src/resources/resources.controller.ts` |
| Notificaciones WS | `notifications.gateway.ts` | WebSocket activo |

### 2.2 **Brechas detectadas**
| Requisito | Estado actual | Acción técnica |
|-----------|---------------|---------------|
| Confirmación semestral estudiante | Esquema `requiresSemesterConfirmation` existe, pero sin endpoint | Crear `PATCH /adjustments/:id/:index/confirmation` |
| Solicitud de ayuda docente | Lógica `requestHelp()` implementada en service, **sin ruta pública** | Exponer `POST /adjustments/:id/:index/help-request` |
| Exportación Excel para jefaturas | Solo vía `/diddec/reports` | Definir alias o reutilizar endpoint con roles adecuados |
| Encuestas/seguimiento implementación | No existe modelo ni API | Diseñar esquema + endpoints |

---

## 3. Frontend (Flutter)

### 3.1 Cobertura actual
* `HomeScreen` detecta roles y carga datos básicos.  
* Listados y CRUD para estudiantes + ajustes.  
* Docente puede marcar ajustes como leídos (`studentAdjustmentSubject_screen.dart`).

### 3.2 Brechas principales
| Rol | Faltantes UI | Dependencia backend |
|-----|--------------|---------------------|
| Coordinadora / Educadora | Dashboards dedicados, widgets métricos, export botón Excel | Alias export Excel (opcional) |
| Jefatura | Dashboard + export botón Excel | Alias export Excel |
| Docente | Help-Request dialog, vista pendientes | Nuevo endpoint help-request |
| DIDDEC | Dashboard pendientes, seguimiento encuestas | Endpoints encuesta / seguimiento |
| Estudiante | Flujo confirmación semestral, formulario cumplimiento | Nuevo endpoint confirmation |

---

## 4. Próximas tareas prioritarias
1. **Backend:**
   1.1 Crear rutas `help-request` y `confirmation` (+ pruebas unitarias).  
   1.2 Diseñar modelo `FollowUpSurvey` + controlador.
2. **Frontend:**
   2.1 Refactorizar `HomeScreen` → dashboards por rol (usar widgets reutilizables).  
   2.2 Implementar Help-Request dialog.  
   2.3 Flujo confirmación estudiante.
3. Automatizar creación de issues a partir de esta tabla (script pendiente).

---

## 5. Cómo usar este archivo en prompts IA
* **Resumir estado**: La IA debe leer primero las secciones 2 y 3.  
* **Crear feature**: Verificar si "implementado" o "brecha"; si es brecha, seguir acciones técnicas.  
* **Evitar redundancia**: Si algo figura como implementado, solo refactorizar si existe deuda técnica.

> **Keeper note:** Actualizar este archivo al finalizar cada PR que cubra una brecha. 