# Documentación API INCLUI2

Esta documentación proporciona información detallada sobre los endpoints disponibles en la API del backend de INCLUI2. Está diseñada para desarrolladores frontend que necesitan integrar sus aplicaciones con este backend.

## Información General

- **URL Base**: `http://localhost:3000` (desarrollo local) o la URL del servidor de producción
- **Autenticación**: La mayoría de los endpoints requieren autenticación JWT. El token debe enviarse en el header `Authorization` como `Bearer {token}`
- **Formato de Respuesta**: Todas las respuestas son en formato JSON
- **Documentación Swagger**: Disponible en `/api` cuando el servidor está en ejecución

## Índice

1. [Autenticación](#autenticación)
2. [Estudiantes](#estudiantes)
3. [Ajustes](#ajustes)
4. [Documentos](#documentos)
5. [Consentimientos](#consentimientos)
6. [Usuarios](#usuarios)

## Autenticación

### Login

- **URL**: `/auth/login`
- **Método**: `POST`
- **Autenticación**: No requerida
- **Descripción**: Inicia sesión de usuario y devuelve un token JWT
- **Cuerpo de la Solicitud**:
  ```json
  {
    "email": "usuario@example.com",
    "password": "contraseña"
  }
  ```
- **Respuesta Exitosa** (200):
  ```json
  {
    "access_token": "jwt_token_aqui"
  }
  ```
- **Respuestas de Error**:
  - 400: Solicitud incorrecta
  - 401: Credenciales incorrectas

### Registro

- **URL**: `/auth/register`
- **Método**: `POST`
- **Autenticación**: No requerida
- **Descripción**: Registra un nuevo usuario
- **Cuerpo de la Solicitud**:
  ```json
  {
    "email": "nuevo@example.com",
    "password": "contraseña",
    "name": "Nombre Completo",
    "role": "STUDENT" // ADMIN, STAFF, STUDENT
  }
  ```
- **Respuesta Exitosa** (201):
  ```json
  {
    "_id": "id_usuario",
    "email": "nuevo@example.com",
    "name": "Nombre Completo",
    "role": "STUDENT"
  }
  ```
- **Respuestas de Error**:
  - 400: Datos de entrada inválidos
  - 409: El usuario ya existe

## Estudiantes

### Crear Estudiante

- **URL**: `/students`
- **Método**: `POST`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Crea un nuevo registro de estudiante
- **Cuerpo de la Solicitud**: Datos del estudiante según el DTO
- **Respuesta Exitosa** (201): Objeto estudiante creado
- **Respuestas de Error**:
  - 400: Datos de entrada inválidos
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Listar Estudiantes

- **URL**: `/students`
- **Método**: `GET`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Obtiene todos los estudiantes registrados
- **Respuesta Exitosa** (200): Array de estudiantes
- **Respuestas de Error**:
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Obtener Estudiante por ID

- **URL**: `/students/:id`
- **Método**: `GET`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Obtiene información detallada de un estudiante específico
- **Parámetros de Ruta**:
  - `id`: ID único del estudiante
- **Respuesta Exitosa** (200): Objeto estudiante
- **Respuestas de Error**:
  - 404: Estudiante no encontrado
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Actualizar Estudiante

- **URL**: `/students/:id`
- **Método**: `PATCH`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Actualiza información de un estudiante existente
- **Parámetros de Ruta**:
  - `id`: ID único del estudiante
- **Cuerpo de la Solicitud**: Datos a actualizar según el DTO
- **Respuesta Exitosa** (200): Objeto estudiante actualizado
- **Respuestas de Error**:
  - 404: Estudiante no encontrado
  - 400: Datos de entrada inválidos
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Eliminar Estudiante

- **URL**: `/students/:id`
- **Método**: `DELETE`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Elimina un registro de estudiante
- **Parámetros de Ruta**:
  - `id`: ID único del estudiante
- **Respuesta Exitosa** (204): Sin contenido
- **Respuestas de Error**:
  - 404: Estudiante no encontrado
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

## Ajustes

### Crear Ajuste

- **URL**: `/adjustments`
- **Método**: `POST`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Crea un nuevo ajuste razonable para un estudiante
- **Cuerpo de la Solicitud**:
  ```json
  {
    "studentRut": "12345678-9",
    "currentAdjustments": [
      {
        "type": "tiempo_extra",
        "courseNrc": "MAT101-1",
        "approvedBy": "coordinadora@ucn.cl",
        "approvedAt": "2025-04-10T00:00:00Z",
        "requiresSemesterConfirmation": true,
        "expirationDate": "2025-12-31T00:00:00Z"
      }
    ]
  }
  ```
- **Respuesta Exitosa** (201): Objeto ajuste creado
- **Respuestas de Error**:
  - 400: Datos inválidos o faltantes
  - 409: El ajuste ya existe para este curso/estudiante

### Listar Ajustes

- **URL**: `/adjustments`
- **Método**: `GET`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Obtiene todos los ajustes razonables registrados
- **Parámetros de Consulta**:
  - `studentRut` (opcional): Filtrar por RUT de estudiante
  - `courseNrc` (opcional): Filtrar por código NRC del curso
- **Respuesta Exitosa** (200): Array de ajustes
- **Respuestas de Error**:
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Obtener Ajuste por ID

- **URL**: `/adjustments/:id`
- **Método**: `GET`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Obtiene información detallada de un ajuste específico
- **Parámetros de Ruta**:
  - `id`: ID único del ajuste
- **Respuesta Exitosa** (200): Objeto ajuste
- **Respuestas de Error**:
  - 404: Ajuste no encontrado
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Actualizar Ajuste

- **URL**: `/adjustments/:id`
- **Método**: `PATCH`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Actualiza información de un ajuste existente
- **Parámetros de Ruta**:
  - `id`: ID único del ajuste
- **Cuerpo de la Solicitud**: Datos a actualizar
- **Respuesta Exitosa** (200): Objeto ajuste actualizado
- **Respuestas de Error**:
  - 404: Ajuste no encontrado
  - 400: Datos de entrada inválidos
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Eliminar Ajuste

- **URL**: `/adjustments/:id`
- **Método**: `DELETE`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Elimina un ajuste razonable
- **Parámetros de Ruta**:
  - `id`: ID único del ajuste
- **Respuesta Exitosa** (204): Sin contenido
- **Respuestas de Error**:
  - 404: Ajuste no encontrado
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

## Documentos

### Subir Documento (Admin/Staff)

- **URL**: `/documents/upload`
- **Método**: `POST`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Sube un nuevo documento para un estudiante
- **Cuerpo de la Solicitud**: `multipart/form-data`
  - `file`: Archivo a subir
  - `studentId`: ID del estudiante
  - `category`: Categoría del documento
  - `description`: Descripción (opcional)
- **Respuesta Exitosa** (201): Metadatos del documento subido
- **Respuestas de Error**:
  - 400: Datos inválidos o archivo faltante/incorrecto
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Subir Documento (Estudiante)

- **URL**: `/documents/student/upload`
- **Método**: `POST`
- **Autenticación**: Requerida (STUDENT)
- **Descripción**: Permite a un estudiante subir su propio documento
- **Cuerpo de la Solicitud**: `multipart/form-data`
  - `file`: Archivo a subir
  - `studentId`: ID del estudiante (debe coincidir con el autenticado)
  - `category`: Categoría del documento
  - `description`: Descripción (opcional)
- **Respuesta Exitosa** (201): Metadatos del documento subido
- **Respuestas de Error**:
  - 400: Datos inválidos o archivo faltante/incorrecto
  - 401: No autorizado
  - 403: Prohibido (rol no permitido o ID de estudiante no coincide)

### Obtener Documentos de un Estudiante

- **URL**: `/documents/student/:studentId`
- **Método**: `GET`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Obtiene todos los documentos de un estudiante específico
- **Parámetros de Ruta**:
  - `studentId`: ID del estudiante
- **Respuesta Exitosa** (200): Array de documentos
- **Respuestas de Error**:
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Obtener Metadatos de un Documento

- **URL**: `/documents/:documentId/metadata`
- **Método**: `GET`
- **Autenticación**: Requerida (ADMIN, STAFF, STUDENT)
- **Descripción**: Obtiene metadatos de un documento específico
- **Parámetros de Ruta**:
  - `documentId`: ID del documento
- **Respuesta Exitosa** (200): Metadatos del documento
- **Respuestas de Error**:
  - 404: Documento no encontrado
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Descargar Documento

- **URL**: `/documents/:documentId/download`
- **Método**: `GET`
- **Autenticación**: Requerida (ADMIN, STAFF, STUDENT)
- **Descripción**: Descarga un documento específico
- **Parámetros de Ruta**:
  - `documentId`: ID del documento
- **Respuesta Exitosa** (200): Archivo para descargar
- **Respuestas de Error**:
  - 404: Documento no encontrado
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Actualizar Metadatos de un Documento

- **URL**: `/documents/:documentId/metadata`
- **Método**: `PATCH`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Actualiza metadatos de un documento existente
- **Parámetros de Ruta**:
  - `documentId`: ID del documento
- **Cuerpo de la Solicitud**: Datos a actualizar
- **Respuesta Exitosa** (200): Metadatos actualizados
- **Respuestas de Error**:
  - 404: Documento no encontrado
  - 400: Datos de entrada inválidos
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Eliminar Documento

- **URL**: `/documents/:documentId`
- **Método**: `DELETE`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Elimina un documento
- **Parámetros de Ruta**:
  - `documentId`: ID del documento
- **Respuesta Exitosa** (204): Sin contenido
- **Respuestas de Error**:
  - 404: Documento no encontrado
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

## Consentimientos

### Crear Consentimiento

- **URL**: `/consent`
- **Método**: `POST`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Crea un nuevo registro de consentimiento para un estudiante
- **Cuerpo de la Solicitud**: Datos del consentimiento según el DTO
- **Respuesta Exitosa** (201): Objeto consentimiento creado
- **Respuestas de Error**:
  - 400: Datos de entrada inválidos
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Listar Consentimientos

- **URL**: `/consent`
- **Método**: `GET`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Obtiene todos los consentimientos registrados
- **Respuesta Exitosa** (200): Array de consentimientos
- **Respuestas de Error**:
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Obtener Consentimiento por ID

- **URL**: `/consent/:id`
- **Método**: `GET`
- **Autenticación**: Requerida (ADMIN, STAFF, STUDENT)
- **Descripción**: Obtiene información detallada de un consentimiento específico
- **Parámetros de Ruta**:
  - `id`: ID único del consentimiento
- **Respuesta Exitosa** (200): Objeto consentimiento
- **Respuestas de Error**:
  - 404: Consentimiento no encontrado
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Actualizar Consentimiento

- **URL**: `/consent/:id`
- **Método**: `PATCH`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Actualiza información de un consentimiento existente
- **Parámetros de Ruta**:
  - `id`: ID único del consentimiento
- **Cuerpo de la Solicitud**: Datos a actualizar según el DTO
- **Respuesta Exitosa** (200): Objeto consentimiento actualizado
- **Respuestas de Error**:
  - 404: Consentimiento no encontrado
  - 400: Datos de entrada inválidos
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Eliminar Consentimiento

- **URL**: `/consent/:id`
- **Método**: `DELETE`
- **Autenticación**: Requerida (ADMIN, STAFF)
- **Descripción**: Elimina un registro de consentimiento
- **Parámetros de Ruta**:
  - `id`: ID único del consentimiento
- **Respuesta Exitosa** (204): Sin contenido
- **Respuestas de Error**:
  - 404: Consentimiento no encontrado
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

## Usuarios

### Crear Usuario

- **URL**: `/users`
- **Método**: `POST`
- **Autenticación**: Requerida (ADMIN)
- **Descripción**: Crea un nuevo usuario
- **Cuerpo de la Solicitud**: Datos del usuario según el DTO
- **Respuesta Exitosa** (201): Objeto usuario creado
- **Respuestas de Error**:
  - 400: Datos de entrada inválidos
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Listar Usuarios

- **URL**: `/users`
- **Método**: `GET`
- **Autenticación**: Requerida (ADMIN)
- **Descripción**: Obtiene todos los usuarios registrados
- **Respuesta Exitosa** (200): Array de usuarios
- **Respuestas de Error**:
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Obtener Usuario por ID

- **URL**: `/users/:id`
- **Método**: `GET`
- **Autenticación**: Requerida (ADMIN, o el propio usuario)
- **Descripción**: Obtiene información detallada de un usuario específico
- **Parámetros de Ruta**:
  - `id`: ID único del usuario
- **Respuesta Exitosa** (200): Objeto usuario
- **Respuestas de Error**:
  - 404: Usuario no encontrado
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Actualizar Usuario

- **URL**: `/users/:id`
- **Método**: `PATCH`
- **Autenticación**: Requerida (ADMIN, o el propio usuario)
- **Descripción**: Actualiza información de un usuario existente
- **Parámetros de Ruta**:
  - `id`: ID único del usuario
- **Cuerpo de la Solicitud**: Datos a actualizar según el DTO
- **Respuesta Exitosa** (200): Objeto usuario actualizado
- **Respuestas de Error**:
  - 404: Usuario no encontrado
  - 400: Datos de entrada inválidos
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)

### Eliminar Usuario

- **URL**: `/users/:id`
- **Método**: `DELETE`
- **Autenticación**: Requerida (ADMIN)
- **Descripción**: Elimina un registro de usuario
- **Parámetros de Ruta**:
  - `id`: ID único del usuario
- **Respuesta Exitosa** (204): Sin contenido
- **Respuestas de Error**:
  - 404: Usuario no encontrado
  - 401: No autorizado
  - 403: Prohibido (rol no permitido)
