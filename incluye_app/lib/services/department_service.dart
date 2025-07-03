import 'package:dio/dio.dart';
import 'package:incluye_app/models/department_model.dart';
import 'package:incluye_app/services/api_service.dart';

class DepartmentService {
  static Future<List<Department>> getDepartments() async {
    final token = ApiService.getToken();
    try {
      final response = await ApiService.dio.get(
        '/departments',
        options: Options(
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
      );
      if (response.statusCode == 200) {
        final List<dynamic> dataList = response.data['data']['data'];
        return dataList.map((json) => Department.fromJson(json)).toList();
      } else {
        throw Exception(
          'Error al obtener los departamentos: codigo ${response.statusCode}',
        );
      }
    } catch (e) {
      print('Error en getDepartments: $e');
      rethrow;
    }
  }
}
