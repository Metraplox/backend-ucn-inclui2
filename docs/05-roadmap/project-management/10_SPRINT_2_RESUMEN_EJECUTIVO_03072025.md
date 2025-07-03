# 📜 Resumen Ejecutivo - Sprint 2 (Finales de Junio - 03 Julio 2025)

## 🎯 **Objetivo del Sprint**: Robustecer la Seguridad, Mejorar la Experiencia de Usuario y Habilitar Notificaciones en Tiempo Real.

---

## ✅ **Logros Principales**

Este sprint se centró en mejorar la calidad de vida de los usuarios y administradores, así como en sentar las bases para futuras funcionalidades de seguimiento y alerta.

### 1. **Implementación de un Sistema de Notificaciones en Tiempo Real (WebSockets)**
- **Descripción:** Se reemplazó por completo el sistema de notificaciones obsoleto del frontend, que se basaba en comprobaciones periódicas, por una solución moderna y eficiente utilizando **WebSockets** con `socket.io`.
- **Impacto:** La aplicación ahora puede recibir y mostrar notificaciones del backend de forma instantánea. Se implementó una alerta de seguridad inmediata tras el cambio de contraseña como primer caso de uso. La UI ahora refleja el número de notificaciones no leídas en tiempo real.
- **Componentes Técnicos:**
    - `backend`: `NotificationsGateway` integrado con `AuthService`.
    - `frontend`: `NotificationService` refactorizado como Singleton, uso de `socket_io_client`, y `ValueListenableBuilder` en la UI.

### 2. **Refactorización Completa de Validaciones en Formularios**
- **Descripción:** Se realizó una auditoría y refactorización de todos los formularios de entrada de datos de la aplicación.
- **Impacto:** Se ha incrementado significativamente la robustez y seguridad de la aplicación. La experiencia de usuario es más fluida, ya que la validación ahora ocurre en tiempo real mientras el usuario escribe.
- **Componentes Técnicos:**
    - Se creó un módulo centralizado `utils/Validators.dart` para unificar las reglas.
    - Se refactorizaron **5 flujos críticos**: Login, Registro de Docente, Cambio de Contraseña (usuario), Gestión de Usuarios (admin) y Cambio de Contraseña (admin).
    - Se estandarizó el uso de `Form`, `TextFormField` y `AutovalidateMode.onUserInteraction`.

### 3. **Funcionalidades de Gestión de Cuentas Completadas**
- **Descripción:** Se implementaron y aseguraron todos los flujos relacionados con la gestión de cuentas de usuario.
- **Impacto:** Los administradores ahora tienen control total sobre el ciclo de vida de los usuarios, y los propios usuarios tienen las herramientas necesarias para gestionar la seguridad de su cuenta.
- **Componentes Técnicos:**
    - `backend`: Se activaron y aseguraron los endpoints `POST /users`, `POST /auth/change-password` y `POST /users/:id/admin-change-password`.
    - `frontend`: Se crearon y enlazaron las pantallas y diálogos correspondientes a cada funcionalidad.

### 4. **Habilitada la Descarga Segura de Documentos**
- **Descripción:** Se creó un endpoint específico y seguro para la descarga del formulario de consentimiento.
- **Impacto:** Los estudiantes ahora pueden descargar la plantilla oficial directamente desde la plataforma, simplificando el proceso de consentimiento.
- **Componentes Técnicos:**
    - `backend`: `GET /documents/templates/consent-form`.
    - `frontend`: Uso de `url_launcher` en la vista de documentos del estudiante.

---

## 📈 **Conclusión**

Este sprint ha sido un éxito, resultando en una aplicación notablemente más segura, estable y profesional. Se ha pagado una importante deuda técnica en el frontend (notificaciones y validaciones) y se han completado funcionalidades de gestión que eran críticas para la operación del sistema. La base de código está ahora mejor preparada para las próximas fases de desarrollo, como el sistema de plazos y reportes. 