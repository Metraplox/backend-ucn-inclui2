# Plan de Desarrollo del Sprint - Backend Inclusión UCN

## 1. Objetivo General del Sprint (Backend)

Establecer un sistema funcional para la gestión de información de estudiantes y sus documentos asociados, incluyendo la carga por parte de estudiantes con consentimiento, y la gestión por parte del personal de inclusión.

## 2. Tecnologías y Frameworks

*   **Backend:** NestJS, TypeScript
*   **Base de Datos:** MongoDB (con Mongoose)
*   **Manejo de Archivos:** Multer

## 3. Fases de Desarrollo y Progreso

### Fase 1: Gestión de Estudiantes (SCRUM-19)
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
