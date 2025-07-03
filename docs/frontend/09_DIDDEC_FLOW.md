# 🚀 **DIDDEC FLOW (Flutter)**

**Fecha:** 04-07-2025  
**Sprint:** S4 – DIDDEC Screens
**Autor:** AI Assistant – Frontend Architecture Committee

---

## 1. Objetivo
Permitir al rol **DIDDEC**:
- Visualizar recursos/documentos pendientes de revisión.  
- Aprobar o rechazar documentos con comentarios.  
- Subir nuevos recursos (plantillas, informes).

## 2. Endpoints Backend

- **GET** `/documents/pending`
  - Devuelve lista de documentos pendientes con datos: `id`, `fileName`, `url`, `studentId`, `status`, `uploadedAt`.
- **PATCH** `/documents/verify/{documentId}`
  - Aprueba un documento.  
- **PATCH** `/documents/reject/{documentId}`
  - Rechaza un documento, opcionalmente con `comments`.
- **POST** `/documents/upload`
  - Sube un nuevo recurso. Parámetros: `file`, `studentId`, `documentType`, `description`, `category`.

## 3. Modelo de datos (Document)
```dart
class Document {
  final String id;
  final String fileName;
  final String url;
  final String studentId;
  final String status; // e.g. 'PENDIENTE', 'APROBADO', 'RECHAZADO'
  final DateTime uploadedAt;

  factory Document.fromJson(Map<String, dynamic> json) => Document(
    id: json['_id'] ?? json['id'],
    fileName: json['fileName'],
    url: json['url'],
    studentId: json['studentId'],
    status: json['status'],
    uploadedAt: DateTime.parse(json['uploadedAt']),
  );
}
```

## 4. Pantallas y Componentes

### 4.1 PendingListScreen
- Componente clave: `ListView<PendingCard>`  
- Lógica:
  1. Llamar a `DocumentService.getPendingDocuments()` (o filter por `status: 'PENDIENTE'`).  
  2. Mostrar estado de carga, vacía, error.  
  3. Cada `PendingCard` muestra `fileName`, `studentRut`/`studentName`, `uploadedAt` y botones `Aprobar`, `Rechazar`.
  4. Al pulsar, llamar a `DocumentService.verifyDocument(id)` o `rejectDocument(id, comments)`.

### 4.2 ResourceUploaderScreen
- Componente clave: `FilePicker`, `LinearProgressIndicator`  
- Lógica:
  1. Permitir seleccionar archivo y metadatos (tipo, descripción, categoría).  
  2. Llamar a `DocumentService.uploadDocument(...)`.  
  3. Mostrar progreso con `UploadProgress` y mensaje de éxito/error.

## 5. Navegación
- En `AppScaffold` dentro de `isDiddec`:  
  - `PendingListScreen`  
  - `ResourceUploaderScreen`

## 6. Tests sugeridos
- **Unit tests** para `DocumentService.getPendingDocuments`, `verifyDocument`, `rejectDocument`, `uploadDocument`.  
- **Widget tests** para `PendingListScreen` (mock de `DocumentService`) y flujos de aprobación/rechazo.  
- **Widget tests** para `ResourceUploaderScreen`, simulando selección y subida.

## 7. Próximos pasos
1. Implementar métodos en `DocumentService` si faltan endpoints (`getPendingDocuments`).  
2. Desarrollar `PendingCard` y `UploadProgress`.  
3. Conectar UI y servicios reales.  
4. Integrar WebSocket para notificaciones en tiempo real.  
5. Optimizar linter y cobertura de tests. 