import 'package:dio/dio.dart';
import 'package:incluye_app/models/fullUser_model.dart';
import 'package:incluye_app/services/api_service.dart';

class UserService {
  static Future<void> deleteUser(String userId) async {
    final token = await ApiService.getToken();

    try {
      final response = await ApiService.dio.delete(
        '/users/$userId',
        options: Options(
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
      );
      if (response.statusCode == 200 || response.statusCode == 204) {
        print("eliminacion de profesor exitosa");
      } else {
        throw Exception("Error al eliminar profesor: ${response.statusCode}");
      }
    } catch (e) {
      print("error al eliminar profesor $e");
      rethrow;
    }
  }

  static Future<bool> updateUser(String userId, FullUser usuario) async {
    final token = await ApiService.getToken();
    try {
      final response = await ApiService.dio.patch(
        '/users/$userId',
        options: Options(
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
        data: usuario.toJson(),
      );
      print(usuario.toJson());
      if (response.statusCode == 200 || response.statusCode == 204) {
        print("edicion de user exitoso");
        return true;
      } else {
        print("Error al editar usuario: ${response.statusCode}");
      }
      return false;
    } catch (e) {
      throw Exception("No se pudo editar el usuario");
    }
  }
  
}
