# 🏗️ Arquitectura del Frontend - UCN Inclui2

**Última actualización:** 10/07/2025

## 📱 **Estructura del Proyecto Flutter**

```
lib/
├── models/             # Modelos de datos
├── screens/            # Pantallas de la aplicación
├── services/           # Servicios API
│   ├── api_response_normalizer.dart  # 🔴 CRÍTICO: Normalizador
│   ├── diddec_service.dart
│   └── student_service.dart
├── widgets/            # Componentes reutilizables
└── test/              # Tests unitarios
```

## 🎯 **Funcionalidades por Rol**

### 👨‍💼 **Para Administradores DIDDEC**
- Dashboard con estadísticas completas
- Gestión de estudiantes con NEE
- Generación de reportes automáticos
- Seguimiento de cumplimiento por departamento

### 👨‍🏫 **Para Profesores**
- Visualización de estudiantes asignados
- Gestión de ajustes razonables
- Reconocimiento de ajustes aplicados
- Recursos de apoyo educativo

### 👨‍🎓 **Para Estudiantes**
- Perfil personal con información de NEE
- Seguimiento de ajustes aplicados
- Gestión de consentimientos
- Acceso a recursos de apoyo

### 👨‍💼 **Para Jefes de Carrera**
- Estadísticas de carrera
- Gestión de profesores asignados
- Reportes de cumplimiento

---

## 🔧 **APIs y Servicios**

### 🔗 **Principales Endpoints**
```
GET /api/diddec/statistics/:semester     # Estadísticas generales
GET /api/students/profile/:id            # Perfil de estudiante
POST /api/diddec/export-report          # Generación de reportes
GET /api/hawaii/cache/status            # Estado del caché Hawaii
POST /api/notifications/mark-read       # Gestión de notificaciones
```

### 🔄 **Integraciones Externas**
- **Hawaii:** Sistema académico UCN
- **Google OAuth:** Autenticación
- **MongoDB:** Base de datos principal
- **File System:** Gestión de documentos

---

## 📊 **Modelos de Datos**

### 🎓 **Principales Entidades**
- **Student:** Información de estudiantes con NEE
- **Adjustment:** Ajustes razonables aplicados
- **User:** Usuarios del sistema (profesores, admin, etc.)
- **Course:** Cursos y asignaturas
- **Notification:** Sistema de notificaciones
- **Consent:** Consentimientos y documentos legales

### 🗄️ **Base de Datos**
- **MongoDB:** Base principal
- **Colecciones:** students, users, adjustments, courses, notifications
- **Índices:** Optimizados para consultas frecuentes

---

## 🔐 **Sistema de Autenticación**

### JWT + Google OAuth
```dart
// Manejo de autenticación
class AuthService {
  static Future<User?> loginWithGoogle() async {
    // Implementación OAuth
  }
  
  static Future<bool> refreshToken() async {
    // Renovación de tokens
  }
}
```

### Roles y Permisos
- **ESTUDIANTE:** Ver perfil propio
- **COORDINADOR:** Gestionar su carrera
- **EDUCADORA_SOCIAL:** Gestionar ajustes
- **DIDDEC_STAFF:** Reportes y administración
- **ADMIN:** Acceso completo

---

## 🎨 **Componentes UI**

### Widgets Reutilizables
- `StudentCard` - Tarjeta de estudiante
- `StatisticsChart` - Gráficos de estadísticas
- `AdjustmentForm` - Formulario de ajustes
- `NotificationBadge` - Indicador de notificaciones

### Navegación
- **BottomNavigationBar** para menú principal
- **Drawer** para opciones avanzadas
- **Routes** con navegación tipada

---

## 📱 **Responsividad**

### Breakpoints
- **Mobile:** < 600px
- **Tablet:** 600-1200px
- **Desktop:** > 1200px

### Adaptación
```dart
Widget build(BuildContext context) {
  return LayoutBuilder(
    builder: (context, constraints) {
      if (constraints.maxWidth > 1200) {
        return DesktopLayout();
      } else if (constraints.maxWidth > 600) {
        return TabletLayout();
      } else {
        return MobileLayout();
      }
    },
  );
}
```
