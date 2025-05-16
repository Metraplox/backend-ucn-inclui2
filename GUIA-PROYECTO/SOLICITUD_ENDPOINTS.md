# Solicitud de Endpoints para Documentos y Ajustes

## Introducción

Este documento detalla los endpoints necesarios para implementar completamente las funcionalidades de gestión de documentos y ajustes académicos en la aplicación "Incluye UCN". Estas APIs son fundamentales para garantizar una experiencia fluida y consistente tanto en la versión web como en la versión Android de la aplicación.

## Fecha de solicitud: 16/05/2025

---

## 1. Endpoints para Gestión de Documentos

### 1.1. Obtener documentos de un estudiante
- **Método**: GET
- **Ruta**: `/documents/student/:studentId`
- **Descripción**: Recupera todos los documentos asociados a un estudiante específico.
- **Parámetros de ruta**:
  - `studentId`: ID del estudiante
- **Respuesta esperada**:
  ```json
  [
    {
      "_id": "string",
      "fileName": "string",
      "uploadDate": "string (ISO date)",
      "type": "string (ej: 'consentimiento', 'diagnostico', 'informe')",
      "status": "string (ej: 'pendiente', 'verificado', 'rechazado')",
      "studentId": "string",
      "fileUrl": "string",
      "verifiedBy": "string (opcional)",
      "verificationDate": "string (ISO date, opcional)"
    }
  ]
  ```

### 1.2. Subir documento
- **Método**: POST
- **Ruta**: `/documents`
- **Descripción**: Permite subir un nuevo documento asociado a un estudiante.
- **Tipo de contenido**: `multipart/form-data`
- **Parámetros de formulario**:
  - `file`: Archivo a subir (PDF, DOC, DOCX, JPG, PNG)
  - `studentId`: ID del estudiante
  - `type`: Tipo de documento (consentimiento, diagnostico, informe, etc.)
  - `description`: Descripción opcional del documento
- **Respuesta esperada**:
  ```json
  {
    "_id": "string",
    "fileName": "string",
    "uploadDate": "string (ISO date)",
    "type": "string",
    "status": "pendiente",
    "studentId": "string",
    "fileUrl": "string"
  }
  ```

### 1.3. Verificar documento
- **Método**: PATCH
- **Ruta**: `/documents/verify/:documentId`
- **Descripción**: Marca un documento como verificado por un administrador o staff.
- **Parámetros de ruta**:
  - `documentId`: ID del documento
- **Cuerpo de la solicitud** (opcional):
  ```json
  {
    "comments": "string (opcional)"
  }
  ```
- **Respuesta esperada**:
  ```json
  {
    "_id": "string",
    "status": "verificado",
    "verifiedBy": "string (ID del usuario que verifica)",
    "verificationDate": "string (ISO date)",
    "comments": "string (opcional)"
  }
  ```

### 1.4. Eliminar documento
- **Método**: DELETE
- **Ruta**: `/documents/:documentId`
- **Descripción**: Elimina un documento específico.
- **Parámetros de ruta**:
  - `documentId`: ID del documento
- **Respuesta esperada**: Código 204 (No Content) o:
  ```json
  {
    "message": "Documento eliminado correctamente"
  }
  ```

### 1.5. Descargar plantilla de documento
- **Método**: GET
- **Ruta**: `/documents/templates/:templateType`
- **Descripción**: Obtiene la URL de descarga para una plantilla específica.
- **Parámetros de ruta**:
  - `templateType`: Tipo de plantilla (consentimiento, informe, etc.)
- **Respuesta esperada**:
  ```json
  {
    "url": "string",
    "fileName": "string",
    "fileType": "string"
  }
  ```

---

## 2. Endpoints para Gestión de Ajustes Académicos

### 2.1. Obtener historial de ajustes
- **Método**: GET
- **Ruta**: `/adjustments/student/:studentId`
- **Descripción**: Recupera todos los ajustes académicos asociados a un estudiante.
- **Parámetros de ruta**:
  - `studentId`: ID del estudiante
- **Parámetros de consulta** (opcionales):
  - `active`: boolean (para filtrar solo ajustes activos)
  - `courseId`: string (para filtrar por curso)
  - `semester`: string (para filtrar por semestre, ej: "2025-1")
- **Respuesta esperada**:
  ```json
  [
    {
      "_id": "string",
      "studentId": "string",
      "tipo": "string",
      "descripcion": "string",
      "curso": "string",
      "profesor": "string (opcional)",
      "fechaAprobacion": "string (ISO date)",
      "fechaInicio": "string (ISO date)",
      "fechaVencimiento": "string (ISO date)",
      "aprobadoPor": "string (ID del usuario)",
      "estado": "string (activo, vencido, cancelado)",
      "documentosAsociados": ["string (IDs de documentos)"],
      "comentarios": "string (opcional)"
    }
  ]
  ```

### 2.2. Crear nuevo ajuste
- **Método**: POST
- **Ruta**: `/adjustments`
- **Descripción**: Crea un nuevo ajuste académico para un estudiante.
- **Cuerpo de la solicitud**:
  ```json
  {
    "studentId": "string",
    "tipo": "string",
    "descripcion": "string",
    "curso": "string",
    "profesor": "string (opcional)",
    "fechaInicio": "string (ISO date)",
    "fechaVencimiento": "string (ISO date)",
    "documentosAsociados": ["string (IDs de documentos, opcional)"],
    "comentarios": "string (opcional)"
  }
  ```
- **Respuesta esperada**:
  ```json
  {
    "_id": "string",
    "studentId": "string",
    "tipo": "string",
    "descripcion": "string",
    "curso": "string",
    "profesor": "string",
    "fechaAprobacion": "string (ISO date, fecha actual)",
    "fechaInicio": "string (ISO date)",
    "fechaVencimiento": "string (ISO date)",
    "aprobadoPor": "string (ID del usuario actual)",
    "estado": "activo",
    "documentosAsociados": ["string"],
    "comentarios": "string"
  }
  ```

### 2.3. Actualizar ajuste existente
- **Método**: PUT
- **Ruta**: `/adjustments/:adjustmentId`
- **Descripción**: Actualiza un ajuste académico existente.
- **Parámetros de ruta**:
  - `adjustmentId`: ID del ajuste
- **Cuerpo de la solicitud** (campos a actualizar):
  ```json
  {
    "tipo": "string (opcional)",
    "descripcion": "string (opcional)",
    "curso": "string (opcional)",
    "profesor": "string (opcional)",
    "fechaInicio": "string (ISO date, opcional)",
    "fechaVencimiento": "string (ISO date, opcional)",
    "estado": "string (opcional: activo, vencido, cancelado)",
    "documentosAsociados": ["string (opcional)"],
    "comentarios": "string (opcional)"
  }
  ```
- **Respuesta esperada**:
  ```json
  {
    "_id": "string",
    "studentId": "string",
    "tipo": "string",
    "descripcion": "string",
    "curso": "string",
    "profesor": "string",
    "fechaAprobacion": "string (ISO date)",
    "fechaInicio": "string (ISO date)",
    "fechaVencimiento": "string (ISO date)",
    "aprobadoPor": "string",
    "estado": "string",
    "documentosAsociados": ["string"],
    "comentarios": "string",
    "ultimaModificacion": "string (ISO date, fecha actual)",
    "modificadoPor": "string (ID del usuario actual)"
  }
  ```

### 2.4. Eliminar ajuste
- **Método**: DELETE
- **Ruta**: `/adjustments/:adjustmentId`
- **Descripción**: Elimina un ajuste académico específico.
- **Parámetros de ruta**:
  - `adjustmentId`: ID del ajuste
- **Respuesta esperada**: Código 204 (No Content) o:
  ```json
  {
    "message": "Ajuste eliminado correctamente"
  }
  ```

### 2.5. Obtener categorías de ajustes
- **Método**: GET
- **Ruta**: `/adjustments/categories`
- **Descripción**: Obtiene la lista de categorías de ajustes disponibles.
- **Respuesta esperada**:
  ```json
  [
    {
      "_id": "string",
      "nombre": "string",
      "descripcion": "string",
      "requiereDocumentacion": "boolean"
    }
  ]
  ```

---

## 3. Endpoints para Integración con Cursos

### 3.1. Obtener cursos de un estudiante
- **Método**: GET
- **Ruta**: `/courses/student/:studentId`
- **Descripción**: Recupera todos los cursos en los que está inscrito un estudiante.
- **Parámetros de ruta**:
  - `studentId`: ID del estudiante
- **Parámetros de consulta** (opcionales):
  - `semester`: string (para filtrar por semestre, ej: "2025-1")
- **Respuesta esperada**:
  ```json
  [
    {
      "_id": "string",
      "codigo": "string",
      "nombre": "string",
      "nrc": "string",
      "profesor": "string",
      "semestre": "string",
      "ajustesActivos": "boolean"
    }
  ]
  ```

### 3.2. Obtener estudiantes con ajustes en un curso
- **Método**: GET
- **Ruta**: `/courses/:courseId/students-with-adjustments`
- **Descripción**: Recupera todos los estudiantes que tienen ajustes activos en un curso específico.
- **Parámetros de ruta**:
  - `courseId`: ID del curso
- **Respuesta esperada**:
  ```json
  [
    {
      "_id": "string",
      "nombres": "string",
      "apellidos": "string",
      "rut": "string",
      "email": "string",
      "ajustes": [
        {
          "_id": "string",
          "tipo": "string",
          "descripcion": "string"
        }
      ]
    }
  ]
  ```

---

## 4. Consideraciones Técnicas

### 4.1. Autenticación
Todos los endpoints deben requerir autenticación mediante token JWT en el encabezado de la solicitud:
```
Authorization: Bearer <token>
```

### 4.2. Control de Acceso
- Los endpoints de verificación de documentos solo deben ser accesibles para usuarios con rol de administrador o staff.
- Los endpoints de creación y actualización de ajustes solo deben ser accesibles para usuarios con rol de administrador o staff.
- Los estudiantes solo deben poder ver sus propios documentos y ajustes.

### 4.3. Manejo de Archivos
- Los archivos subidos deben almacenarse de forma segura y ser accesibles mediante URLs firmadas con tiempo de expiración.
- Se debe implementar validación de tipos de archivo permitidos (PDF, DOC, DOCX, JPG, PNG).
- Tamaño máximo de archivo: 10MB.

### 4.4. Respuestas de Error
Las respuestas de error deben seguir un formato consistente:
```json
{
  "error": true,
  "message": "Descripción del error",
  "code": "string (código de error)",
  "details": {} // Detalles adicionales (opcional)
}
```

---

## 5. Plazos Sugeridos

- **Análisis y diseño**: 1 semana
- **Implementación de endpoints de documentos**: 2 semanas
- **Implementación de endpoints de ajustes**: 2 semanas
- **Pruebas y ajustes**: 1 semana
- **Documentación final**: 1 semana

**Tiempo total estimado**: 7 semanas

---

## 6. Contacto para Consultas

Para cualquier aclaración o consulta adicional sobre los requisitos de estos endpoints, por favor contactar a:

- **Equipo de Desarrollo Frontend**: [correo@ucn.cl]
- **Coordinador del Proyecto**: [coordinador@ucn.cl]

---

*Este documento es una solicitud formal para el desarrollo de APIs necesarias para la aplicación "Incluye UCN". La implementación final puede requerir ajustes basados en las capacidades y restricciones técnicas del equipo de backend.*
