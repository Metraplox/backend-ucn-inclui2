# 🗺️ Hoja de Ruta de Desarrollo - Plan Detallado y Profesional

**📅 Fecha de Planificación:** 03 de Julio 2025
**🎯 Objetivo General:** Construir una plataforma de gestión de ajustes razonables que sea robusta, escalable y centrada en las necesidades específicas de cada rol de usuario, garantizando la integridad de los datos, la comunicación fluida y la eficiencia operativa.

---

## 🚀 **Contexto Estratégico**

Este roadmap se ha desarrollado a partir de un análisis exhaustivo de los documentos de requisitos (`requisitos.txt`), las guías de UX/UI y la arquitectura de sistema existente. La estrategia prioriza la construcción de una base arquitectónica sólida (gestión de roles y consentimientos) antes de desarrollar las funcionalidades específicas de cada rol.

---

## 📍 **Fase 0: Arquitectura de Roles y Gestión (En Progreso)**

**Estado:** 🟢 **En Progreso**

**Justificación:** La capacidad de un usuario para desempeñar múltiples roles es un requisito fundamental que impacta toda la aplicación. Esta fase es crítica para la flexibilidad y escalabilidad del sistema.

#### **Backend: API y Lógica de Negocio**
- **Endpoint de Gestión de Roles**:
  - `PATCH /users/:id/roles`
  - **Protección:** Rol `INCLUYE`.
  - **Lógica:** Actualiza la lista de roles de un usuario.
- **Endpoint de Obtención de Roles**:
  - `GET /users/:id/roles`
  - **Protección:** Rol `INCLUYE`.
  - **Lógica:** Devuelve la lista de roles de un usuario.

#### **Frontend: Experiencia Multi-Rol**
- **Adaptar `AuthProvider` y `UserModel`**:
    - `UserModel` debe manejar `roles` como una lista.
    - `AuthProvider` debe gestionar el rol activo y permitir el cambio de rol.
- **Selector de Rol en UI**:
    - Implementar un selector de rol en el `AppBar` del `DashboardScaffold`, visible solo si el usuario tiene más de un rol.
- **Renderizado Dinámico de Vistas**:
    - La vista principal mostrará el dashboard correspondiente al rol activo.

#### **Frontend: Pantalla de Gestión de Roles (Rol Incluye)**
- **Vista `UserManagementScreen`**:
  - Búsqueda de usuarios.
  - Vista de detalle de usuario con roles actuales.
  - Diálogo para editar roles y actualizar mediante el endpoint `PATCH /users/:id/roles`.

---

## 📍 **Fase 1: Implementación de Dashboards por Rol (UX-Driven)**

**Estado:** 📋 **Pendiente**

**Justificación:** Con la arquitectura de roles establecida, se construirán las interfaces de usuario personalizadas para cada rol, siguiendo estrictamente los principios de "Role-Centered Design".

- **`EstudianteDashboard`**:
  - **Foco:** Acciones pendientes (confirmar ajustes, subir documentos).
  - **Componentes:** Tarjeta de "Acción Requerida", lista de cursos con ajustes, acceso a historial.
- **`DocenteDashboard`**:
  - **Foco:** Cursos con revisiones de ajustes pendientes.
  - **Componentes:** Lista de cursos, con indicador visual para los que requieren atención. Acceso rápido para marcar ajustes como "revisados".
- **`JefaturaDashboard`**:
  - **Foco:** Supervisión y KPIs.
  - **Componentes:** Estadísticas de cumplimiento de revisiones por parte de los docentes de su carrera, lista de estudiantes con NEE, alertas de incumplimiento.
- **`DiddecDashboard`**:
  - **Foco:** Bandeja de entrada de tareas y gestión de recursos.
  - **Componentes:** Lista de solicitudes de apoyo de docentes, gestión de recursos de acompañamiento, visualización de estadísticas de cumplimiento.
- **`IncluyeDashboard`**:
  - **Foco:** Centro de comando estratégico.
  - **Componentes:** Vista general del sistema, gestión de usuarios y roles, acceso a reportes globales, gestión de consentimientos.

---

## 📍 **Fase 2: Sistema de Notificaciones y Tareas Programadas**

**Estado:** 📋 **Pendiente**

**Justificación:** Automatizar la supervisión y comunicación proactiva, uno de los requisitos clave para asegurar el cumplimiento de los plazos.

#### **Backend:**
- **Tareas Programadas (Cron Jobs con `@nestjs/schedule`)**:
  - Tarea diaria para verificar revisiones de ajustes pendientes después de la fecha límite.
- **Sistema de Notificaciones (SSE - Server-Sent Events)**:
  - Implementar endpoints SSE para que el frontend pueda suscribirse a notificaciones en tiempo real.
- **Lógica del Verificador de Cumplimiento**:
  - Identificar ajustes no revisados por docentes.
  - Agrupar por docente y generar notificaciones para `INCLUYE`, `DIDDEC` y `JEFE_CARRERA`.
- **Endpoint de Alertas**:
  - `GET /notifications`
  - **Lógica:** Devuelve las notificaciones para el usuario autenticado.

#### **Frontend:**
- **Integración con `notification_provider`**:
  - El `notification_provider` se conectará al endpoint SSE para recibir notificaciones en tiempo real.
- **Componente de Alerta en Dashboards**:
  - Mostrar una sección de "Alertas" en los dashboards de los roles correspondientes.

---

## 📍 **Fase 3: Módulo Avanzado de Reportes y Estadísticas**

**Estado:** 📋 **Pendiente**

**Justificación:** Proporcionar a los roles administrativos las herramientas necesarias para el análisis de datos y la toma de decisiones informadas.

#### **Backend:**
- **Endpoints de Agregación (con Mongoose Aggregation Pipeline)**:
  - `GET /reports/compliance/by-department`: Estadísticas de cumplimiento por departamento/carrera.
  - `GET /reports/compliance/by-teacher`: Tasas de cumplimiento por docente.
  - `GET /reports/students/with-nee`: Lista de estudiantes con NEE, filtrable por carrera.
- **Servicio de Exportación (`exceljs` o similar)**:
  - `GET /reports/compliance/export`: Genera y devuelve un archivo Excel con los datos de los reportes.

#### **Frontend:**
- **Vista de "Reportes"**:
  - Nueva pantalla accesible para roles administrativos.
  - Tablas y gráficos (usando `fl_chart` o similar) para visualizar los datos.
  - Filtros por semestre, carrera, etc.
- **Funcionalidad de Exportación**:
  - Botón para descargar los reportes en formato Excel.

---

## 📍 **Fase 4: Funcionalidades Futuras y Mejoras Continuas**

**Estado:** 📋 **Planificado**

**Justificación:** Incorporar las funcionalidades avanzadas identificadas en los requisitos y mejorar continuamente la plataforma.

#### **Gestión de Consentimientos Avanzada**
- **Backend:**
  - Endpoint para que el estudiante descargue un documento de consentimiento en blanco.
  - Endpoint para que el estudiante suba el documento firmado.
  - Endpoint para que el rol `INCLUYE` verifique y apruebe el consentimiento.
- **Frontend:**
  - Vista para que el estudiante descargue y suba el documento de consentimiento.
  - Indicador visual del estado del consentimiento.

#### **Historial Académico del Estudiante**
- **Backend:**
  - Endpoint para obtener el historial académico de un estudiante, incluyendo cursos y ajustes por semestre.
- **Frontend:**
  - Vista en el perfil del estudiante para visualizar su historial académico por semestre.

#### **Gestión de Categorías de Ajustes**
- **Backend:**
  - Endpoints CRUD para que el rol `INCLUYE` gestione las categorías de ajustes.
- **Frontend:**
  - Vista de gestión de categorías para el rol `INCLUYE`.
