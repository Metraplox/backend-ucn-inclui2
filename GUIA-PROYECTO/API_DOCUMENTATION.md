# Documentación API INCLUI2

Esta documentación proporciona información detallada sobre los endpoints disponibles en la API del backend de INCLUI2. Está diseñada para desarrolladores frontend que necesitan integrar sus aplicaciones con este backend.

## Información General

- **URL Base**: `http://localhost:3000` (desarrollo local) o la URL del servidor de producción
- **Autenticación**: La mayoría de los endpoints requieren autenticación JWT. El token debe enviarse en el header `Authorization` como `Bearer {token}`
- **Formato de Respuesta**: Todas las respuestas son en formato JSON
- **Documentación Swagger**: Disponible en `/api` cuando el servidor está en ejecución

## Endpoints

### Autenticación

#### Iniciar sesión

```
POST /auth/login
```

**Cuerpo de la solicitud**:
```json
{
  "email": "usuario@example.com",
  "password": "contraseña"
}
```

**Respuesta exitosa (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "usuario@example.com",
    "roles": ["STUDENT"],
    "name": "Nombre Usuario"
  }
}
```

### Documentos

#### Subir documento (Staff)

```
POST /documents/upload
```

**Headers**:
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Cuerpo de la solicitud**:
- `file`: Archivo a subir (PDF, DOC, DOCX, etc.)
- `studentId`: ID del estudiante
- `documentType`: Tipo de documento
- `description`: Descripción del documento
- `category`: Categoría del documento

**Respuesta exitosa (201 Created)**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "studentId": "507f1f77bcf86cd799439022",
  "documentType": "informe_medico",
  "description": "Informe médico del estudiante",
  "category": "MEDICO",
  "fileNameOriginal": "informe.pdf",
  "fileUrl": "http://localhost:3000/documents/abc123/download",
  "uploadDate": "2025-05-15T12:00:00Z",
  "status": "PENDIENTE"
}
```

#### Subir documento (Estudiante)

```
POST /documents/student/upload
```

**Headers**:
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Cuerpo de la solicitud**:
- `file`: Archivo a subir (PDF, DOC, DOCX, etc.)
- `studentId`: ID del estudiante (debe coincidir con el ID del estudiante autenticado)
- `documentType`: Tipo de documento
- `description`: Descripción del documento
- `category`: Categoría del documento

**Respuesta exitosa (201 Created)**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "studentId": "507f1f77bcf86cd799439022",
  "documentType": "informe_medico",
  "description": "Informe médico del estudiante",
  "category": "MEDICO",
  "fileNameOriginal": "informe.pdf",
  "fileUrl": "http://localhost:3000/documents/abc123/download",
  "uploadDate": "2025-05-15T12:00:00Z",
  "status": "PENDIENTE"
}
```

#### Obtener documentos de un estudiante

```
GET /documents/student/{studentId}
```

**Headers**:
- `Authorization: Bearer {token}`

**Respuesta exitosa (200 OK)**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "studentId": "507f1f77bcf86cd799439022",
    "documentType": "informe_medico",
    "description": "Informe médico del estudiante",
    "category": "MEDICO",
    "fileNameOriginal": "informe.pdf",
    "fileUrl": "http://localhost:3000/documents/abc123/download",
    "uploadDate": "2025-05-15T12:00:00Z",
    "status": "PENDIENTE"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "studentId": "507f1f77bcf86cd799439022",
    "documentType": "certificado_discapacidad",
    "description": "Certificado de discapacidad",
    "category": "LEGAL",
    "fileNameOriginal": "certificado.pdf",
    "fileUrl": "http://localhost:3000/documents/def456/download",
    "uploadDate": "2025-05-14T10:30:00Z",
    "status": "VERIFICADO",
    "verifiedBy": "507f1f77bcf86cd799439033",
    "verificationDate": "2025-05-15T09:15:00Z"
  }
]
```

#### Descargar documento

```
GET /documents/{documentId}/download
```

**Headers**:
- `Authorization: Bearer {token}`

**Respuesta exitosa (200 OK)**:
Archivo binario con el contenido del documento

#### Verificar documento

```
PATCH /documents/verify/{documentId}
```

**Headers**:
- `Authorization: Bearer {token}`

**Cuerpo de la solicitud**:
```json
{
  "comments": "Documento verificado correctamente"
}
```

**Respuesta exitosa (200 OK)**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "studentId": "507f1f77bcf86cd799439022",
  "documentType": "informe_medico",
  "description": "Informe médico del estudiante",
  "category": "MEDICO",
  "fileNameOriginal": "informe.pdf",
  "fileUrl": "http://localhost:3000/documents/abc123/download",
  "uploadDate": "2025-05-15T12:00:00Z",
  "status": "VERIFICADO",
  "verifiedBy": "507f1f77bcf86cd799439033",
  "verificationDate": "2025-05-16T09:15:00Z",
  "comments": "Documento verificado correctamente"
}
```

#### Rechazar documento

```
PATCH /documents/reject/{documentId}
```

**Headers**:
- `Authorization: Bearer {token}`

**Cuerpo de la solicitud**:
```json
{
  "comments": "Documento rechazado por falta de información"
}
```

**Respuesta exitosa (200 OK)**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "studentId": "507f1f77bcf86cd799439022",
  "documentType": "informe_medico",
  "description": "Informe médico del estudiante",
  "category": "MEDICO",
  "fileNameOriginal": "informe.pdf",
  "fileUrl": "http://localhost:3000/documents/abc123/download",
  "uploadDate": "2025-05-15T12:00:00Z",
  "status": "RECHAZADO",
  "verifiedBy": "507f1f77bcf86cd799439033",
  "verificationDate": "2025-05-16T09:15:00Z",
  "comments": "Documento rechazado por falta de información"
}
```

#### Obtener URL de plantilla

```
GET /documents/templates/{templateType}
```

**Respuesta exitosa (200 OK)**:
```json
{
  "url": "http://localhost:3000/documents/templates/download/plantilla_consentimiento.docx",
  "fileName": "plantilla_consentimiento.docx",
  "fileType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}
```

#### Descargar plantilla

```
GET /documents/templates/download/{fileName}
```

**Respuesta exitosa (200 OK)**:
Archivo binario con el contenido de la plantilla

### Ajustes Académicos

#### Crear ajuste

```
POST /adjustments
```

**Headers**:
- `Authorization: Bearer {token}`

**Cuerpo de la solicitud**:
```json
{
  "studentRut": "12345678-9",
  "currentAdjustments": [{
    "type": "tiempo_extra",
    "courseNrc": "MAT101-1",
    "approvedBy": "coordinadora@ucn.cl",
    "approvedAt": "2025-04-10T00:00:00Z",
    "requiresSemesterConfirmation": true,
    "expirationDate": "2025-12-31T00:00:00Z"
  }]
}
```

**Respuesta exitosa (201 Created)**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "studentRut": "12345678-9",
  "studentId": "507f1f77bcf86cd799439022",
  "currentAdjustments": [{
    "_id": "507f1f77bcf86cd799439033",
    "type": "tiempo_extra",
    "courseNrc": "MAT101-1",
    "courseId": "507f1f77bcf86cd799439044",
    "approvedBy": "coordinadora@ucn.cl",
    "approvedAt": "2025-04-10T00:00:00Z",
    "requiresSemesterConfirmation": true,
    "expirationDate": "2025-12-31T00:00:00Z",
    "estado": "ACTIVO",
    "comentarios": ""
  }],
  "adjustmentHistory": [],
  "createdAt": "2025-05-16T09:15:00Z",
  "updatedAt": "2025-05-16T09:15:00Z"
}
```

#### Obtener ajustes por estudiante

```
GET /adjustments/student/{studentId}
```

**Headers**:
- `Authorization: Bearer {token}`

**Parámetros de consulta**:
- `status`: Estado de los ajustes (opcional)

**Respuesta exitosa (200 OK)**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "studentRut": "12345678-9",
    "studentId": "507f1f77bcf86cd799439022",
    "currentAdjustments": [{
      "_id": "507f1f77bcf86cd799439033",
      "type": "tiempo_extra",
      "courseNrc": "MAT101-1",
      "courseId": "507f1f77bcf86cd799439044",
      "approvedBy": "coordinadora@ucn.cl",
      "approvedAt": "2025-04-10T00:00:00Z",
      "requiresSemesterConfirmation": true,
      "expirationDate": "2025-12-31T00:00:00Z",
      "estado": "ACTIVO",
      "comentarios": ""
    }],
    "adjustmentHistory": [],
    "createdAt": "2025-05-16T09:15:00Z",
    "updatedAt": "2025-05-16T09:15:00Z",
    "documentosAsociados": ["507f1f77bcf86cd799439055"]
  }
]
```

#### Obtener ajustes por curso

```
GET /adjustments/course/{courseId}
```

**Headers**:
- `Authorization: Bearer {token}`

**Respuesta exitosa (200 OK)**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "studentRut": "12345678-9",
    "studentId": "507f1f77bcf86cd799439022",
    "currentAdjustments": [{
      "_id": "507f1f77bcf86cd799439033",
      "type": "tiempo_extra",
      "courseNrc": "MAT101-1",
      "courseId": "507f1f77bcf86cd799439044",
      "approvedBy": "coordinadora@ucn.cl",
      "approvedAt": "2025-04-10T00:00:00Z",
      "requiresSemesterConfirmation": true,
      "expirationDate": "2025-12-31T00:00:00Z",
      "estado": "ACTIVO",
      "comentarios": ""
    }],
    "adjustmentHistory": [],
    "createdAt": "2025-05-16T09:15:00Z",
    "updatedAt": "2025-05-16T09:15:00Z"
  }
]
```

#### Asociar documento a ajuste

```
PATCH /adjustments/{id}/associate-document/{documentId}
```

**Headers**:
- `Authorization: Bearer {token}`

**Respuesta exitosa (200 OK)**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "studentRut": "12345678-9",
  "studentId": "507f1f77bcf86cd799439022",
  "currentAdjustments": [{
    "_id": "507f1f77bcf86cd799439033",
    "type": "tiempo_extra",
    "courseNrc": "MAT101-1",
    "courseId": "507f1f77bcf86cd799439044",
    "approvedBy": "coordinadora@ucn.cl",
    "approvedAt": "2025-04-10T00:00:00Z",
    "requiresSemesterConfirmation": true,
    "expirationDate": "2025-12-31T00:00:00Z",
    "estado": "ACTIVO",
    "comentarios": ""
  }],
  "adjustmentHistory": [],
  "createdAt": "2025-05-16T09:15:00Z",
  "updatedAt": "2025-05-16T09:15:00Z",
  "documentosAsociados": ["507f1f77bcf86cd799439055"]
}
```

#### Actualizar estado de ajuste

```
PATCH /adjustments/{id}/status/{status}
```

**Headers**:
- `Authorization: Bearer {token}`

**Respuesta exitosa (200 OK)**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "studentRut": "12345678-9",
  "studentId": "507f1f77bcf86cd799439022",
  "currentAdjustments": [{
    "_id": "507f1f77bcf86cd799439033",
    "type": "tiempo_extra",
    "courseNrc": "MAT101-1",
    "courseId": "507f1f77bcf86cd799439044",
    "approvedBy": "coordinadora@ucn.cl",
    "approvedAt": "2025-04-10T00:00:00Z",
    "requiresSemesterConfirmation": true,
    "expirationDate": "2025-12-31T00:00:00Z",
    "estado": "INACTIVO",
    "comentarios": ""
  }],
  "adjustmentHistory": [],
  "createdAt": "2025-05-16T09:15:00Z",
  "updatedAt": "2025-05-16T09:15:00Z",
  "estado": "INACTIVO",
  "ultimaActualizacion": "2025-05-16T10:30:00Z",
  "actualizadoPor": "507f1f77bcf86cd799439066"
}
```

### Cursos

#### Crear curso

```
POST /courses
```

**Headers**:
- `Authorization: Bearer {token}`

**Cuerpo de la solicitud**:
```json
{
  "nombre": "Cálculo I",
  "codigo": "MAT101",
  "nrc": "MAT101-1",
  "semestre": "2025-1",
  "profesor": "Juan Pérez",
  "descripcion": "Curso de cálculo diferencial e integral"
}
```

**Respuesta exitosa (201 Created)**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "nombre": "Cálculo I",
  "codigo": "MAT101",
  "nrc": "MAT101-1",
  "semestre": "2025-1",
  "profesor": "Juan Pérez",
  "descripcion": "Curso de cálculo diferencial e integral",
  "estudiantes": [],
  "createdAt": "2025-05-16T09:15:00Z",
  "updatedAt": "2025-05-16T09:15:00Z"
}
```

#### Obtener todos los cursos

```
GET /courses
```

**Headers**:
- `Authorization: Bearer {token}`

**Parámetros de consulta**:
- `semester`: Semestre (ej: 2025-1) (opcional)

**Respuesta exitosa (200 OK)**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Cálculo I",
    "codigo": "MAT101",
    "nrc": "MAT101-1",
    "semestre": "2025-1",
    "profesor": "Juan Pérez",
    "descripcion": "Curso de cálculo diferencial e integral",
    "estudiantes": ["507f1f77bcf86cd799439022", "507f1f77bcf86cd799439023"],
    "createdAt": "2025-05-16T09:15:00Z",
    "updatedAt": "2025-05-16T09:15:00Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "nombre": "Física I",
    "codigo": "FIS101",
    "nrc": "FIS101-1",
    "semestre": "2025-1",
    "profesor": "María González",
    "descripcion": "Curso de física mecánica",
    "estudiantes": ["507f1f77bcf86cd799439022"],
    "createdAt": "2025-05-16T09:20:00Z",
    "updatedAt": "2025-05-16T09:20:00Z"
  }
]
```

#### Obtener cursos de un estudiante

```
GET /courses/student/{studentId}
```

**Headers**:
- `Authorization: Bearer {token}`

**Parámetros de consulta**:
- `semester`: Semestre (ej: 2025-1) (opcional)

**Respuesta exitosa (200 OK)**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Cálculo I",
    "codigo": "MAT101",
    "nrc": "MAT101-1",
    "semestre": "2025-1",
    "profesor": "Juan Pérez",
    "descripcion": "Curso de cálculo diferencial e integral",
    "estudiantes": ["507f1f77bcf86cd799439022", "507f1f77bcf86cd799439023"],
    "createdAt": "2025-05-16T09:15:00Z",
    "updatedAt": "2025-05-16T09:15:00Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "nombre": "Física I",
    "codigo": "FIS101",
    "nrc": "FIS101-1",
    "semestre": "2025-1",
    "profesor": "María González",
    "descripcion": "Curso de física mecánica",
    "estudiantes": ["507f1f77bcf86cd799439022"],
    "createdAt": "2025-05-16T09:20:00Z",
    "updatedAt": "2025-05-16T09:20:00Z"
  }
]
```

#### Obtener estudiantes con ajustes en un curso

```
GET /courses/{courseId}/students-with-adjustments
```

**Headers**:
- `Authorization: Bearer {token}`

**Respuesta exitosa (200 OK)**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439022",
    "nombres": "Juan Carlos",
    "apellidos": "Pérez",
    "rut": "12345678-9",
    "email": "juan.perez@alumnos.ucn.cl",
    "ajustes": [
      {
        "_id": "507f1f77bcf86cd799439033",
        "tipo": "tiempo_extra",
        "descripcion": "30 minutos adicionales en evaluaciones"
      },
      {
        "_id": "507f1f77bcf86cd799439034",
        "tipo": "material_adaptado",
        "descripcion": "Material en formato digital accesible"
      }
    ]
  },
  {
    "_id": "507f1f77bcf86cd799439023",
    "nombres": "María José",
    "apellidos": "González",
    "rut": "98765432-1",
    "email": "maria.gonzalez@alumnos.ucn.cl",
    "ajustes": [
      {
        "_id": "507f1f77bcf86cd799439035",
        "tipo": "ubicacion_preferente",
        "descripcion": "Ubicación en primera fila"
      }
    ]
  }
]
```

## Códigos de Estado

- `200 OK`: La solicitud se ha completado correctamente
- `201 Created`: El recurso se ha creado correctamente
- `204 No Content`: La solicitud se ha completado correctamente pero no hay contenido para devolver
- `400 Bad Request`: La solicitud contiene datos inválidos o faltantes
- `401 Unauthorized`: No se ha proporcionado un token válido
- `403 Forbidden`: El token es válido pero el usuario no tiene permisos para acceder al recurso
- `404 Not Found`: El recurso solicitado no existe
- `409 Conflict`: La solicitud no puede ser completada debido a un conflicto con el estado actual del recurso
- `500 Internal Server Error`: Error interno del servidor

## Roles y Permisos

- **ADMIN**: Acceso completo a todos los endpoints
- **STAFF**: Acceso a la mayoría de los endpoints excepto aquellos reservados para administradores
- **STUDENT**: Acceso limitado a endpoints relacionados con su propia información

## Notas Adicionales

- Los campos de fecha se devuelven en formato ISO 8601 (UTC)
- Los IDs de MongoDB son strings de 24 caracteres hexadecimales
- Para pruebas, se recomienda usar Postman o una herramienta similar
- La documentación completa de la API está disponible en Swagger en la ruta `/api` cuando el servidor está en ejecución- **Documentación Swagger**: Disponible en `/api` cuando el servidor está en ejecución

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
