# 🗺️ Hoja de Ruta de Desarrollo - Fase 2 (Post-Refactorización)

**📅 Fecha de Planificación:** 03 de Julio 2025
**🎯 Objetivo General:** Implementar funcionalidades de negocio avanzadas basadas en la lógica de plazos, notificaciones proactivas y reportes de cumplimiento, según los requisitos del cliente.

---

## 🚀 **Contexto**

Tras un sprint intensivo de refactorización y robustecimiento de la plataforma (Sprint 2), la base de código del frontend y backend es ahora significativamente más estable, segura y profesional. Se han saldado deudas técnicas importantes en el sistema de notificaciones y en la validación de formularios.

Con esta base sólida, el proyecto está listo para abordar las funcionalidades de negocio más complejas que son el núcleo de la propuesta de valor del sistema. Esta hoja de ruta detalla las próximas tres fases de desarrollo.

---

## 📊 **Avances al 04 de Julio 2025**

### Reducción de deuda técnica
- Se añadió la dependencia `logger` y se reemplazaron las llamadas a `print` por `log.i/e/d/w`.
- Se excluyó `remote_branch/**` en `analysis_options.yaml` para prevenir falsos positivos.
- Se renombraron archivos y parámetros a notación `snake_case` / `lowerCamelCase`.
- Se añadieron verificaciones `if (!mounted)` y `context.mounted` para evitar `use_build_context_synchronously`.
- Se eliminaron widgets y métodos obsoletos; las advertencias del analizador se redujeron de ~101 a **12** (todas INFO/WARNING).

### Avance funcional
- **Backend**: `SemesterConfigModule` implementado con esquema, servicio y endpoints (*POST*, *PATCH*, *GET current*).
- **Frontend**: Carpeta `features/semester_management` creada y pantalla básica de configuración de semestre añadida (UI pendiente).
- Patrón **Repositorio** y estructura por features iniciados; `AuthRepository` en uso.

### Próximos focos inmediatos
- Completar `NotificationService` (backend, caché local y pantalla dedicada).
- Cargar historial de cursos/ajustes en `StudentProfileScreen`.
- Flujo de formulario de consentimiento (descarga, subida y verificación).
- Exportar reportes a Excel/CSV.

---

## 📍 **Fase 1: Módulo de Gestión de Plazos y Semestre + Refactorización Técnica de Frontend**

**Estado:** 🟢 **En Progreso**

**Justificación:** El sistema necesita un concepto de "plazos" y una arquitectura frontend robusta antes de escalar. Esta fase combina la creación de una funcionalidad clave con el fortalecimiento de la base técnica, asegurando que el crecimiento futuro sea sostenible y eficiente.

#### **Frontend: Refactorización Arquitectónica (Tareas Habilitantes)**
- **Implementar Patrón Repositorio**: ✅ **Completado (para Autenticación)**
    - Crear `AuthRepository` y `UserRepository` para aislar la lógica de acceso a datos de los servicios.
    - Refactorizar `AuthService` y `UserService` para que utilicen los nuevos repositorios.
- **Adoptar Provider para Estado Global**:
    - Implementar un `AuthProvider` o similar para gestionar el estado de autenticación (`user`, `token`, etc.) de forma centralizada.
    - Eliminar la dependencia de métodos o variables estáticas para el estado del usuario.
- **Centralizar Constantes**: ✅ **Completado**
    - Crear archivos dedicados para constantes de API (`api_constants.dart`), claves de almacenamiento y textos de UI.
- **Iniciar Estructura por Features**: ✅ **Completado (Iniciado)**
    - La nueva funcionalidad de "Configuración del Semestre" se construirá siguiendo una estructura orientada a features (ej: `lib/features/semester_management/...`).

#### **Backend: Lógica de Negocio**
- **Modelo/Schema `SemesterConfig`**: ✅ **Completado (Jul 2025)**
  - Crear una nueva colección en MongoDB para almacenar configuraciones por semestre (ej: `2025-02`).
  - Campos clave: `fechaFinTomaRamos`, `fechaLimiteRevisionAjustes`.
- **Endpoints para `SemesterConfig`**: ✅ **Completado (Jul 2025)**
  - `POST /semester-config`: Protegido para `COORDINADOR`. Permite crear la configuración de un nuevo semestre.
  - `PATCH /semester-config/:id`: Protegido para `COORDINADOR`. Permite actualizar las fechas.
  - `GET /semester-config/current`: Público. Devuelve la configuración del semestre activo.

#### **Frontend: Nueva Funcionalidad**
- **Vista de "Configuración del Semestre"**:
  - Una nueva pantalla accesible para el `COORDINADOR`.
  - Debe permitir ver, crear y editar las fechas límite para cada semestre de forma intuitiva.
  - **Nota:** Esta vista se construirá utilizando la nueva arquitectura (Provider, Repositorio, estructura de feature).

---

## 📍 **Fase 2: Sistema de Tareas Programadas y Verificación**

**Estado:** 📋 **Pendiente** (Depende de Fase 1)

**Justificación:** Implementa la lógica principal de la solicitud del cliente: notificar proactivamente sobre el incumplimiento de plazos por parte de los docentes.

#### **Backend:**
- **Tareas Programadas (Cron Jobs)**:
  - Utilizar `@nestjs/schedule` para crear un servicio que se ejecute automáticamente a diario.
- **Lógica del Verificador de Cumplimiento**:
  1. La tarea programada comprobará si la `fechaLimiteRevisionAjustes` del semestre actual ha pasado.
  2. Si ha pasado, buscará todos los ajustes de ese semestre que no tengan el "check" de leído/revisado por el docente.
  3. Agrupará los resultados por docente para evitar notificaciones duplicadas.
- **Integración con Notificaciones**:
  - Por cada docente en falta, el sistema generará notificaciones en tiempo real (vía WebSockets) a los siguientes roles:
    - `COORDINADOR`
    - `DIDDEC_STAFF`
    - `JEFE_CARRERA` (del curso correspondiente)
  - **Ejemplo de Mensaje:** *"El docente Juan Pérez tiene 3 ajustes pendientes de revisar en el curso 'Cálculo I' fuera de plazo."*

#### **Frontend:**
- **Componente de Alerta en Dashboards**:
  - En los dashboards de `COORDINADOR`, `DIDDEC` y `JEFE_CARRERA`, se mostrará una tarjeta o sección de "Alertas de Incumplimiento" que se alimentará de estas nuevas notificaciones.

---

## 📍 **Fase 3: Módulo Avanzado de Reportes y Estadísticas**

**Estado:** 📋 **Pendiente** (Depende de Fase 2)

**Justificación:** Permite a los roles administrativos visualizar, analizar y exportar los datos de cumplimiento, una necesidad clave detallada en los requisitos.

#### **Backend:**
- **Nuevos Endpoints de Agregación**:
  - `GET /reports/compliance/by-department`: Devolverá estadísticas de cumplimiento de revisión de ajustes, agrupadas por departamento y/o carrera.
  - `GET /reports/compliance/by-teacher`: Devolverá una lista de todos los docentes con sus tasas de cumplimiento (ej: 8 de 10 ajustes revisados a tiempo).
- **Servicio de Exportación**:
  - Un endpoint, `GET /reports/compliance/export`, que genere un archivo Excel o CSV con los datos de los reportes para análisis externo.

#### **Frontend:**
- **Vista de "Reportes de Cumplimiento"**:
  - Una nueva pantalla donde los roles administrativos puedan ver tablas y gráficos con las estadísticas de cumplimiento.
- **Funcionalidad de Exportación**:
  - Un botón de "Exportar a Excel" en la vista de reportes que consuma el endpoint de exportación y facilite la descarga del archivo. 