# 📋 RESUMEN DE CAMBIOS BACKEND - SPRINT 3 COMPLETADO

## Para el equipo de Frontend Flutter

### 📅 Fecha: 23 de Mayo 2025
### 🎯 Objetivo: Documentar todos los cambios del backend para que el equipo frontend pueda implementar las nuevas funcionalidades

---

## 🆕 **NUEVAS FUNCIONALIDADES DEL BACKEND QUE DEBES IMPLEMENTAR**

### 1. **Sistema de Notificaciones Completo** 🔔

**Justificación:** *El sistema necesitaba una forma efectiva de comunicar cambios importantes a los usuarios. Las notificaciones permiten alertar a docentes sobre nuevos ajustes, a jefaturas sobre situaciones críticas, y mantener a todos informados en tiempo real.*

**Actualizar en `api_service.dart`:**
```dart
// Agregar estos métodos
static Future<List<Notification>> getNotifications({String? type, bool? isRead}) async
static Future<int> getUnreadCount() async
static Future<bool> markAsRead(String notificationId) async
static Future<bool> markAllAsRead() async
static Future<bool> deleteNotification(String notificationId) async
```

**Endpoints del backend:**
- `GET /notifications` - Obtener notificaciones del usuario
- `GET /notifications/unread-count` - Contar notificaciones no leídas
- `PATCH /notifications/:id/read` - Marcar como leída
- `PATCH /notifications/mark-all-read` - Marcar todas como leídas
- `DELETE /notifications/:id` - Eliminar notificación

**Crear modelo `notification_model.dart`:**
```dart
class Notification {
  String id;
  String userId;
  String type; // ADJUSTMENT_CREATED, ADJUSTMENT_UPDATED, HELP_REQUEST, SYSTEM
  String title;
  String message;
  String priority; // LOW, MEDIUM, HIGH, CRITICAL
  bool isRead;
  Map<String, String>? relatedEntity;
  DateTime createdAt;
  String semester;
}
```

### 2. **Vista para Docentes** 👨‍🏫

**Justificación:** *Los docentes necesitan acceso rápido a la información de estudiantes con NEE en sus cursos. Esta funcionalidad les permite ver ajustes, marcarlos como leídos (confirmando que están al tanto), y solicitar ayuda cuando no saben cómo aplicar un ajuste específico.*

**Nuevos endpoints para docentes:**
```dart
// En api_service.dart agregar:
static Future<List<Adjustment>> getTeacherCourseAdjustments(String courseNrc) async
static Future<bool> markAdjustmentAsRead(String adjustmentId, int adjustmentIndex) async
static Future<bool> requestHelpForAdjustment(String adjustmentId, int adjustmentIndex) async
static Future<Map> getAdjustmentReadStatus(String courseNrc) async
static Future<List> getPendingHelpRequests() async
```

**Endpoints del backend:**
- `GET /teachers/adjustments/my-courses/:courseNrc` - Ver ajustes de un curso
- `POST /teachers/adjustments/:adjustmentId/read/:adjustmentIndex` - Marcar ajuste como leído
- `POST /teachers/adjustments/:adjustmentId/help/:adjustmentIndex` - Solicitar ayuda
- `GET /teachers/adjustments/read-status/:courseNrc` - Ver estado de lectura
- `GET /teachers/adjustments/pending-help-requests` - Ver solicitudes de ayuda pendientes

**Crear nueva pantalla `teacher_dashboard_screen.dart`:**
- Lista de cursos del docente
- Ver estudiantes con NEE por curso
- Marcar ajustes como leídos (checkbox o botón)
- Botón de solicitar ayuda con formulario
- Indicadores visuales de estado (leído/no leído)

### 3. **Vista para Jefes de Departamento/Carrera** 📊

**Justificación:** *Las jefaturas necesitan una visión macro de su departamento/carrera para tomar decisiones informadas. Las estadísticas les permiten identificar tendencias, docentes que necesitan apoyo, y garantizar el cumplimiento de las políticas de inclusión.*

**Nuevos endpoints:**
```dart
// Estadísticas departamentales
static Future<Map> getDepartmentStatistics() async
static Future<List> getDepartmentTeachers(String departmentId) async
static Future<List> getDepartmentCourses(String departmentId) async

// Estadísticas de carreras
static Future<Map> getCareerStatistics() async
static Future<List> getCareerStudents(String careerId) async
static Future<List> getHeadAlerts() async
```

**Endpoints del backend:**
- `GET /heads/departments/statistics` - Estadísticas departamentales
- `GET /heads/departments/:departmentId/teachers` - Docentes del departamento
- `GET /heads/departments/:departmentId/courses` - Cursos del departamento
- `GET /heads/careers/statistics` - Estadísticas de carreras
- `GET /heads/careers/:careerId/students` - Estudiantes de la carrera
- `GET /heads/alerts` - Alertas críticas

**Crear `heads_dashboard_screen.dart`:**
- Dashboard con gráficos estadísticos (usar charts_flutter)
- Lista de docentes/estudiantes
- Sistema de alertas con prioridades
- Filtros por semestre

### 4. **Vista para Personal DIDDEC** 🏢

**Justificación:** *DIDDEC necesita supervisar el funcionamiento global del sistema de inclusión. Esta vista les permite identificar departamentos con problemas, enviar comunicaciones masivas, y asegurar que se cumplan los objetivos institucionales de inclusión.*

**Nuevos endpoints:**
```dart
// Estadísticas globales
static Future<Map> getGlobalStatistics() async
static Future<List> getStatisticsByDepartment() async
static Future<List> getStatisticsByCareer() async
static Future<List> getCriticalAlerts() async
static Future<Map> getAdjustmentsReport() async
static Future<Map> getComplianceReport() async
static Future<bool> sendBroadcastNotification(Map data) async
```

**Endpoints del backend:**
- `GET /diddec/statistics/global` - Estadísticas globales
- `GET /diddec/statistics/by-department` - Estadísticas por departamento
- `GET /diddec/statistics/by-career` - Estadísticas por carrera
- `GET /diddec/alerts/critical` - Alertas críticas del sistema
- `GET /diddec/reports/adjustments` - Reporte de ajustes
- `GET /diddec/reports/compliance` - Reporte de cumplimiento
- `POST /diddec/notifications/broadcast` - Enviar notificación masiva

**Crear `diddec_dashboard_screen.dart`:**
- Dashboard global con métricas clave
- Comparativas entre departamentos (gráficos)
- Sistema de alertas críticas con colores
- Herramienta para notificaciones masivas

### 5. **Actualización del Sistema de Roles** 🔐

**Justificación:** *El sistema original solo tenía roles básicos (admin, docente, estudiante). La realidad universitaria requiere roles jerárquicos: un docente puede ser también jefe de departamento. Esta solución permite asignar responsabilidades adicionales sin romper el sistema de roles base.*

**Actualizar `user_model.dart`:**
```dart
class User {
  // ... campos existentes ...
  
  // Agregar:
  Map<String, dynamic>? additionalResponsibilities;
  
  bool get isDepartmentHead => 
    additionalResponsibilities?['isDepartmentHead'] ?? false;
  bool get isCareerHead => 
    additionalResponsibilities?['isCareerHead'] ?? false;
  bool get isDIDDECStaff => 
    additionalResponsibilities?['isDIDDECStaff'] ?? false;
  List<String> get departmentIds => 
    List<String>.from(additionalResponsibilities?['departmentIds'] ?? []);
  List<String> get careerIds => 
    List<String>.from(additionalResponsibilities?['careerIds'] ?? []);
}
```

### 6. **Nuevos Modelos a Crear** 📁

**Justificación:** *Para gestionar correctamente las estadísticas y asignaciones, necesitamos representar la estructura organizacional de la universidad (departamentos y carreras).*

**`department_model.dart`:**
```dart
class Department {
  String id;
  String name;
  String code;
  String faculty;
  String? headOfDepartmentId;
  String semester;
}
```

**`career_model.dart`:**
```dart
class Career {
  String id;
  String name;
  String code;
  String departmentId;
  String? headOfCareerId;
  String semester;
}
```

---

## 🔧 **CAMBIOS EN MODELOS EXISTENTES**

### **Actualizar `student_model.dart`:**

**Justificación:** *Necesitamos identificar claramente qué estudiantes tienen discapacidad y de qué tipo para generar estadísticas precisas. El semestre es crucial para filtrar información histórica.*

```dart
class Student {
  // ... campos existentes ...
  
  // Agregar:
  bool? hasDisability;      // Indica si tiene alguna discapacidad
  String? disabilityType;    // Tipo específico de discapacidad
  String semester;           // Ahora es obligatorio (antes era opcional)
}
```

---

## 📱 **CAMBIOS EN LA NAVEGACIÓN**

### **Actualizar `home_screen.dart`:**

**Justificación:** *La navegación debe adaptarse dinámicamente según las responsabilidades del usuario. Un docente que es jefe de departamento debe ver ambas opciones.*

```dart
// En _checkRole() agregar lógica para detectar roles adicionales:
if (user.isDepartmentHead || user.isCareerHead) {
  // Mostrar opción de "Panel de Jefatura"
}
if (user.isDIDDECStaff) {
  // Mostrar opción de "Panel DIDDEC"
}
if (user.rol == 'docente') {
  // Mostrar opción de "Mis Cursos"
}
```

### **Crear navegación condicional:**
- Docentes → Vista de cursos y ajustes
- Jefes → Dashboard de estadísticas
- DIDDEC → Panel de control global
- Mantener las vistas existentes para estudiantes y admin

---

## ⚠️ **IMPORTANTE - FILTRO POR SEMESTRE**

**Justificación:** *Toda la información debe estar contextualizada por semestre académico. Esto permite comparar evolución histórica y planificar mejoras futuras.*

**Todas las pantallas deben incluir:**
```dart
String currentSemester = '2025-1'; // Valor por defecto

// Widget selector de semestre
DropdownButton<String>(
  value: currentSemester,
  items: ['2025-1', '2024-2', '2024-1'].map((sem) => 
    DropdownMenuItem(value: sem, child: Text(sem))
  ).toList(),
  onChanged: (value) => setState(() {
    currentSemester = value!;
    // Recargar datos con el nuevo semestre
    _loadData();
  }),
)
```

---

## 🚀 **ORDEN SUGERIDO DE IMPLEMENTACIÓN**

1. **Actualizar modelos** (User, Student, crear Notification, Department, Career)
   - *Fundamental para que todo lo demás funcione correctamente*

2. **Actualizar `api_service.dart`** con todos los nuevos endpoints
   - *Centraliza toda la comunicación con el backend*

3. **Implementar sistema de notificaciones** (modelo, servicio, UI)
   - *Alta prioridad: mejora inmediata en la comunicación*

4. **Crear vista de docentes** (la más prioritaria según el Sprint 3)
   - *Impacto directo en el 100% de los docentes*

5. **Crear vista de jefaturas**
   - *Permite supervisión y toma de decisiones*

6. **Crear vista DIDDEC**
   - *Control y monitoreo institucional*

7. **Actualizar navegación** según roles
   - *Experiencia personalizada por usuario*

---

## 💡 **TIPS ADICIONALES**

1. **Manejo de errores**: 
   - Implementar interceptor para errores 401/403
   - Mostrar mensajes amigables al usuario

2. **Cache local**: 
   - Usar `shared_preferences` para cachear notificaciones
   - Reducir llamadas al servidor

3. **Actualización en tiempo real**: 
   - Considerar polling cada 30 segundos para notificaciones nuevas
   - Evaluar WebSockets para el futuro

4. **UI/UX**: 
   - Usar badges rojos para mostrar contador de notificaciones no leídas
   - Indicadores visuales claros (checkmarks para leído, iconos de ayuda)

5. **Testing**: 
   - Crear usuarios de prueba con diferentes roles
   - Probar flujos completos de cada rol

---

## 📊 **MÉTRICAS DE ÉXITO**

Los cambios implementados deben cumplir con:
- ✅ 100% de docentes pueden ver estudiantes con NEE
- ✅ 100% de jefaturas acceden a estadísticas
- ✅ Notificaciones entregadas en < 5 minutos
- ✅ Control de acceso por roles funcionando

---

## 🔒 **SEGURIDAD**

- Todos los endpoints requieren autenticación JWT
- Los guards del backend validan permisos automáticamente
- No es necesario validar permisos en el frontend (pero es buena práctica)

---

**El backend está 100% listo y funcionando. Todos los endpoints mencionados ya están implementados, probados y documentados con Swagger. ¡Pueden empezar a consumirlos inmediatamente!** 🎉

### 📝 Notas finales:
- Cualquier duda técnica, revisar la documentación Swagger en `/api/docs`
- Los tipos de respuesta están definidos en los DTOs del backend
- El semestre por defecto actual es `2025-1`
