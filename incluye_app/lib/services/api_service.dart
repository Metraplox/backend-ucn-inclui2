import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000'; // Asegúrate de incluir el protocolo

  static final Dio _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(milliseconds: 5000), // Tiempo de espera de conexión
    receiveTimeout: const Duration(milliseconds: 3000), // Tiempo de espera para recibir datos
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ));

  /// Inicia sesión y guarda el token en SharedPreferences
  static Future<Map<String, dynamic>?> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['access_token']);
        return data;
      }
      return null;
    } catch (e) {
      // Manejo de errores: puedes diferenciar por tipo de error
      print('Error al hacer login: $e');
      return null;
    }
  }

  /// Cierra sesión eliminando el token
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  /// Recupera el token almacenado
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }
}
