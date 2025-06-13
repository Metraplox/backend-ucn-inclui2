// services/api_service.dart
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
// import 'dart:developer'; // Reemplazado por print para consistencia
// import 'package:jwt_decoder/jwt_decoder.dart'; // No se usa directamente aquí

class ApiService {
  // Asegúrate que esta URL sea la correcta y accesible desde tu emulador/dispositivo
  // Para emulador Android: 'http://10.0.2.2:3000'
  // Para localhost si corres en web o iOS en Mac: 'http://localhost:3000'
  // Para dispositivo físico: IP de tu máquina en la red local, ej: 'http://192.168.X.X:3000'
  static final Dio _dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000'));
  static bool _isInterceptorSetup = false;

  static Dio get dio {
    if (!_isInterceptorSetup) {
      _setupInterceptors();
      _isInterceptorSetup = true;
    }
    return _dio;
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          //print("ApiService Interceptor: Petición a ${options.path}");
          // No añadas el token a los endpoints de autenticación
          if (options.path != '/auth/login' && 
              options.path != '/auth/google' &&
              options.path != '/auth/register') {
            String? token = await getToken();
            if (token != null && token.isNotEmpty) {
              options.headers['Authorization'] = 'Bearer $token';
            //  print("ApiService Interceptor: Token añadido a la cabecera para ${options.path}");
            } else {
              //print("ApiService Interceptor: No hay token para añadir para ${options.path}");
              // Podrías considerar rechazar la petición aquí si se requiere token y no existe
              // o dejar que el backend devuelva 401/403.
            }
          }
          return handler.next(options); // Continuar con la petición
        },
        onResponse: (response, handler) {
          //print("ApiService Interceptor: Respuesta recibida para ${response.requestOptions.path} - Status: ${response.statusCode}");
          // Puedes procesar respuestas globalmente aquí si es necesario
          return handler.next(response); // Continuar con la respuesta
        },
        onError: (DioException e, handler) {
          //print("ApiService Interceptor: Error en petición para ${e.requestOptions.path}");
          if (e.response != null) {
            //print("ApiService Interceptor: Error Status: ${e.response?.statusCode}, Data: ${e.response?.data}");
          } else {
            //print("ApiService Interceptor: Error sin respuesta (ej. problema de red): ${e.message}");
          }
          // Aquí podrías manejar errores globales como 401 (token expirado -> logout)
          if (e.response?.statusCode == 401) {
            //print("ApiService Interceptor: Error 401 detectado. Considera desloguear al usuario.");
            // Ejemplo: AuthService.logout(); (Cuidado con las dependencias y el contexto de UI)
          }
          return handler.next(e); // Continuar con el error
        },
      ),
    );
    //print("ApiService: Interceptor de autorización configurado.");
  }

  // El método initialize ya no es estrictamente necesario si el interceptor
  // se configura en el primer acceso al getter 'dio'.
  // Si prefieres llamarlo explícitamente en main.dart, puedes hacerlo.
  static Future<void> configure() async {
    if (!_isInterceptorSetup) {
      _setupInterceptors();
      _isInterceptorSetup = true;
    }
  }

  // handleApiError puede ser útil, pero el interceptor ya loguea bastante.
  static void handleApiError(String context, dynamic error) {
    //print('[$context] Error: $error');
    if (error is DioException && error.response != null) {
      //print('[$context] DioError Response: ${error.response?.data}');
    }
  }
}