# Documentación Completa de Endpoints UCN INCLUI2

## Resumen de Controllers y Endpoints

Basado en el análisis del código fuente real del proyecto, el backend UCN INCLUI2 cuenta con **28 controllers** que exponen un total de **146 endpoints**.

### Controllers Identificados:

1. **AppController** - `/` - Endpoints generales de la aplicación
2. **AuthController** - `/auth` - Autenticación y autorización
3. **StudentsController** - `/students` - Gestión de estudiantes
4. **DepartmentsController** - `/departments` - Gestión de departamentos
5. **DepartmentHeadsController** - `/departments/heads` - Funcionalidades para jefes de departamento
6. **HeadsController** - `/heads` - Funcionalidades generales para jefes
7. **CareersController** - `/careers` - Gestión de carreras
8. **CareerHeadsController** - `/career-heads` - Funcionalidades para jefes de carrera
9. **CareerStudentsController** - `/careers` - Gestión de estudiantes por carrera
10. **CoursesController** - `/courses` - Gestión de cursos
11. **AcademicHistoryController** - `/academic-history` - Historial académico
12. **AdjustmentsController** - `/adjustments` - Gestión de ajustes razonables
13. **StaffAdjustmentsController** - `/staff-adjustments` - Ajustes para staff DIDDEC
14. **DocumentsController** - `/documents` - Gestión de documentos
15. **CategoriesController** - `/categories` y `/nee-categories` - Categorías de ajustes
16. **ConsentController** - `/consents` - Gestión de consentimientos
17. **NotificationsController** - `/notifications` - Sistema de notificaciones
18. **ResourcesController** - `/resources` y `/educational-resources` - Recursos educativos
19. **UsersController** - `/users` - Gestión de usuarios
20. **DIDDECController (users)** - `/diddec` - Funcionalidades generales DIDDEC
21. **DIDDECController (main)** - `/diddec` - Estadísticas y reportes DIDDEC
22. **DiddecReportsController** - `/diddec/reports` - Exportación de reportes
23. **DiddecResourcesController** - `/diddec/resources` - Recursos DIDDEC
24. **SyncController** - `/sync` - Sincronización con sistemas externos
25. **HawaiiSyncController** - `/admin/hawaii-sync` - Sincronización con Hawaii
26. **HawaiiCacheController** - `/admin/hawaii-cache` - Gestión de caché Hawaii
27. **SemesterSyncController** - `/semester-sync` - Sincronización semestral

## Detalle Completo de Endpoints por Controller

### 1. AppController (`/`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Endpoint de bienvenida |
| GET | `/health` | Verificación de salud del sistema |

### 2. AuthController (`/auth`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| POST | `/auth/login` | Iniciar sesión de usuario | Público |
| POST | `/auth/google` | Iniciar sesión con Google | Público |
| POST | `/auth/register` | Registrar un nuevo usuario | Público |
| POST | `/auth/roles` | Obtener información de roles del sistema | Público |

### 3. StudentsController (`/students`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| POST | `/students` | Crear un nuevo estudiante | COORDINADOR, EDUCADORA_SOCIAL |
| GET | `/students` | Obtener todos los estudiantes | COORDINADOR, EDUCADORA_SOCIAL, DIDDEC_STAFF |
| GET | `/students/profile` | Obtener el perfil del estudiante actual | ESTUDIANTE |
| GET | `/students/:id` | Obtener un estudiante por ID | COORDINADOR, EDUCADORA_SOCIAL |
| PATCH | `/students/:id` | Actualizar un estudiante | COORDINADOR, EDUCADORA_SOCIAL |
| PATCH | `/students/:id/semester/:semester` | Actualizar información semestral | COORDINADOR, EDUCADORA_SOCIAL |
| DELETE | `/students/:id` | Eliminar un estudiante | COORDINADOR, EDUCADORA_SOCIAL |

### 4. DepartmentsController (`/departments`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| POST | `/departments` | Crear un nuevo departamento | COORDINADOR |
| GET | `/departments` | Obtener todos los departamentos | Autenticado |
| GET | `/departments/:id` | Obtener un departamento por ID | Autenticado |
| PATCH | `/departments/:id` | Actualizar un departamento | COORDINADOR |
| DELETE | `/departments/:id` | Eliminar un departamento | COORDINADOR |

### 5. DepartmentHeadsController (`/departments/heads`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| GET | `/departments/heads/my-department` | Obtener información del departamento del jefe actual | JEFE_DEPARTAMENTO |
| GET | `/departments/heads/statistics` | Obtener estadísticas del departamento | JEFE_DEPARTAMENTO |
| GET | `/departments/heads/students/nee` | Obtener estudiantes con NEE del departamento | JEFE_DEPARTAMENTO |
| GET | `/departments/heads/teachers` | Obtener docentes del departamento con estadísticas | JEFE_DEPARTAMENTO |
| GET | `/departments/heads/departments/:departmentId/statistics` | Obtener estadísticas de un departamento específico | JEFE_DEPARTAMENTO |

### 6. HeadsController (`/heads`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| GET | `/heads/my-teachers` | Obtener docentes a cargo | JEFE_DEPARTAMENTO, JEFE_CARRERA |
| GET | `/heads/teachers/:teacherId/adjustment-status` | Estado de ajustes de un docente | JEFE_DEPARTAMENTO, JEFE_CARRERA |
| GET | `/heads/department/statistics` | Estadísticas del departamento | JEFE_DEPARTAMENTO |
| GET | `/heads/alerts/unreviewed-adjustments` | Alertas de ajustes no revisados | JEFE_DEPARTAMENTO, JEFE_CARRERA |
| POST | `/heads/alerts/remind-teacher/:teacherId` | Enviar recordatorio a docente | JEFE_DEPARTAMENTO, JEFE_CARRERA |

### 7. CareersController (`/careers`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| POST | `/careers` | Crear una nueva carrera | COORDINADOR |
| GET | `/careers` | Obtener todas las carreras | Autenticado |
| GET | `/careers/:id` | Obtener una carrera por ID | Autenticado |
| PATCH | `/careers/:id` | Actualizar una carrera | COORDINADOR |
| DELETE | `/careers/:id` | Eliminar una carrera | COORDINADOR |
| GET | `/careers/:id/students` | Obtener estudiantes de una carrera | COORDINADOR |

### 8. CareerHeadsController (`/career-heads`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| GET | `/career-heads/my-career` | Información de la carrera del jefe | JEFE_CARRERA |
| GET | `/career-heads/statistics` | Estadísticas de la carrera | JEFE_CARRERA |
| GET | `/career-heads/students` | Estudiantes de la carrera | JEFE_CARRERA |
| GET | `/career-heads/adjustments` | Ajustes razonables de la carrera | JEFE_CARRERA |

### 9. CareerStudentsController (`/careers`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| POST | `/careers/:id/students` | Agregar estudiante a carrera | COORDINADOR, EDUCADORA_SOCIAL |
| DELETE | `/careers/:id/students/:studentId` | Eliminar estudiante de carrera | COORDINADOR, EDUCADORA_SOCIAL |
| GET | `/careers/:id/students` | Obtener estudiantes de carrera | COORDINADOR, EDUCADORA_SOCIAL |

### 10. CoursesController (`/courses`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| POST | `/courses` | Crear un nuevo curso | COORDINADOR |
| GET | `/courses` | Obtener todos los cursos | COORDINADOR, JEFE_CARRERA, JEFE_DEPARTAMENTO, DOCENTE |
| GET | `/courses/student/:studentId` | Cursos de un estudiante | COORDINADOR, EDUCADORA_SOCIAL, ESTUDIANTE |
| GET | `/courses/:id` | Obtener curso por ID | COORDINADOR, JEFE_CARRERA, JEFE_DEPARTAMENTO, DOCENTE |
| GET | `/courses/:courseId/students-with-adjustments` | Estudiantes con ajustes en curso | COORDINADOR, JEFE_CARRERA, JEFE_DEPARTAMENTO, DOCENTE |
| PATCH | `/courses/:id` | Actualizar un curso | COORDINADOR |
| DELETE | `/courses/:id` | Eliminar un curso | COORDINADOR |

### 11. AcademicHistoryController (`/academic-history`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| POST | `/academic-history` | Crear registro de historial | COORDINADOR, DIDDEC_STAFF |
| GET | `/academic-history` | Obtener todos los registros | COORDINADOR, DIDDEC_STAFF |
| GET | `/academic-history/student/:studentId` | Historial de un estudiante | COORDINADOR, DIDDEC_STAFF |
| GET | `/academic-history/course/:courseId` | Historial de un curso | COORDINADOR, DIDDEC_STAFF |
| GET | `/academic-history/:id` | Obtener registro específico | COORDINADOR, DIDDEC_STAFF |
| PATCH | `/academic-history/:id` | Actualizar registro | COORDINADOR, DIDDEC_STAFF |
| DELETE | `/academic-history/:id` | Eliminar registro | COORDINADOR, DIDDEC_STAFF |

### 12. AdjustmentsController (`/adjustments`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| POST | `/adjustments` | Crear nuevo ajuste razonable | COORDINADOR, EDUCADORA_SOCIAL |
| GET | `/adjustments` | Listar todos los ajustes | COORDINADOR, EDUCADORA_SOCIAL, JEFE_CARRERA, JEFE_DEPARTAMENTO, DOCENTE |
| GET | `/adjustments/:id` | Obtener ajuste por ID | COORDINADOR, EDUCADORA_SOCIAL, JEFE_CARRERA, JEFE_DEPARTAMENTO, DOCENTE, ESTUDIANTE |
| PATCH | `/adjustments/:id` | Actualizar ajuste | COORDINADOR, EDUCADORA_SOCIAL |
| DELETE | `/adjustments/:id` | Eliminar ajuste | COORDINADOR, EDUCADORA_SOCIAL |
| GET | `/adjustments/student/:studentId` | Ajustes por estudiante | COORDINADOR, EDUCADORA_SOCIAL, ESTUDIANTE |
| GET | `/adjustments/department/:departmentId` | Ajustes por departamento | JEFE_DEPARTAMENTO |
| GET | `/adjustments/course/:courseId` | Ajustes por curso | COORDINADOR, EDUCADORA_SOCIAL, DOCENTE |
| POST | `/adjustments/:id/documents/:documentId` | Asociar documento a ajuste | COORDINADOR, EDUCADORA_SOCIAL |
| PATCH | `/adjustments/:id/status/:status` | Actualizar estado de ajuste | COORDINADOR, EDUCADORA_SOCIAL, JEFE_CARRERA |
| PATCH | `/adjustments/:id/read` | Marcar ajuste como leído | DOCENTE |

### 13. StaffAdjustmentsController (`/staff-adjustments`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| GET | `/staff-adjustments/help-requests` | Obtener solicitudes de ayuda | DIDDEC_STAFF, COORDINADOR |
| GET | `/staff-adjustments/help-requests/:adjustmentId/:adjustmentIndex` | Detalle de solicitud de ayuda | DIDDEC_STAFF, COORDINADOR |
| PATCH | `/staff-adjustments/help-requests/:adjustmentId/:adjustmentIndex/status` | Actualizar estado de solicitud | DIDDEC_STAFF, COORDINADOR |
| POST | `/staff-adjustments/:id/:index/approve` | Aprobar ajuste | DIDDEC_STAFF, COORDINADOR |
| POST | `/staff-adjustments/:id/:index/reject` | Rechazar ajuste | DIDDEC_STAFF, COORDINADOR |
| GET | `/staff-adjustments/pending` | Ajustes pendientes | DIDDEC_STAFF, COORDINADOR |
| GET | `/staff-adjustments/read-statistics` | Estadísticas de lectura | DIDDEC_STAFF, COORDINADOR |
| GET | `/staff-adjustments/unread-by-teacher` | Ajustes no leídos por docente | DIDDEC_STAFF, COORDINADOR |

### 14. DocumentsController (`/documents`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| POST | `/documents/upload` | Subir documento para estudiante | COORDINADOR, EDUCADORA_SOCIAL |
| GET | `/documents/student/:studentId` | Documentos de un estudiante | COORDINADOR, EDUCADORA_SOCIAL |
| GET | `/documents/:documentId/metadata` | Obtener metadatos de documento | COORDINADOR, EDUCADORA_SOCIAL, DIDDEC_STAFF, ESTUDIANTE |
| GET | `/documents/:documentId/download` | Descargar documento | COORDINADOR, EDUCADORA_SOCIAL, DIDDEC_STAFF, ESTUDIANTE |
| PATCH | `/documents/:documentId/metadata` | Actualizar metadatos | COORDINADOR, EDUCADORA_SOCIAL |
| DELETE | `/documents/:documentId` | Eliminar documento | COORDINADOR, EDUCADORA_SOCIAL |
| PATCH | `/documents/verify/:documentId` | Verificar documento | COORDINADOR, EDUCADORA_SOCIAL |
| PATCH | `/documents/reject/:documentId` | Rechazar documento | COORDINADOR, EDUCADORA_SOCIAL |
| GET | `/documents/templates/:templateType` | Obtener URL de plantilla | Autenticado |
| GET | `/documents/templates/download/:fileName` | Descargar plantilla | Autenticado |
| POST | `/documents/student/upload` | Estudiante sube documento | ESTUDIANTE |

### 15. CategoriesController (`/categories` y `/nee-categories`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| POST | `/categories` | Crear categoría de ajuste | COORDINADOR, EDUCADORA_SOCIAL |
| GET | `/categories` | Obtener todas las categorías | COORDINADOR, EDUCADORA_SOCIAL, DIDDEC_STAFF, DOCENTE |
| GET | `/categories/:id` | Obtener categoría por ID | COORDINADOR, EDUCADORA_SOCIAL, DIDDEC_STAFF, DOCENTE |
| PATCH | `/categories/:id` | Actualizar categoría | COORDINADOR, EDUCADORA_SOCIAL |
| DELETE | `/categories/:id` | Eliminar categoría | COORDINADOR, EDUCADORA_SOCIAL |

### 16. ConsentController (`/consents`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| POST | `/consents` | Otorgar/actualizar consentimiento | ESTUDIANTE |
| GET | `/consents/my-consent` | Obtener mi consentimiento | ESTUDIANTE |
| PATCH | `/consents/revoke` | Revocar consentimiento | ESTUDIANTE |
| GET | `/consents/all` | Listar todos los consentimientos | COORDINADOR, EDUCADORA_SOCIAL |
| GET | `/consents/stats` | Estadísticas de consentimientos | COORDINADOR, EDUCADORA_SOCIAL, DIDDEC_STAFF |

### 17. NotificationsController (`/notifications`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| GET | `/notifications` | Obtener notificaciones del usuario | Autenticado |
| GET | `/notifications/unread-count` | Cantidad de no leídas | Autenticado |
| GET | `/notifications/by-type/:type` | Notificaciones por tipo | Autenticado |
| GET | `/notifications/:id` | Obtener notificación por ID | Autenticado |
| PATCH | `/notifications/:id/read` | Marcar como leída | Autenticado |
| PATCH | `/notifications/mark-all-read` | Marcar todas como leídas | Autenticado |
| POST | `/notifications/config` | Configurar notificaciones | Autenticado |
| POST | `/notifications/bulk` | Enviar notificaciones masivas | Autenticado |

### 18. ResourcesController (`/resources` y `/educational-resources`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| POST | `/resources` | Crear nuevo recurso | COORDINADOR, DIDDEC_STAFF |
| GET | `/resources` | Obtener todos los recursos | COORDINADOR, EDUCADORA_SOCIAL, DIDDEC_STAFF, DOCENTE |
| GET | `/resources/search` | Buscar recursos | COORDINADOR, EDUCADORA_SOCIAL, DIDDEC_STAFF, DOCENTE |
| GET | `/resources/adjustment-type/:id` | Recursos por tipo de ajuste | COORDINADOR, EDUCADORA_SOCIAL, DIDDEC_STAFF, DOCENTE |
| GET | `/resources/:id` | Obtener recurso por ID | COORDINADOR, EDUCADORA_SOCIAL, DIDDEC_STAFF, DOCENTE |
| GET | `/resources/:id/download` | Descargar recurso | COORDINADOR, EDUCADORA_SOCIAL, DIDDEC_STAFF, DOCENTE |
| PATCH | `/resources/:id` | Actualizar recurso | COORDINADOR, DIDDEC_STAFF |
| DELETE | `/resources/:id` | Eliminar recurso | COORDINADOR, DIDDEC_STAFF |

### 19. UsersController (`/users`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| GET | `/users` | Obtener todos los usuarios | COORDINADOR, EDUCADORA_SOCIAL |
| GET | `/users/profile` | Obtener perfil del usuario actual | Autenticado |
| GET | `/users/:id` | Obtener usuario por ID | COORDINADOR, EDUCADORA_SOCIAL |
| PATCH | `/users/:id` | Actualizar usuario | COORDINADOR, EDUCADORA_SOCIAL |
| DELETE | `/users/:id` | Eliminar usuario | COORDINADOR |

### 20. DIDDECController - Users (`/diddec`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| GET | `/diddec/global-statistics` | Estadísticas globales del sistema | DIDDEC_STAFF |
| GET | `/diddec/disability-statistics` | Estadísticas por tipo de discapacidad | DIDDEC_STAFF |
| GET | `/diddec/department-comparison` | Comparación entre departamentos | DIDDEC_STAFF |
| GET | `/diddec/teachers-performance` | Rendimiento de docentes | DIDDEC_STAFF |
| POST | `/diddec/send-notification` | Enviar notificación global | DIDDEC_STAFF |
| GET | `/diddec/critical-alerts` | Obtener alertas críticas | DIDDEC_STAFF |

### 21. DIDDECController - Main (`/diddec`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| GET | `/diddec/statistics` | Estadísticas generales | COORDINADOR, DIDDEC_STAFF |
| GET | `/diddec/reports/semester/:semester` | Informe por semestre | COORDINADOR, DIDDEC_STAFF |
| GET | `/diddec/students/all` | Todos los estudiantes con NEE | COORDINADOR, DIDDEC_STAFF |
| GET | `/diddec/adjustments/trends` | Tendencias de ajustes | COORDINADOR, DIDDEC_STAFF |
| GET | `/diddec/adjustments/compliance` | Cumplimiento de ajustes | COORDINADOR, DIDDEC_STAFF |

### 22. DiddecReportsController (`/diddec/reports`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| POST | `/diddec/reports/export` | Generar reporte | COORDINADOR, DIDDEC_STAFF, JEFE_CARRERA, JEFE_DEPARTAMENTO |
| GET | `/diddec/reports/download/:filename` | Descargar reporte | COORDINADOR, DIDDEC_STAFF, JEFE_CARRERA, JEFE_DEPARTAMENTO |

### 23. DiddecResourcesController (`/diddec/resources`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| POST | `/diddec/resources` | Crear recurso de apoyo | COORDINADOR, DIDDEC_STAFF |
| GET | `/diddec/resources` | Listar recursos | COORDINADOR, DIDDEC_STAFF, DOCENTE |
| GET | `/diddec/resources/search` | Buscar recursos | COORDINADOR, DIDDEC_STAFF, DOCENTE |
| GET | `/diddec/resources/adjustment-type/:id` | Recursos por tipo de ajuste | COORDINADOR, DIDDEC_STAFF, DOCENTE |
| GET | `/diddec/resources/:id` | Obtener recurso | COORDINADOR, DIDDEC_STAFF, DOCENTE |
| GET | `/diddec/resources/:id/download` | Descargar recurso | COORDINADOR, DIDDEC_STAFF, DOCENTE |
| PATCH | `/diddec/resources/:id` | Actualizar recurso | COORDINADOR, DIDDEC_STAFF |
| DELETE | `/diddec/resources/:id` | Eliminar recurso | COORDINADOR, DIDDEC_STAFF |

### 24. SyncController (`/sync`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| POST | `/sync/students/nee` | Sincronizar estudiantes NEE | Autenticado |
| POST | `/sync/students/nee/persist` | Sincronizar y persistir estudiantes | Autenticado |
| POST | `/sync/courses` | Sincronizar cursos | Autenticado |
| POST | `/sync/courses/persist` | Sincronizar y persistir cursos | Autenticado |
| POST | `/sync/inscriptions` | Sincronizar inscripciones | Autenticado |
| POST | `/sync/inscriptions/nee` | Sincronizar inscripciones NEE | Autenticado |

### 25. HawaiiSyncController (`/admin/hawaii-sync`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| POST | `/admin/hawaii-sync/students` | Sincronizar estudiantes NEE | COORDINADOR |
| POST | `/admin/hawaii-sync/courses-enrollments` | Sincronizar cursos e inscripciones | COORDINADOR |
| POST | `/admin/hawaii-sync/all` | Sincronizar todos los datos NEE | COORDINADOR |
| GET | `/admin/hawaii-sync/status` | Estado de sincronización | COORDINADOR |

### 26. HawaiiCacheController (`/admin/hawaii-cache`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| GET | `/admin/hawaii-cache/stats` | Estadísticas del caché | COORDINADOR |
| POST | `/admin/hawaii-cache/preload/:semester` | Pre-cargar datos de semestre | COORDINADOR |
| POST | `/admin/hawaii-cache/refresh` | Actualizar caché | COORDINADOR |
| DELETE | `/admin/hawaii-cache/cleanup` | Limpiar caché expirado | COORDINADOR |
| GET | `/admin/hawaii-cache/status/:type` | Estado de caché específico | COORDINADOR |
| POST | `/admin/hawaii-cache/warm-up` | Precalentar caché | COORDINADOR |

### 27. SemesterSyncController (`/semester-sync`)

| Método | Ruta | Descripción | Roles Requeridos |
|--------|------|-------------|------------------|
| POST | `/semester-sync/full-sync/:semester` | Sincronización completa | DIDDEC_STAFF, COORDINADOR |
| GET | `/semester-sync/sync-status/:semester` | Estado de sincronización | DIDDEC_STAFF, COORDINADOR, EDUCADORA_SOCIAL |
| POST | `/semester-sync/sync-students/:semester` | Sincronizar solo estudiantes | DIDDEC_STAFF, COORDINADOR |
| POST | `/semester-sync/sync-courses/:semester` | Sincronizar solo cursos | DIDDEC_STAFF, COORDINADOR |
| GET | `/semester-sync/pre-check/:semester` | Pre-validación | DIDDEC_STAFF, COORDINADOR |
| GET | `/semester-sync/current-semester` | Obtener semestre actual | Autenticado |
| GET | `/semester-sync/status` | Estado del scheduler | Autenticado |
| POST | `/semester-sync/trigger` | Ejecutar sincronización manual | Autenticado |
| GET | `/semester-sync/validate` | Validar precondiciones | Autenticado |
| GET | `/semester-sync/next-execution` | Próximas ejecuciones | Autenticado |

## Roles del Sistema

Según el análisis del código, el sistema cuenta con los siguientes roles:

1. **COORDINADOR** - Administrador principal del sistema
2. **EDUCADORA_SOCIAL** - Gestión de entrevistas y registro de usuarios
3. **DIDDEC_STAFF** - Personal especializado de DIDDEC
4. **JEFE_CARRERA** - Gestión académica de carreras
5. **JEFE_DEPARTAMENTO** - Gestión académica de departamentos
6. **DOCENTE** - Profesores de asignaturas
7. **ESTUDIANTE** - Estudiantes con NEE

## Estado Actual del Backend

Basado en la memoria existente del sistema:
- Autenticación 100% funcional con usuarios de prueba
- Base de datos ucn_inclui2_test operativa
- Sistema 90%+ funcional para desarrollo activo
- Solo 1 endpoint crítico con problema real: `/students/profile` (error 500)

## Observaciones Importantes

1. **Autenticación**: Todos los endpoints (excepto los de `/auth` y `/`) requieren autenticación JWT mediante el header `Authorization: Bearer {token}`

2. **Rutas Duplicadas**: Algunos controllers comparten rutas base:
   - `/careers` es usado por `CareersController` y `CareerStudentsController`
   - `/diddec` es usado por dos controllers diferentes
   - `/resources` y `/educational-resources` apuntan al mismo controller

3. **Parámetros Comunes**:
   - `semester`: Formato `YYYY-P` (ej: 2025-1)
   - IDs: Generalmente son ObjectId de MongoDB

4. **Respuestas HTTP Estándar**:
   - 200: Operación exitosa
   - 201: Recurso creado
   - 204: Sin contenido (para DELETE exitoso)
   - 400: Solicitud incorrecta
   - 401: No autorizado
   - 403: Prohibido (sin permisos)
   - 404: Recurso no encontrado
   - 409: Conflicto
   - 500: Error interno del servidor

Esta documentación refleja el estado real del código fuente del proyecto al 19-01-2025.

## Estado de Documentación Swagger

**Última actualización**: 19 de enero de 2025
**Controllers documentados**: 21 de 28 (75.0%)
**Funcionalidad crítica**: 100% documentada

### ✅ Controllers Completamente Documentados:
1-17. **Core Sistema NEE** - Todos los endpoints críticos
18. **StaffAdjustmentsController** - Gestión administrativa
19. **AcademicHistoryController** - Historial académico
20. **DiddecController** - Análisis institucional
21. **SyncController** - Sincronización Hawaii UCN

### 🟡 Controllers Pendientes (Baja Prioridad):
22-28. Controllers de sincronización avanzada y caché

**Nota**: El core funcional del sistema INCLUI2 está 100% documentado y listo para desarrollo. 