import 'package:incluye_app/models/user_model.dart';
import 'package:incluye_app/services/api_service.dart';

class UserService {
  // 1. Obtener todos los usuarios
  static Future<List<User>> getUsers() async {
    try {
      final response = await ApiService.dio.get('/users');
      if (response.statusCode == 200) {
        // La respuesta del backend puede estar anidada
        var responseData = response.data;
        if (responseData is Map<String, dynamic> &&
            responseData.containsKey('data')) {
          responseData = responseData['data'];
        }

        List<dynamic> userList = responseData;
        return userList.map((json) => User.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      ApiService.handleApiError('Obtener usuarios', e);
      return [];
    }
  }

  // 2. Crear un nuevo usuario
  static Future<User?> createUser(Map<String, dynamic> userData) async {
    try {
      final response = await ApiService.dio.post('/users', data: userData);
      if (response.statusCode == 201) {
        // La respuesta del backend puede estar anidada
        var responseData = response.data;
        if (responseData is Map<String, dynamic> &&
            responseData.containsKey('data')) {
          responseData = responseData['data'];
        }
        return User.fromJson(responseData);
      }
      return null;
    } catch (e) {
      ApiService.handleApiError('Crear usuario', e);
      return null;
    }
  }

  // 3. Actualizar un usuario existente
  static Future<User?> updateUser(
    String id,
    Map<String, dynamic> userData,
  ) async {
    try {
      final response = await ApiService.dio.patch('/users/$id', data: userData);
      if (response.statusCode == 200) {
        // La respuesta del backend puede estar anidada
        var responseData = response.data;
        if (responseData is Map<String, dynamic> &&
            responseData.containsKey('data')) {
          responseData = responseData['data'];
        }
        return User.fromJson(responseData);
      }
      return null;
    } catch (e) {
      ApiService.handleApiError('Actualizar usuario', e);
      return null;
    }
  }

  // 4. Eliminar un usuario
  static Future<bool> deleteUser(String id) async {
    try {
      final response = await ApiService.dio.delete('/users/$id');
      return response.statusCode == 204 || response.statusCode == 200;
    } catch (e) {
      ApiService.handleApiError('Eliminar usuario', e);
      return false;
    }
  }

  // 5. Cambiar contraseña de un usuario (Admin)
  static Future<bool> adminSetPassword(
    String userId,
    String newPassword,
  ) async {
    try {
      final response = await ApiService.dio.post(
        '/users/$userId/admin-change-password',
        data: {'newPassword': newPassword},
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      ApiService.handleApiError('Cambiar contraseña (admin)', e);
      return false;
    }
  }
}
