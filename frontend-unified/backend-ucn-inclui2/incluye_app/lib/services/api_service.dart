// services/api_service.dart
import 'package:dio/dio.dart';
import 'package:incluye_app/services/storage_service.dart';

class ApiService {
  // Asegúrate que esta URL sea la correcta y accesible desde tu emulador/dispositivo
  // Para emulador Android: 'http://10.0.2.2:3001'
  // Para localhost si corres en web o iOS en Mac: 'http://localhost:3001'
  // Para dispositivo físico: IP de tu máquina en la red local, ej: 'http://192.168.X.X:3001'
  static final Dio _dio = Dio(BaseOptions(baseUrl: 'http://localhost:3001'));
  static bool _isInterceptorSetup = false;
  static const StorageService _storageService = StorageService();

  static Dio get dio {
    if (!_isInterceptorSetup) {
      _setupInterceptors();
      _isInterceptorSetup = true;
    }
    return _dio;
  }

  static Future<String?> getToken() async {
    return await _storageService.getAccessToken();
  }

  static void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // No añadas el token a los endpoints de autenticación
          if (options.path != '/auth/login' && 
              options.path != '/auth/google' &&
              options.path != '/auth/register') {
            String? token = await getToken();
            if (token != null && token.isNotEmpty) {
              options.headers['Authorization'] = 'Bearer $token';
            }
          }
          return handler.next(options); // Continuar con la petición
        },
        onResponse: (response, handler) {
          // Puedes procesar respuestas globalmente aquí si es necesario
          return handler.next(response); // Continuar con la respuesta
        },
        onError: (DioException e, handler) {
          // Aquí podrías manejar errores globales como 401 (token expirado -> logout)
          if (e.response?.statusCode == 401) {
            print("ApiService Interceptor: Error 401 detectado. Considera desloguear al usuario.");
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