# 🚀 Setup y Configuración - UCN Inclui2 Frontend

**Última actualización:** 10/07/2025

## 📋 **Prerequisitos**

### Software Requerido
- **Flutter 3.24+**
- **Dart SDK 3.x**
- **Android Studio / VS Code**
- **Git**

### Backend Dependencias
- **Node.js 18+** (para backend)
- **MongoDB 4.4+**

---

## ⚡ **Instalación Rápida**

### 1. Clonar Repositorio
```bash
git clone [repository-url]
cd Front/backend-ucn-inclui2/incluye_app
```

### 2. Instalar Dependencias
```bash
flutter pub get
```

### 3. Configurar Entorno
```bash
# Copiar archivos de configuración
cp lib/config/app_config.example.dart lib/config/app_config.dart

# Editar configuración según ambiente
```

### 4. Ejecutar Aplicación
```bash
# Desarrollo
flutter run

# Con hot reload
flutter run --hot

# Modo release
flutter run --release
```

---

## 🔧 **Configuración Detallada**

### Variables de Entorno

#### `lib/config/app_config.dart`
```dart
class AppConfig {
  static const String baseUrl = 'http://localhost:3000';
  static const String apiVersion = '/api';
  static const bool debugMode = true;
  
  // OAuth Google
  static const String googleClientId = 'your-google-client-id';
  
  // Configuraciones específicas
  static const int timeoutSeconds = 30;
  static const int maxRetryAttempts = 3;
}
```

### Dependencias Principales

#### `pubspec.yaml`
```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # HTTP y API
  dio: ^5.3.2
  pretty_dio_logger: ^1.3.1
  
  # Estado y navegación
  provider: ^6.0.5
  go_router: ^12.1.1
  
  # UI y componentes
  flutter_svg: ^2.0.7
  cached_network_image: ^3.3.0
  
  # Utilidades
  shared_preferences: ^2.2.2
  package_info_plus: ^4.2.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  mockito: ^5.4.2
  build_runner: ^2.4.7
```

---

## 🐳 **Setup con Docker (Opcional)**

### Docker para Backend
```bash
cd Back/backend-ucn-inclui2
docker-compose up -d
```

### Verificar Conexión
```bash
# Verificar que backend está ejecutándose
curl http://localhost:3000/health

# Resultado esperado: {"status": "ok"}
```

---

## 📱 **Configuración por Plataforma**

### Android
1. **Habilitar modo desarrollador**
2. **Conectar dispositivo o usar emulador**
3. **Verificar conexión:**
   ```bash
   flutter devices
   ```

### iOS (macOS)
1. **Xcode instalado**
2. **iOS Simulator o dispositivo**
3. **Certificados de desarrollo configurados**

### Web
```bash
# Ejecutar en navegador
flutter run -d chrome

# Build para producción
flutter build web
```

---

## 🔍 **Verificación de Setup**

### Tests de Conectividad
```bash
# Verificar instalación
flutter doctor

# Ejecutar tests básicos
flutter test

# Verificar análisis de código
flutter analyze
```

### Checklist de Verificación
- [ ] Flutter doctor sin errores críticos
- [ ] Backend ejecutándose en puerto 3000
- [ ] Base de datos MongoDB conectada
- [ ] Aplicación Flutter ejecutándose sin errores
- [ ] Hot reload funcionando correctamente

---

## 🔧 **Configuración de IDE**

### VS Code
#### Extensiones Recomendadas
```json
{
  "recommendations": [
    "dart-code.dart-code",
    "dart-code.flutter",
    "nash.awesome-flutter-snippets",
    "alexisvt.flutter-snippets"
  ]
}
```

#### `launch.json`
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "incluye_app",
      "request": "launch",
      "type": "dart",
      "program": "lib/main.dart",
      "args": ["--flavor", "development"]
    }
  ]
}
```

### Android Studio
1. **Instalar plugin Flutter**
2. **Configurar SDK paths**
3. **Crear emulador Android**

---

## 🚨 **Solución de Problemas Comunes**

### Error: "No devices found"
```bash
# Verificar dispositivos conectados
flutter devices

# Reiniciar ADB (Android)
adb kill-server
adb start-server
```

### Error: "Packages not found"
```bash
# Limpiar cache
flutter clean
flutter pub get

# En caso extremo
flutter pub deps
```

### Error: "Backend connection refused"
1. **Verificar backend ejecutándose:** `curl http://localhost:3000/health`
2. **Verificar configuración de URL en AppConfig**
3. **Verificar firewall/proxy**

### Error: "OAuth configuration"
1. **Verificar Google Client ID en configuración**
2. **Verificar configuración OAuth en Google Console**
3. **Verificar permisos en manifest (Android)**

---

## 🔄 **Scripts de Desarrollo**

### `scripts/setup.sh` (Linux/macOS)
```bash
#!/bin/bash
echo "🚀 Configurando UCN Inclui2 Frontend..."

# Verificar Flutter
flutter doctor

# Instalar dependencias
flutter pub get

# Ejecutar tests iniciales
flutter test

echo "✅ Setup completado!"
```

### `scripts/setup.ps1` (Windows)
```powershell
Write-Host "🚀 Configurando UCN Inclui2 Frontend..." -ForegroundColor Green

# Verificar Flutter
flutter doctor

# Instalar dependencias
flutter pub get

# Ejecutar tests iniciales
flutter test

Write-Host "✅ Setup completado!" -ForegroundColor Green
```

---

## 📚 **Próximos Pasos**

Después del setup exitoso:

1. **Leer:** [`docs/development/GUIA_DESARROLLADORES.md`](../development/GUIA_DESARROLLADORES.md)
2. **Explorar:** Estructura de carpetas en `lib/`
3. **Ejecutar:** Tests existentes con `flutter test`
4. **Verificar:** Conectividad con backend
5. **Comenzar:** Desarrollo siguiendo estándares establecidos
