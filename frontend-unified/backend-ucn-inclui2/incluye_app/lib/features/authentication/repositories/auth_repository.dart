import 'package:dio/dio.dart';
import 'package:incluye_app/services/api_service.dart';

class AuthRepository {
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await ApiService.dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );
      
      return response.data;
    } on DioException catch (e) {
      final errorMessage = e.response?.data['message'] ?? 'Error de conexión';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Ocurrió un error inesperado durante el login.');
    }
  }

  Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
    try {
      final response = await ApiService.dio.post(
        '/auth/refresh',
        options: Options(headers: {'Authorization': 'Bearer $refreshToken'}),
      );
      return response.data;
    } on DioException catch (e) {
      final errorMessage = e.response?.data['message'] ?? 'Error de conexión';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Ocurrió un error inesperado al refrescar el token.');
    }
  }

  Future<Map<String, dynamic>> registerTeacher(
    String nombre,
    String apellido,
    String email,
    String password,
  ) async {
    try {
      final response = await ApiService.dio.post(
        '/auth/register/teacher',
        data: {
          'nombre': nombre,
          'apellido': apellido,
          'email': email,
          'password': password,
        },
      );
      return response.data;
    } on DioException {
      rethrow;
    }
  }

  // Aquí irían otros métodos de comunicación con la API de autenticación,
  // como registerTeacher, loginWithGoogle, etc.
}
