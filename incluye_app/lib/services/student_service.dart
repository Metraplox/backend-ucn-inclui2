// services/student_service.dart
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:developer';
import 'package:jwt_decoder/jwt_decoder.dart';

import 'package:incluye_app/models/user_model.dart'; // Ajusta según tu estructura
import 'package:incluye_app/models/student_model.dart'; // Ajusta según tu estructura

class StudentService {
  static final Dio _dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000'));

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static void _ensureInitialized() {
    // Si necesitas algo antes de cada llamada, ponlo aquí (ej: configuración global)
  }

  // ---------------------- USUARIO ----------------------

  static Future<User?> getUserProfile() async {
    try {
      _ensureInitialized();
      final token = await getToken();
      if (token == null) return null;

      final response = await _dio.get(
        '/users/profile',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (response.statusCode == 200) {
        final userData = response.data;
        userData['token'] = token;
        return User.fromJson(userData);
      } else {
        log('Error al obtener perfil de usuario: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      log('Error al obtener perfil de usuario: $e');
      return null;
    }
  }

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
  static Future<bool> isTeacher() async {
    final roles = await getUserRoles();
    return roles.contains('docente');
  }

  static Future<User?> getCurrentUserInfo() async {
    try {
      final userProfile = await getUserProfile();

      if (userProfile != null) {
        if (userProfile.roles.contains('estudiante')) {
          final studentProfile = await getStudentProfile();

          if (studentProfile != null) {
            return User(
              id: userProfile.id,
              email: userProfile.email,
              nombre: '${studentProfile.nombres} ${studentProfile.apellidos}',
              rol: 'estudiante',
              token: userProfile.token,
              departamento: studentProfile.carrera,
            );
          }
        }
        return userProfile;
      }
    } catch (e) {
      log('Error al obtener información del usuario: $e');
    }

    final token = await getToken();
    if (token != null) {
      try {
        final decodedToken = JwtDecoder.decode(token);
        final userId = decodedToken['sub'];

        if (decodedToken['roles'].contains('estudiante')) {
          final studentData = await getStudentById(userId);
          if (studentData != null) {
            return User(
              id: userId,
              email: decodedToken['email'] ?? '',
              nombre: '${studentData.nombres} ${studentData.apellidos}',
              rol: 'estudiante',
              token: token,
            );
          }
        }

        String rol = 'usuario';
        if (decodedToken['roles'] is List && decodedToken['roles'].isNotEmpty) {
          rol = decodedToken['roles'][0].toString();
        }

        return User(
          id: userId,
          email: decodedToken['email'] ?? '',
          nombre: decodedToken['nombre'] ?? decodedToken['name'] ?? '',
          rol: rol,
          token: token,
        );
      } catch (e) {
        log('Error al obtener información del usuario desde JWT: $e');
      }
    }
    return null;
  }

  // ---------------------- ESTUDIANTE ----------------------

  static Future<Student?> getStudentProfile() async {
    try {
      _ensureInitialized();
      final token = await getToken();
      if (token == null) return null;

      final response = await _dio.get(
        '/students/profile',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (response.statusCode == 200) {
        return Student.fromJson(response.data);
      } else if (response.statusCode == 404) {
        log('No existe un perfil de estudiante para este usuario');
        return null;
      } else {
        log('Error al obtener perfil académico: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      log('Error al obtener perfil académico: $e');
      return null;
    }
  }

  static Future<List<Student>> getAllStudents() async {
    try {
      final token = await getToken();
      final response = await _dio.get(
        '/students',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      final List<dynamic> data = response.data;
      return data.map((item) => Student.fromJson(item)).toList();
    } catch (e) {
      log('Error al obtener estudiantes: $e');
      return [];
    }
  }

  static Future<bool> deleteStudent(String id) async {
    try {
      final token = await getToken();
      await _dio.delete(
        '/students/$id',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return true;
    } catch (e) {
      log('Error al eliminar estudiante: $e');
      return false;
    }
  }

  static Future<Student?> getStudentById(String id) async {
    try {
      final token = await getToken();
      final response = await _dio.get(
        '/students/$id',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return Student.fromJson(response.data);
    } catch (e) {
      log('Error al obtener estudiante: $e');
      return null;
    }
  }

  static Future<bool> updateStudent(String? id, Student student) async {
    if (id == null) {
      log('Error: ID de estudiante es nulo');
      return false;
    }

    final token = await getToken();
    try {
      final response = await _dio.patch(
        '/students/$id',
        data: student.toJson(),
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.statusCode == 200;
    } catch (e) {
      log('Error al actualizar estudiante: $e');
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
      log('Error al crear estudiante: $e');
      return false;
    }
  }
}
