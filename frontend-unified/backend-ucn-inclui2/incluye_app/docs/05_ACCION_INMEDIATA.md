Última actualización: 07/07/2025

# 🎯 PLAN DE ACCIÓN INMEDIATA - FASE 1

## 📋 Prioridades de Implementación (Orden de Ejecución)

### 🔥 CRÍTICO - Servicios Backend Faltantes

#### 1. AdjustmentService - Completar métodos críticos
```typescript
// Ubicación: src/modules/adjustments/services/adjustment.service.ts
- createAdjustment(): Formulario de solicitud de ajustes
- submitGrades(): Envío de calificaciones por docentes
- updateStatus(): Cambios de estado con notificaciones
- getAdjustmentsByStudent(): Historial filtrado
```

#### 2. DocumentService - Generación y descarga
```typescript
// Ubicación: src/modules/documents/services/document.service.ts
- getTemplate(): Plantillas de documentos
- generatePDF(): Generación dinámica de constancias
- downloadDocument(): Descarga segura con autenticación
```

#### 3. NotificationService - Sistema completo
```typescript
// Ubicación: src/modules/notifications/services/notification.service.ts
- sendNotification(): Envío push/email
- markAsRead(): Gestión de estados
- getNotificationsByUser(): Feed personalizado
```

---

### 🎨 FRONTEND - Implementaciones Prioritarias

#### 1. Estudiante - Solicitar Ajuste
```dart
// Ubicación: lib/screens/estudiante/request_adjustment_screen.dart
- Formulario con validaciones
- Integración con AdjustmentService.createAdjustment()
- Estados de carga y confirmación
```

#### 2. Docente - Enviar Calificaciones
```dart
// Ubicación: lib/screens/docente/grades_submission_screen.dart
- Interface de calificaciones
- Integración con AdjustmentService.submitGrades()
- Validaciones de negocio
```

#### 3. Descarga de Documentos (Universal)
```dart
// Ubicación: lib/services/document_service.dart
- Implementar downloadTemplate() y métodos relacionados
- Integración con backend DocumentService
- Manejo de archivos y permisos
```

---

### 🔧 IMPLEMENTACIÓN TÉCNICA DETALLADA

#### Backend - AdjustmentService.createAdjustment()
```typescript
async createAdjustment(createAdjustmentDto: CreateAdjustmentDto): Promise<Adjustment> {
  // 1. Validar datos de entrada
  // 2. Verificar permisos del estudiante
  // 3. Crear ajuste con estado PENDIENTE
  // 4. Notificar a docentes y jefatura
  // 5. Retornar ajuste creado con ID
}
```

#### Frontend - Formulario Solicitar Ajuste
```dart
class RequestAdjustmentScreen extends StatefulWidget {
  // 1. Formulario con campos: tipo, descripción, justificación
  // 2. Validaciones en tiempo real
  // 3. Subida de documentos de apoyo
  // 4. Integración con AdjustmentService
  // 5. Navegación a confirmación
}
```

---

### 📊 MÉTRICAS DE PROGRESO

#### Fase 1A - Servicios Backend (70% del impacto)
- [ ] AdjustmentService.createAdjustment() - 25%
- [ ] AdjustmentService.submitGrades() - 20%
- [ ] DocumentService.getTemplate() - 15%
- [ ] NotificationService.sendNotification() - 10%

#### Fase 1B - Frontend Crítico (30% del impacto)
- [ ] Formulario Solicitar Ajuste - 15%
- [ ] Interface Enviar Calificaciones - 10%
- [ ] Descarga de Documentos - 5%

---

### 🚀 ORDEN DE EJECUCIÓN RECOMENDADO

1. **Backend AdjustmentService.createAdjustment()** → Habilita solicitudes
2. **Frontend RequestAdjustmentScreen** → Interface para estudiantes
3. **Backend AdjustmentService.submitGrades()** → Habilita calificaciones
4. **Frontend GradesSubmissionScreen** → Interface para docentes
5. **Backend DocumentService.getTemplate()** → Habilita descargas
6. **Frontend Document Download** → Funcionalidad universal

---

### 💡 MEJORES PRÁCTICAS A APLICAR

#### Arquitectura
- **Repository Pattern**: Separar lógica de datos
- **DTO Validation**: Validaciones robustas con class-validator
- **Error Handling**: Gestión consistente de errores
- **Async/Await**: Manejo apropiado de operaciones asíncronas

#### Frontend
- **State Management**: Provider/Riverpod para estado global
- **Error Boundaries**: Captura y manejo de errores
- **Loading States**: UX responsive durante operaciones
- **Form Validation**: Validaciones en tiempo real

#### Testing
- **Unit Tests**: Cada servicio con >90% cobertura
- **Integration Tests**: Flujos completos E2E
- **Mock Services**: Testing aislado con datos controlados

---

### 🔍 VALIDACIÓN DE COMPLETITUD

#### Criterios de Aceptación - AdjustmentService.createAdjustment()
- [ ] Acepta CreateAdjustmentDto válido
- [ ] Valida permisos del estudiante
- [ ] Crea registro en base de datos
- [ ] Envía notificaciones automáticas
- [ ] Retorna ajuste con ID generado
- [ ] Maneja errores apropiadamente
- [ ] Tests unitarios pasando

#### Criterios de Aceptación - Frontend RequestAdjustmentScreen
- [ ] Formulario con validaciones
- [ ] Integración con backend funcional
- [ ] Estados de carga implementados
- [ ] Manejo de errores con mensajes claros
- [ ] Navegación post-envío funcional
- [ ] Responsive design
- [ ] Tests de widget pasando

---

> **Próximo Paso**: Iniciar con la implementación de `AdjustmentService.createAdjustment()` en el backend, seguido inmediatamente por la pantalla de solicitud en el frontend.
