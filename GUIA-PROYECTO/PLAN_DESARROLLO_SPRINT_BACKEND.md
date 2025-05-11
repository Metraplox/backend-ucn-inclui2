# Plan de Desarrollo del Sprint - Backend Inclusión UCN

## 1. Objetivo General del Sprint (Backend)

Establecer un sistema funcional para la gestión de información de estudiantes y sus documentos asociados, incluyendo la carga por parte de estudiantes con consentimiento, y la gestión por parte del personal de inclusión.

## 2. Tecnologías y Frameworks

*   **Backend:** NestJS, TypeScript
*   **Base de Datos:** MongoDB (con Mongoose)
*   **Manejo de Archivos:** Multer
*   **Autenticación:** JWT, Passport.js

## 3. Fases de Desarrollo y Progreso

### Fase 0: Autenticación y Gestión de Usuarios (INC-13) - PRIORIDAD ALTA
*   **Meta:** Implementar un sistema de autenticación basado en JWT y gestión de usuarios con roles básicos (administrador, personal, estudiante, docente).
*   **Módulos Afectados:** `src/auth/` (nuevo), `src/users/` (nuevo).
*   **Estimación IA:** 25-35 iteraciones/bloques.
*   **Progreso:**
    *   [x] **Definir Esquema `User` (`src/users/schemas/user.schema.ts`)**
        *   Campos: `email` (único), `password` (hash), `roles` (array de strings/enum), `nombreCompleto`, `isActive`.
    *   [x] **Crear DTOs para Usuarios (`CreateUserDto`, `UpdateUserDto`) y Auth (`LoginDto`).**
    *   [x] **Implementar `UsersService` (`src/users/users.service.ts`)**
        *   CRUD para usuarios (accesible por administradores).
        *   Método para encontrar usuario por email (para login).
    *   [x] **Implementar `AuthService` (`src/auth/auth.service.ts`)**
        *   Métodos: `validateUser(email, password)`, `login(user)`, `register(createUserDto)` (si aplica).
        *   Generación y validación de JWT.
    *   [x] **Definir Endpoints en `UsersController` y `AuthController`.**
        *   `POST /auth/login`
        *   `POST /users/register` (o `POST /auth/register`)
        *   CRUD para `/users` (protegido para administradores).
    *   [x] **Implementar Estrategias de Passport (`JwtStrategy`, `LocalStrategy`).**
    *   [x] **Crear Guards (`JwtAuthGuard`, `RolesGuard`).**
    *   [x] **Integrar Guards en controladores existentes (Students, Documents, Consent).**
    *   [x] **Reemplazar placeholders de ID de usuario/estudiante con datos del usuario autenticado.**
    *   [x] **Pruebas Unitarias (Servicios, Controladores, Guards).** (Funcionalidad básica probada con script `api_test_script.js`. Pruebas unitarias formales pendientes).

### Fase 1: Gestión de Estudiantes (SCRUM-01)
*   **Meta:** Implementar el CRUD completo para la entidad `Student`.
*   **Módulos Afectados:** `src/students/`
*   **Estimación IA:** 17-25 iteraciones/bloques.
*   **Progreso:**
    *   [x] **Refinar Esquema `Student` (`src/students/schemas/student.schema.ts`)**
        *   Campos: `nombres`, `apellidos`, `rut`, `email`, `carrera`, `fechaNacimiento`, `informacionContacto`, `necesidadesEducativasEspeciales` (opcional), `createdAt`, `updatedAt`.
    *   [x] **Actualizar DTOs (`CreateStudentDto`, `UpdateStudentDto` en `src/students/dto/`)**
        *   Utilizar `class-validator` para validaciones.
    *   [x] **Implementar `StudentsService` (`src/students/students.service.ts`)**
        *   Métodos: `create`, `findAll` (con paginación/filtros básicos), `findOneById`, `update`, `remove`.
        *   Manejo de errores (ej. `NotFoundException`).
        *   Lógica de auditoría para cambios.
    *   [x] **Definir Endpoints en `StudentsController` (`src/students/students.controller.ts`)**
        *   `POST /students`, `GET /students`, `GET /students/:id`, `PATCH /students/:id`, `DELETE /students/:id`.
        *   Aplicar DTOs y validación. Autorización.
    *   [x] **Pruebas Unitarias (Servicio y Controlador).**

### Fase 2: Gestión Documental Centralizada por Personal (SCRUM-22)
*   **Meta:** Permitir al personal subir, categorizar, ver y gestionar documentos asociados a estudiantes.
*   **Módulos Afectados:** `src/documents/` (nuevo módulo).
*   **Estimación IA:** 22-32 iteraciones/bloques.
*   **Progreso:**
    *   [x] **Definir Esquema `Document` (`src/documents/schemas/document.schema.ts`)**
        *   Campos: `studentId` (ref: 'Student'), `fileNameOriginal`, `storageFileName`, `filePath`, `mimeType`, `sizeBytes`, `category` (enum), `description`, `uploadedBy` (ref: 'User'/'Personal'), `uploadDate`.
    *   [x] **Crear DTOs (`CreateDocumentDto`, `UpdateDocumentMetadataDto`)**
    *   [x] **Implementar `DocumentsService`**
        *   Lógica de subida de archivos (Multer).
        *   Métodos: `uploadForStudentByStaff`, `getDocumentsByStudentId`, `getDocumentById`, `downloadDocumentById`, `updateDocumentMetadata`, `deleteDocument`.
    *   [x] **Definir Endpoints en `DocumentsController`** (Nota: ParseFilePipe validadores comentados temporalmente)
        *   `POST /documents/upload`, `GET /documents/student/:studentId`, `GET /documents/:id/metadata`, `GET /documents/:id/download`, `PATCH /documents/:id/metadata`, `DELETE /documents/:id`.
        *   Autorización para personal.
    *   [x] **Configurar Almacenamiento de Archivos (Multer).** (Realizado dentro de DocumentsModule)
    *   [x] **Pruebas Unitarias y de Integración (carga/descarga).** (Pruebas unitarias creadas para servicio y controlador)

### Fase 3: Carga de Documentos y Consentimiento por Estudiantes (SCRUM-23)
*   **Meta:** Permitir a los estudiantes subir sus documentos y registrar su consentimiento.
*   **Módulos Afectados:** Extender `src/documents/`, crear `src/consent/` (nuevo módulo).
*   **Estimación IA:** 14-22 iteraciones/bloques.
*   **Progreso:**
    *   [x] **Extender `DocumentsService`/`Controller` para carga por estudiante.**
        *   Endpoint `POST /student/documents/upload`. Autorización para estudiante.
    *   [x] **Definir Esquema `Consent` (`src/consent/schemas/consent.schema.ts`)**
        *   Campos: `documentId` (ref: 'Document'), `studentId` (ref: 'Student'), `isConsentGiven` (Boolean), `consentDate`, `ipAddress`, `userAgent`.
    *   [x] **Crear DTO `CreateConsentDto`.**
    *   [x] **Implementar `ConsentService`.**
        *   Métodos: `giveOrUpdateConsent`, `getConsentForDocumentByStudent`.
    *   [x] **Definir Endpoints en `ConsentController`.**
        *   `POST /consents`, `GET /consents/document/:documentId`. Autorización.
    *   [x] **Pruebas Unitarias.** (Creadas para servicio y controlador)

## 4. Consideraciones Transversales

*   **Autenticación y Autorización:** Implementar `Guards` de NestJS.
*   **Manejo de Errores:** Excepciones estándar de NestJS, filtro global.
*   **Variables de Entorno (`.env`):** Usar `ConfigModule`.
*   **Seguridad:** Validación de DTOs, CORS, Helmet.
*   **Documentación de API:** Generar con `@nestjs/swagger`.
*   **Calidad de Código:** Guías de estilo, Prettier/ESLint.

## 5. Estimación Total del Esfuerzo del Sprint (Backend)

Aproximadamente **53-79 iteraciones/bloques de código principales**.

## 6. Resultado Esperado al Final del Sprint

Un conjunto de APIs funcionales y probadas para la gestión de estudiantes, documentos y consentimientos, sentando una base sólida para la aplicación.

## 7. Notas Adicionales / Decisiones de Diseño

*(Espacio para agregar notas a medida que avanza el desarrollo)*
