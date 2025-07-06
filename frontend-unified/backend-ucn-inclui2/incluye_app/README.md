# 📱 UCN INCLUI2 - Frontend Flutter

[![Flutter](https://img.shields.io/badge/Flutter-3.7.2+-blue.svg)](https://flutter.dev/)
[![Dart](https://img.shields.io/badge/Dart-3.0+-blue.svg)](https://dart.dev/)
[![Status](https://img.shields.io/badge/Status-V1.0%20Completed-brightgreen.svg)](#)

> **🎯 Aplicación móvil para gestión de estudiantes con Necesidades Educativas Especiales (NEE) de la Universidad Católica del Norte**

## 📋 Estado del Proyecto

**✅ V1.0 COMPLETAMENTE FINALIZADO**  
**✅ MERGE FRONTEND COMPLETADO (05/07/2025)**  
**✅ ARQUITECTURA UNIFICADA Y OPTIMIZADA**  
**🚀 LISTO PARA ROADMAP V2.0**  
**📅 Última actualización:** 05/07/2025

---

## 🏆 **LOGROS COMPLETADOS**

### **FRONTEND V1.0** ✅
- ✅ Aplicación Flutter multi-plataforma
- ✅ 5 dashboards especializados por rol
- ✅ Autenticación Google OAuth integrada
- ✅ Sistema de notificaciones en tiempo real
- ✅ Patrón Singleton implementado en servicios críticos
- ✅ Arquitectura limpia con separación de capas

### **CARACTERÍSTICAS PRINCIPALES** ✅
- ✅ **Multi-rol:** Estudiante, Docente, DIDDEC, Jefe Carrera, Coordinador
- ✅ **Notificaciones:** WebSocket tiempo real + push notifications
- ✅ **Gestión Documentos:** Upload, verificación y aprobación
- ✅ **Ajustes Razonables:** CRUD completo con workflows
- ✅ **Reportes:** Generación y visualización por rol

### **INTEGRACIÓN** ✅
- ✅ API REST backend perfectamente conectada
- ✅ Autenticación JWT + Google OAuth
- ✅ WebSocket notifications funcionando
- ✅ Sincronización estado en tiempo real

---

## 🚀 **PRÓXIMOS PASOS**

### **FASE 0: Optimización** 🔄 (Q3 2025)
- Corrección de warnings menores de análisis
- Optimización de performance
- Testing unitario de servicios críticos

### **FASE 1: Nuevas Características** 📈 (Q4 2025)  
- Sistema de chat interno
- Notificaciones push offline
- Modo oscuro y personalización

---

## 🛠️ **Tecnologías Utilizadas**

### **Frontend**
- **Flutter 3.7.2+** - Framework principal
- **Dart 3.0+** - Lenguaje de programación
- **Dio** - Cliente HTTP para API REST
- **Socket.IO** - Comunicación en tiempo real
- **Provider** - Gestión de estado
- **Google Sign-In** - Autenticación OAuth

### **Arquitectura**
- **Patrón Repository** - Acceso a datos
- **Singleton Services** - Gestión estado global
- **Feature-First Structure** - Organización por características
- **Clean Architecture** - Separación de responsabilidades

---

## 📂 **Estructura del Proyecto**

```
lib/
├── config/          # Configuración de la app
├── core/            # Funcionalidades base
├── features/        # Características por módulo
├── models/          # Modelos de datos
├── providers/       # Providers de estado
├── screens/         # Pantallas de la aplicación
├── services/        # Servicios de negocio
├── utils/           # Utilidades y helpers
└── widgets/         # Widgets reutilizables
```

---

## 🚀 **Instalación y Ejecución**

### **Prerrequisitos**
- Flutter 3.7.2 o superior
- Dart 3.0 o superior
- Android Studio / VS Code
- Dispositivo/emulador Android/iOS

### **Instalación**
```bash
# Clonar el repositorio
git clone [repository-url]

# Navegar al directorio
cd frontend-unified/backend-ucn-inclui2/incluye_app

# Instalar dependencias
flutter pub get

# Ejecutar la aplicación
flutter run
```

### **Build para Producción**
```bash
# Android
flutter build apk --release

# iOS
flutter build ios --release

# Web
flutter build web --release
```

---

## 📱 **Características por Rol**

### **👨‍🎓 Estudiante**
- Visualización de ajustes personales
- Solicitud de modificaciones
- Upload de documentos médicos
- Seguimiento de estado de solicitudes

### **👨‍🏫 Docente**
- Lista de estudiantes con NEE
- Revisión de ajustes por curso
- Confirmación de lectura
- Comunicación con coordinación

### **👩‍💼 DIDDEC**
- Gestión completa de ajustes
- Aprobación de documentos
- Generación de reportes
- Administración de usuarios

### **👨‍💼 Jefe de Carrera**
- Estadísticas departamentales
- Supervisión de implementación
- Reportes de seguimiento
- Coordinación con docentes

### **👩‍💻 Coordinador**
- Panel administrativo completo
- Gestión de semestres
- Configuración del sistema
- Reportes ejecutivos

---

## 📊 **Estado de Calidad**

| Métrica | Estado | Detalles |
|---------|--------|----------|
| **Compilación** | ✅ | Sin errores críticos |
| **Warnings** | ⚠️ | Menores, no bloquean funcionalidad |
| **Performance** | ✅ | Optimizado para producción |
| **Arquitectura** | ✅ | Clean Architecture implementada |
| **Documentación** | ✅ | Completa y actualizada |

---

## 📝 **Documentación Adicional**

- [`docs/01_ARCHITECTURE.md`](docs/01_ARCHITECTURE.md) - Arquitectura del sistema
- [`docs/02_UX_UI_GUIDELINES.md`](docs/02_UX_UI_GUIDELINES.md) - Guías de diseño

---

**Proyecto INCLUI2 - UCN**  
**Frontend Flutter V1.0**  
**Julio 2025**
