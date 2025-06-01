// services/auth_service.dart
import 'dart:developer';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';
import 'package:incluye_app/models/user_model.dart';

class AuthService {
  static Future<User?> login(String email, String password) async {
    try {
      final response = await ApiService.dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
        options: Options(
          validateStatus: (status) => true, // permitir manejar códigos no 200
        ),
      );

      if (response.statusCode == 200) {
        final data = response.data;

        String? token = data['access_token'] ?? data['token'];
        Map<String, dynamic>? userData = data['user'];

        if (token == null) {
          print('Error: no se recibió token en la respuesta');
          return null;
        }

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);

        userData ??= {
          'email': email,
          'nombreCompleto': '',
          'id': '',
          'rol': '',
        };
        final nombreCompleto = userData['nombreCompleto'] ?? '';
        await prefs.setString('nombreCompleto', nombreCompleto);

        userData['token'] = token;

        return User.fromJson(userData);
      } else if (response.statusCode == 401) {
        print('Credenciales inválidas');
      } else {
        print(
          'Error en login. Código: ${response.statusCode}, respuesta: ${response.data}',
        );
      }
      return null;
    } catch (e) {
      print('Excepción durante login: $e');
      return null;
    }
  }

  static Future<String?> getUserName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('nombreCompleto');
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey('token');
  }
}
