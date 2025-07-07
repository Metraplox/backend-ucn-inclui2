import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:incluye_app/config/app_config.dart';
import 'package:incluye_app/services/auth_service.dart';

class UserManagementService {
  static Future<List<Map<String, dynamic>>> getAllUsers() async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/users'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> userData = jsonDecode(response.body);
        return userData.cast<Map<String, dynamic>>();
      } else {
        throw Exception('Error al obtener usuarios: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al obtener usuarios: $e');
    }
  }

  static Future<Map<String, dynamic>> createUser({
    required String email,
    required String nombreCompleto,
    required List<String> roles,
    String? password,
    Map<String, dynamic>? additionalResponsibilities,
  }) async {
    try {
      final token = await AuthService.getToken();
      
      // Si es estudiante y no se proporciona contraseña, generar una por defecto
      final userData = {
        'email': email,
        'nombreCompleto': nombreCompleto,
        'roles': roles,
        if (password != null) 'password': password,
        if (additionalResponsibilities != null) 'additionalResponsibilities': additionalResponsibilities,
      };

      final response = await http.post(
        Uri.parse('${AppConfig.apiBaseUrl}/auth/register'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(userData),
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al crear usuario: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      throw Exception('Error al crear usuario: $e');
    }
  }

  static Future<Map<String, dynamic>> updateUser(String userId, Map<String, dynamic> updateData) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.patch(
        Uri.parse('${AppConfig.apiBaseUrl}/users/$userId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(updateData),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al actualizar usuario: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      throw Exception('Error al actualizar usuario: $e');
    }
  }

  static Future<void> deleteUser(String userId) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.delete(
        Uri.parse('${AppConfig.apiBaseUrl}/users/$userId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode != 204) {
        throw Exception('Error al eliminar usuario: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      throw Exception('Error al eliminar usuario: $e');
    }
  }

  static Future<Map<String, dynamic>> getUserById(String userId) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/users/$userId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al obtener usuario: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al obtener usuario: $e');
    }
  }

  // Función auxiliar para generar contraseña basada en fecha de nacimiento
  static String generateStudentPassword(DateTime birthDate) {
    final day = birthDate.day.toString().padLeft(2, '0');
    final month = birthDate.month.toString().padLeft(2, '0');
    final year = birthDate.year.toString();
    return '$day$month$year';
  }

  // Obtener roles disponibles
  static List<String> getAvailableRoles() {
    return [
      'ESTUDIANTE',
      'DOCENTE',
      'COORDINADOR',
      'EDUCADORA_SOCIAL',
      'JEFE_CARRERA',
      'JEFE_DEPARTAMENTO',
      'DIDDEC_STAFF',
    ];
  }

  // Obtener responsabilidades adicionales disponibles
  static Map<String, String> getAdditionalResponsibilities() {
    return {
      'isDepartmentHead': 'Jefe de Departamento',
      'isCareerHead': 'Jefe de Carrera',
      'isDIDDECStaff': 'Personal DIDDEC',
      'isSocialEducator': 'Educadora Social',
    };
  }
}
