# 📱 UCN Inclui2 - Frontend (Flutter)

## 📋 **Información**

**Framework:** Flutter + Dart  
**Backend:** NestJS API  
**Estado:** ✅ Producción (Julio 2025)  
**Conectividad:** API RESTful + WebSocket

---

## 🚀 **Setup Rápido**

### 📋 **Prerequisitos**
- Flutter 3.24+
- Dart SDK 3.x
- Backend ejecutándose en puerto 3000

### ⚡ **Instalación**
```bash
cd incluye_app
flutter pub get
flutter run
```

**📖 Setup detallado:** [`docs/setup/`](./docs/setup/)

---

## ⚠️ **IMPORTANTE: Refactoring API (Julio 2025)**

Se completó refactoring crítico de estructura de respuesta API.

**OBLIGATORIO LEER:** 📖 [`docs/development/GUIA_DESARROLLADORES.md`](./docs/development/GUIA_DESARROLLADORES.md)

### ✅ **Verificación**
```bash
flutter test
flutter analyze
# Resultado esperado: Tests passing, sin errores críticos
```

---

## 🏗️ **Arquitectura**

```
lib/
├── models/           # Modelos de datos
├── screens/          # Pantallas principales
├── services/         # API y lógica de negocio
│   └── api_response_normalizer.dart  # 🔴 Crítico
├── widgets/          # Componentes reutilizables
└── test/            # Tests unitarios
```

**📖 Arquitectura completa:** [`docs/architecture/`](./docs/architecture/)

---

## 🎯 **Funcionalidades Principales**

### 👨‍💼 **Administradores DIDDEC**
- Dashboard con estadísticas
- Gestión de estudiantes NEE
- Reportes automáticos

### 👨‍🏫 **Profesores**
- Estudiantes asignados
- Gestión de ajustes razonables
- Recursos de apoyo

### 👨‍🎓 **Estudiantes**
- Perfil personal NEE
- Seguimiento de ajustes
- Gestión de consentimientos

---

## 🔗 **Conectividad Backend**

### 🔐 **Autenticación**
```dart
// JWT + Google OAuth
final user = await AuthService.loginWithGoogle();
```

### 📡 **API Calls**
```dart
// Uso del normalizador obligatorio
final normalizedData = ApiResponseNormalizer.extractDataGeneric(response.data);
```

### 📊 **APIs Principales**
- `GET /api/students` - Lista estudiantes
- `GET /api/diddec/statistics` - Dashboard
- `POST /api/notifications/mark-read` - Notificaciones

**📖 API completa:** [Backend docs](../../../Back/backend-ucn-inclui2/docs/api/)

---

## 🧪 **Testing**

```bash
flutter test              # Tests unitarios
flutter test --coverage   # Con coverage
flutter analyze           # Análisis estático
```

**📖 Guía de testing:** [`docs/testing/`](./docs/testing/)

---

## 📚 **Documentación**

### 🔧 **Para Desarrolladores**
- [`docs/development/GUIA_DESARROLLADORES.md`](./docs/development/GUIA_DESARROLLADORES.md) - ⚠️ **Lectura obligatoria**
- [`docs/setup/`](./docs/setup/) - Configuración detallada
- [`docs/testing/`](./docs/testing/) - Guía de testing

### 📖 **Técnica**
- [`docs/architecture/`](./docs/architecture/) - Arquitectura del sistema
- [`incluye_app/README.md`](./incluye_app/README.md) - Setup de Flutter

---

## 🤝 **Contribución**

1. **Leer:** [`docs/development/GUIA_DESARROLLADORES.md`](./docs/development/GUIA_DESARROLLADORES.md)
2. **Branch:** `feature/nombre-feature` desde `main`
3. **Desarrollar:** Siguiendo estándares
4. **Verificar:** `flutter test && flutter analyze`
5. **PR:** Con checklist de calidad

---

## 📞 **Soporte**

- **Issues:** GitHub Issues para bugs/features
- **Docs:** Revisar [`docs/`](./docs/) primero
- **Backend:** Verificar API en puerto 3000

---

**Universidad Católica del Norte - DIDDEC**  
**Sistema de gestión de estudiantes con NEE**
