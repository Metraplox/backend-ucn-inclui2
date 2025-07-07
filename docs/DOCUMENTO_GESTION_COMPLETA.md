# Gestión de Documentos - Implementación Completa

## Resumen de Cambios

Se ha completado la integración de la gestión de documentos en el sistema UCN INCLUI2, permitiendo que:

- Los estudiantes puedan subir y descargar sus propios documentos
- Coordinadora y educadora puedan subir documentos a cualquier estudiante
- En la vista de búsqueda/lista de estudiantes, se pueda subir y ver documentos de cada estudiante
- Todo el flujo de subida, descarga y visualización de documentos funcione correctamente y esté alineado con el backend

## Cambios Implementados

### 1. Actualización del DocumentService Frontend

**Archivo**: `incluye_app/lib/services/document_consent_service.dart`

#### Nuevos Métodos Agregados:

- `uploadDocumentByStaff()`: Para que staff suba documentos a estudiantes específicos
- `uploadDocumentByStudent()`: Para que estudiantes suban sus propios documentos
- `uploadDocument()`: Método genérico que detecta automáticamente el rol
- `getDocumentCategories()`: Lista de categorías disponibles
- `getCategoryName()`: Nombres amigables para categorías
- `getAllowedExtensions()`: Extensiones de archivo permitidas
- `isAllowedExtension()`: Validación de extensiones
- `getMaxFileSize()`: Tamaño máximo de archivo (10 MB)
- `isValidFileSize()`: Validación de tamaño
- `getDocumentDisplayInfo()`: Información formateada para mostrar en UI

#### Tipos de Documentos Soportados:

- CERTIFICADO_MEDICO
- INFORME_PSICOEDUCATIVO
- CERTIFICADO_DISCAPACIDAD
- INFORME_MEDICO_ESPECIALISTA
- EVALUACION_DIFERENCIAL
- PLAN_EDUCATIVO_INDIVIDUALIZADO
- EVALUACION_PSICOPEDAGOGICA
- INFORME_FONOAUDIOLOGICO
- OTRO_DOCUMENTO

#### Categorías de Documentos:

- MEDICO
- PSICOEDUCATIVO
- LEGAL
- ACADEMICO
- TERAPEUTICO
- ADMINISTRATIVO
- OTRO

### 2. Mejoras en la Pantalla de Gestión de Documentos

**Archivo**: `incluye_app/lib/screens/documents/document_consent_screen.dart`

#### Funcionalidades Mejoradas:

- **Validación de archivos**: Verificación de tamaño y extensión antes de subir
- **Selección de detalles**: Dialog mejorado para seleccionar tipo, categoría y descripción
- **Visualización mejorada**: Cards de documentos con más información (categoría, uploader, etc.)
- **Descarga con indicador**: Muestra progreso durante la descarga
- **Manejo de errores mejorado**: Mensajes más descriptivos
- **Iconos específicos**: Iconos únicos para cada tipo de documento

### 3. Integración en Lista de Estudiantes

**Archivo**: `incluye_app/lib/screens/students/student_list_screen.dart`

#### Nuevas Funcionalidades:

- **Botón de subida rápida**: Permite subir documentos directamente desde la lista
- **Indicador de documentos**: Muestra si el estudiante tiene documentos y cuántos
- **Navegación mejorada**: Acceso directo a la gestión completa de documentos

### 4. Widget de Subida Rápida

**Archivo**: `incluye_app/lib/widgets/quick_document_upload_dialog.dart`

#### Características:

- **Dialog modal**: Para subida rápida de documentos desde cualquier lugar
- **Validación en tiempo real**: Verificaciones antes de permitir la subida
- **Formulario completo**: Tipo, categoría, descripción y archivo
- **Feedback visual**: Indicadores de carga y estado
- **Guía de formatos**: Información sobre tipos de archivo permitidos

## Endpoints Backend Utilizados

### Gestión de Documentos

1. **`GET /documents/student/:studentId`**
   - Obtener todos los documentos de un estudiante
   - Accesible por: Staff, Estudiante (solo sus documentos)

2. **`POST /documents/upload`**
   - Subir documento por parte del staff a un estudiante
   - Requiere: studentId, documentType, archivo
   - Opcionales: description, category

3. **`POST /documents/student/upload`**
   - Subir documento por parte del estudiante
   - Requiere: documentType, archivo
   - Opcionales: description, category

4. **`GET /documents/:documentId/download`**
   - Descargar documento específico
   - Retorna: archivo binario

5. **`DELETE /documents/:documentId`**
   - Eliminar documento
   - Solo el uploader o staff puede eliminar

## Almacenamiento de Documentos

### Base de Datos (MongoDB)

Los documentos se almacenan en la colección `documents` con el siguiente esquema:

```typescript
{
  _id: ObjectId,
  fileName: string,
  originalName: string,
  filePath: string,
  fileSize: number,
  mimeType: string,
  documentType: string,
  category: string,
  description?: string,
  studentId: ObjectId,
  uploaderId: ObjectId,
  uploaderName: string,
  uploaderRole: string,
  uploadDate: Date,
  isActive: boolean,
  metadata?: object
}
```

### Sistema de Archivos

Los archivos físicos se almacenan en:
- **Directorio**: `/uploads/documents/`
- **Estructura**: `{año}/{mes}/{nombreArchivoUnico}`
- **Nomenclatura**: `{timestamp}-{hash}-{nombreOriginal}`

## Validaciones Implementadas

### Frontend

1. **Extensiones permitidas**: pdf, doc, docx, jpg, jpeg, png
2. **Tamaño máximo**: 10 MB
3. **Campos requeridos**: Tipo de documento
4. **Validación de roles**: Detecta automáticamente si es staff o estudiante

### Backend

1. **Autenticación**: JWT token requerido
2. **Autorización**: Verificación de permisos por rol
3. **Validación de archivos**: Tipo MIME, tamaño, extensión
4. **Sanitización**: Nombres de archivo seguros
5. **Rate limiting**: Prevención de spam de uploads

## Flujos de Usuario

### Estudiante

1. **Ver sus documentos**: Acceso a lista personal de documentos
2. **Subir documento**: Formulario con tipo, categoría y descripción
3. **Descargar documentos**: Descarga directa de sus archivos
4. **Eliminar documentos**: Solo sus propios documentos

### Staff (Coordinadora/Educadora)

1. **Ver documentos de estudiante**: Acceso completo a documentos por estudiante
2. **Subir documentos**: Puede subir a cualquier estudiante
3. **Gestión desde lista**: Subida rápida desde la lista de estudiantes
4. **Administración completa**: Ver, descargar, eliminar documentos

## Características de Seguridad

1. **Control de acceso basado en roles**
2. **Validación de propiedad de documentos**
3. **Sanitización de nombres de archivos**
4. **Verificación de tipos MIME**
5. **Logs de actividad de documentos**
6. **Prevención de ataques de directorio traversal**

## Manejo de Errores

### Errores Comunes y Soluciones

1. **Archivo demasiado grande**: Mensaje claro con límite permitido
2. **Tipo de archivo no soportado**: Lista de extensiones válidas
3. **Falta de permisos**: Redirección a login o mensaje de autorización
4. **Error de red**: Reintentos automáticos con feedback visual
5. **Archivo no encontrado**: Manejo graceful con opciones de recuperación

## Testing y Validación

### Casos de Prueba Principales

1. **Subida exitosa**: Staff a estudiante, estudiante propio
2. **Validaciones**: Tamaño, tipo, permisos
3. **Descarga**: Verificación de integridad de archivos
4. **Eliminación**: Solo usuarios autorizados
5. **Navegación**: Flujos entre pantallas
6. **Indicadores visuales**: Estados de carga, errores, éxito

## Próximos Pasos Recomendados

1. **Testing exhaustivo**: Pruebas de integración con datos reales
2. **Optimización de rendimiento**: Lazy loading de documentos grandes
3. **Búsqueda avanzada**: Filtros por tipo, fecha, categoría
4. **Versionado**: Control de versiones de documentos
5. **Backup automático**: Sincronización con almacenamiento en la nube
6. **Notificaciones**: Alertas cuando se suben nuevos documentos
7. **Métricas**: Dashboard de estadísticas de uso

## Conclusión

La implementación completa de la gestión de documentos proporciona una solución robusta y fácil de usar que cubre todos los requerimientos establecidos. El sistema permite un flujo natural de trabajo tanto para estudiantes como para staff, con validaciones apropiadas y manejo de errores comprehensivo.
