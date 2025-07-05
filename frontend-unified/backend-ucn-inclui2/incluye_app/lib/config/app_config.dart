import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:incluye_app/core/constants/api_constants.dart';

// Configuración global de la aplicación
class AppConfig {
  // Entorno actual
  static final Environment currentEnvironment =
      kDebugMode ? Environment.development : Environment.production;

  // URL base del servidor backend según el entorno
  static String get apiBaseUrl => _getApiBaseUrl();

  // Tiempo de espera para las solicitudes (en milisegundos)
  static const int connectionTimeout = 15000; // Aumentado para dar más tiempo
  static const int receiveTimeout = 15000; // Aumentado para dar más tiempo

  // Versión de la aplicación
  static const String appVersion = '1.0.0';

  // Otras configuraciones globales
  static final bool enableLogging =
      currentEnvironment != Environment.production;

  // Obtener la URL base del API según el entorno
  static String _getApiBaseUrl() {
    // Permitir sobreescribir la URL base con una variable de entorno
    // Esto es útil para pruebas y desarrollo
    const String overrideUrl = String.fromEnvironment('API_URL');
    if (overrideUrl.isNotEmpty) {
      return overrideUrl;
    }

    switch (currentEnvironment) {
      case Environment.development:
        // Para desarrollo local, la URL base ahora viene de un lugar centralizado
        return ApiConstants.baseUrl;
      case Environment.testing:
        return 'http://test-api.inclui2.ucn.cl';
      case Environment.production:
        return 'https://api.inclui2.ucn.cl';
      case Environment.web:
        // Para desarrollo web, usamos la URL relativa para evitar problemas CORS
        return '';
    }
  }

  // Verificar si estamos en modo web
  static bool get isWeb => currentEnvironment == Environment.web;

  // Verificar si estamos en modo desarrollo
  static bool get isDevelopment =>
      currentEnvironment == Environment.development;
}

// Enumeración de entornos disponibles
enum Environment { development, testing, production, web }
