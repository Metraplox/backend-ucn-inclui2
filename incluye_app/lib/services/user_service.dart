import 'package:dio/dio.dart';
import 'package:incluye_app/models/user_model.dart';
import 'package:incluye_app/models/fullUser_model.dart';
import 'package:incluye_app/services/api_service.dart';

class UserService {
  // =======================================================================
  // MÉTODO getAllUsers CORREGIDO
  // =======================================================================
  static Future<List<User>> getAllUsers() async {
    try {
      final response = await ApiService.dio.get('/users');

      if (response.statusCode == 200) {
        // --- INICIO DE LA CORRECCIÓN ---
        // La respuesta de la API está anidada. La ruta a la lista es: data -> data -> [lista]
        final Map<String, dynamic> responseBody = response.data;
        final Map<String, dynamic> nestedData = responseBody['data'];
        final List<dynamic> userJsonList = nestedData['data'];
        // --- FIN DE LA CORRECCIÓN ---
        
        return userJsonList
            .map((json) => User.fromJson(json as Map<String, dynamic>))
            .toList();

      } else {
        throw Exception('Error al obtener la lista de usuarios: ${response.statusCode}');
      }
    } on DioException catch (e) {
      ApiService.handleApiError('UserService.getAllUsers', e);
      final errorMsg = e.response?.data?['message'] ?? e.message;
      throw Exception('Fallo al cargar usuarios: $errorMsg');
    } catch (e) {
      print('Error inesperado en getAllUsers: $e');
      throw Exception('Ocurrió un error inesperado al procesar la respuesta.');
    }
  }

  // =======================================================================
  // MÉTODO getUserById CORREGIDO (Proactivamente)
  // =======================================================================
  static Future<FullUser> getUserById(String userId) async {
    try {
      final response = await ApiService.dio.get('/users/$userId');
      if (response.statusCode == 200) {
        // --- INICIO DE LA CORRECCIÓN ---
        // Asumimos la misma estructura anidada para un solo usuario.
        // La ruta al objeto de usuario es: data -> data -> {usuario}
        final Map<String, dynamic> responseBody = response.data;
        final Map<String, dynamic> nestedData = responseBody['data'];
        final Map<String, dynamic> userJson = nestedData['data'];
        // --- FIN DE LA CORRECCIÓN ---

        return FullUser.fromJson(userJson);
      } else {
        throw Exception('Error al obtener los detalles del usuario: ${response.statusCode}');
      }
    } on DioException catch (e) {
      ApiService.handleApiError('UserService.getUserById', e);
      throw Exception('Fallo al cargar el usuario: ${e.message}');
    }
  }
  
  // Acepta un MAP con los datos a actualizar (ideal para PATCH)
  static Future<bool> updateUser(String userId, Map<String, dynamic> userData) async {
    try {
      final response = await ApiService.dio.patch(
        '/users/$userId',
        data: userData,
      );
      // La respuesta de PATCH podría ser diferente, si falla, necesitaríamos ver su JSON
      return response.statusCode == 200;
    } on DioException catch (e) {
      ApiService.handleApiError('UserService.updateUser', e);
      return false;
    }
  }

  // Eliminar un usuario
  static Future<bool> deleteUser(String userId) async {
    try {
      final response = await ApiService.dio.delete('/users/$userId');
      return response.statusCode == 200 || response.statusCode == 204;
    } on DioException catch (e) {
      ApiService.handleApiError('UserService.deleteUser', e);
      return false;
    }
  }
  
   static Future<bool> registerUser(Map<String, dynamic> userData) async {
    try {
      // El endpoint de registro puede que no necesite el token de autorización,
      // pero si es una creación de admin, el interceptor ya lo maneja.
      final response = await ApiService.dio.post('/auth/register', data: userData);

      // Un código 201 (Created) es el éxito esperado
      if (response.statusCode == 201 || response.statusCode == 200) {
        print("Usuario registrado exitosamente");
        return true;
      } else {
        print("Error al registrar usuario: ${response.statusCode}");
        return false;
      }
    } on DioException catch (e) {
      // Intentar obtener un mensaje de error más específico del backend
      final errorMessage = e.response?.data?['message'] ?? 'Fallo al registrar usuario';
      print("Error Dio en registerUser: $errorMessage");
      // Lanzar una excepción con el mensaje del backend para mostrarlo en la UI
      throw Exception(errorMessage);
    } catch (e) {
      print("Error inesperado en registerUser: $e");
      throw Exception('Ocurrió un error inesperado');
    }
  }
}