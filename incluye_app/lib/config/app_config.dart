import 'package:flutter/foundation.dart' show kDebugMode, defaultTargetPlatform, TargetPlatform, kIsWeb;

// Configuración global de la aplicación
class AppConfig {
  // Entorno actual
  // Simplificamos la detección del entorno. Usamos kDebugMode para desarrollo
  // y kIsWeb para web. Si no es ninguno, asumimos producción.
  static final Environment currentEnvironment = _getCurrentEnvironment();

  // URL base del servidor backend según el entorno
  static String get apiBaseUrl => _getApiBaseUrl();

  // Tiempo de espera para las solicitudes (en milisegundos)
  static const int connectionTimeout = 15000;
  static const int receiveTimeout = 15000;

  // Versión de la aplicación
  static const String appVersion = '1.0.0';

  // Otras configuraciones globales
  static final bool enableLogging = currentEnvironment != Environment.production;

  // Determina el entorno actual
  static Environment _getCurrentEnvironment() {
    // La compilación web es un caso especial
    if (kIsWeb) {
      return Environment.web;
    }
    // Si no es web, usamos kDebugMode para diferenciar desarrollo de producción
    if (kDebugMode) {
      return Environment.development;
    }
    return Environment.production;
  }

  // Obtener la URL base del API según el entorno
  static String _getApiBaseUrl() {
    // Permitir sobreescribir la URL base con una variable de entorno
    const String overrideUrl = String.fromEnvironment('API_URL');
    if (overrideUrl.isNotEmpty) {
      return overrideUrl;
    }

    switch (currentEnvironment) {
      case Environment.development:
        // En desarrollo, verificamos si estamos en un emulador de Android
        if (defaultTargetPlatform == TargetPlatform.android) {
          return 'http://10.0.2.2:3000'; // IP especial para el emulador de Android
        }
        // Para otras plataformas en desarrollo (como simulador iOS o escritorio), localhost suele funcionar
        return 'http://localhost:3000';
      
      case Environment.testing:
        return 'http://test-api.inclui2.ucn.cl';
      
      case Environment.production:
        return 'https://api.inclui2.ucn.cl';
      
      case Environment.web:
        // Para desarrollo web, es común usar la misma URL que en desarrollo móvil.
        // Si tu backend y frontend web corren en el mismo servidor (localhost), esto es correcto.
        // Si tu backend corre en un puerto diferente, deberías especificarlo.
        // El return '' es riesgoso, es mejor ser explícito.
        return 'http://localhost:3000';
    }
  }

  // Verificar si estamos en modo web
  static bool get isWeb => kIsWeb;

  // Verificar si estamos en modo desarrollo
  static bool get isDevelopment => currentEnvironment == Environment.development;
}

// Enumeración de entornos disponibles
enum Environment {
  development,
  testing,
  production,
  web
}