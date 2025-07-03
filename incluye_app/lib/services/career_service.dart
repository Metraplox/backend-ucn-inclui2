// services/career_service.dart
import 'package:dio/dio.dart';
import 'package:incluye_app/models/career_model.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/services/auth_service.dart';
import 'package:incluye_app/services/student_service.dart';
import 'api_service.dart'; // Usaremos la instancia de Dio de ApiService

class CareerService {
  static Future<List<Career>> getAllCareers() async {
    print("CareerService: Solicitando todas las carreras (/careers)");
    try {
      // ApiService.dio ya tiene el interceptor para el token
      final response = await ApiService.dio.get('/careers');
      print(
        "CareerService: Respuesta de /careers - StatusCode: ${response.statusCode}",
      );

      if (response.statusCode == 200) {
        final responseBody = response.data;
        // Asumimos que el backend envuelve la lista de carreras en { success: ..., data: [CAREER_LIST] }
        // Si no es así y devuelve la lista directamente, ajusta esto.
        if (responseBody is Map &&
            responseBody.containsKey('success') &&
            responseBody['success'] == true &&
            responseBody.containsKey('data')) {
          final innerData = responseBody['data'];
          if (innerData is Map &&
              innerData.containsKey('success') &&
              innerData['success'] == true &&
              innerData.containsKey('data') &&
              innerData['data'] is List) {
            final List<dynamic> careerListJson =
                innerData['data'] as List<dynamic>;
            print(
              "CareerService: Lista de carreras obtenida y desanidada exitosamente. Cantidad: ${careerListJson.length}",
            );
            return careerListJson
                .map((json) => Career.fromJson(json as Map<String, dynamic>))
                .toList();
          } else {
            return [];
          }
        }
        // Fallback si la API devuelve la lista directamente (sin el wrapper 'success' y 'data')
        else if (responseBody is List) {
          print(
            "CareerService: Lista de carreras obtenida directamente. Cantidad: ${responseBody.length}",
          );
          return responseBody
              .map((json) => Career.fromJson(json as Map<String, dynamic>))
              .toList();
        } else {
          print(
            "CareerService: Error - La respuesta de /careers no tiene la estructura esperada. Data: $responseBody",
          );
          return [];
        }
      } else {
        print(
          'CareerService: Error al obtener carreras: ${response.statusCode}, Data: ${response.data}',
        );
        return [];
      }
    } on DioException catch (e) {
      print('CareerService: DioException al obtener carreras: ${e.message}');
      ApiService.handleApiError('getAllCareers DioException', e);
      return [];
    } catch (e, s) {
      print('CareerService: Excepción general al obtener carreras: $e');
      print('CareerService: Stacktrace: $s');
      return [];
    }
  }

  // Si necesitas getCareerById en el futuro, puedes añadirlo aquí.
  static Future<Career?> getCareerById(String id) async {
    print("CareerService: Solicitando carrera por ID: $id");
    try {
      final response = await ApiService.dio.get('/careers/$id');
      print(
        "CareerService: Respuesta de /careers/$id - StatusCode: ${response.statusCode}",
      );
      if (response.statusCode == 200) {
        final responseBody = response.data;
        // El endpoint /careers/:id parece devolver el objeto carrera directamente o envuelto
        if (responseBody is Map &&
            responseBody.containsKey('success') &&
            responseBody['success'] == true &&
            responseBody.containsKey('data') &&
            responseBody['data'] is Map) {
          return Career.fromJson(
            responseBody['data']['data'] as Map<String, dynamic>,
          );
        } else if (responseBody is Map<String, dynamic> &&
            !responseBody.containsKey('success')) {
          return Career.fromJson(responseBody);
        } else {
          print(
            "CareerService: getCareerById - Estructura de respuesta inesperada. Data: $responseBody",
          );
          return null;
        }
      } else {
        return null;
      }
    } catch (e) {
      ApiService.handleApiError('getCareerById', e);
      return null;
    }
  }

  static Future<List<dynamic>> getTeachersByCareer() async {
    final token = await ApiService.getToken();
    try {
      final response = await ApiService.dio.get(
        '/heads/my-teachers',
        options: Options(
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
      );
      if (response.statusCode == 200) {
        final responseBody = response.data;
        if (responseBody is Map &&
            responseBody.containsKey('data') &&
            responseBody['data'] is Map &&
            responseBody['data']['data'] is List) {
          final List<dynamic> teacherList = responseBody['data']['data'];
          return teacherList;
        } else {
          print("CareerService GetTeachersByCareer error");
          return [];
        }
      } else {
        return [];
      }
    } catch (e) {
      return [];
    }
  }

  static Future<List<dynamic>> getAllTeachers() async {
    final token = await ApiService.getToken();
    if (token != null) {
      try {
        final response = await ApiService.dio.get(
          '/users/teachers',
          options: Options(
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
            },
          ),
        );
        final responseData = response.data;
        final List<dynamic> teacherList = response.data['data']['data'];

        return teacherList;
      } catch (e) {
        throw Exception("Error al obtener los profesores: $e");
      }
    }
    return [];
  }
}
