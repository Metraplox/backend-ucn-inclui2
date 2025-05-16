import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000';

  static final Dio _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(milliseconds: 5000),
    receiveTimeout: const Duration(milliseconds: 3000),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ));

  // ---------------------- AUTENTICACIÓN ----------------------

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
      print('Error al hacer login: $e');
      return null;
    }
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // ---------------------- ROLES ----------------------

  static Future<List<String>> getUserRoles() async {
    final token = await getToken();
    if (token != null) {
      final decodedToken = JwtDecoder.decode(token);
      final roles = decodedToken['roles'];
      if (roles is List) {
        return roles.map((e) => e.toString()).toList();
      }
    }
    return [];
  }

  static Future<bool> isStudent() async {
    final roles = await getUserRoles();
    return roles.contains('estudiante');
  }

  static Future<bool> isAdmin() async {
    final roles = await getUserRoles();
    return roles.contains('administrador');
  }

  // ---------------------- ESTUDIANTES ----------------------

  static Future<List<Map<String, dynamic>>> getAllStudents() async {
    try {
      final token = await getToken();
      final response = await _dio.get('/students', options: Options(headers: {
        'Authorization': 'Bearer $token',
      }));
      return List<Map<String, dynamic>>.from(response.data);
    } catch (e) {
      print('Error al obtener estudiantes: $e');
      return [];
    }
  }

  static Future<bool> deleteStudent(String id) async {
    try {
      final token = await getToken();
      await _dio.delete('/students/$id', options: Options(headers: {
        'Authorization': 'Bearer $token',
      }));
      return true;
    } catch (e) {
      print('Error al eliminar estudiante: $e');
      return false;
    }
  }

  static Future<Map<String, dynamic>?> getStudentById(String id) async {
    final token = await getToken();
    try {
      final response = await _dio.get(
        '/students/$id',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      if (response.statusCode == 200) {
        return response.data;
      }
    } catch (e) {
      print('Error al obtener estudiante: $e');
    }
    return null;
  }

  static Future<bool> updateStudent(String id, Map<String, dynamic> data) async {
    final token = await getToken();
    try {
      final response = await _dio.patch(
        '/students/$id',
        data: data,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Error al actualizar estudiante: $e');
      return false;
    }
  }

  static Future<bool> createStudent(Map<String, dynamic> data) async {
    try {
      final token = await getToken();
      final response = await _dio.post(
        '/students',
        data: data,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (e) {
      print('Error al crear estudiante: $e');
      return false;
    }
  }

  // ---------------------- CONSENTIMIENTO ----------------------

  static Future<bool> giveConsent(String studentId) async {
    try {
      final token = await getToken();
      final response = await _dio.post(
        '/consents',
        data: {'studentId': studentId},
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (e) {
      print('Error al dar consentimiento: $e');
      return false;
    }
  }

  // ---------------------- SUBIR DOCUMENTO ----------------------

  static Future<bool> uploadDocument(File file, String studentId) async {
    try {
      final token = await getToken();

      FormData formData = FormData.fromMap({
        'document': await MultipartFile.fromFile(file.path, filename: file.path.split('/').last),
        'studentId': studentId,
      });

      final response = await _dio.post(
        '/documents/upload',
        data: formData,
        options: Options(headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'multipart/form-data',
        }),
      );

      return response.statusCode == 201 || response.statusCode == 200;
    } catch (e) {
      print('Error al subir documento: $e');
      return false;
    }
  }

  // Obtener historial de ajustes para un estudiante
static Future<List<Map<String, dynamic>>> getAdjustmentHistory(String studentId) async {
  try {
    final token = await getToken();
    final response = await _dio.get(
      '/adjustments/history/$studentId',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    if (response.statusCode == 200) {
      return List<Map<String, dynamic>>.from(response.data);
    }
    return [];
  } catch (e) {
    print('Error al obtener historial de ajustes: $e');
    return [];
  }
}

// Crear o actualizar un ajuste especial
static Future<bool> saveAdjustment(Map<String, dynamic> ajuste) async {
  try {
    final token = await getToken();
    // Si el ajuste tiene un ID, actualizarlo, si no, crear nuevo
    if (ajuste.containsKey('id') && ajuste['id'] != null) {
      final response = await _dio.put(
        '/adjustments/${ajuste['id']}',
        data: ajuste,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.statusCode == 200;
    } else {
      final response = await _dio.post(
        '/adjustments',
        data: ajuste,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.statusCode == 201 || response.statusCode == 200;
    }
  } catch (e) {
    print('Error al guardar ajuste: $e');
    return false;
  }
}

}
