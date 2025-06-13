import 'package:dio/dio.dart';
import 'package:incluye_app/models/courseWithAdjustment_model.dart';
import 'package:incluye_app/models/course_model.dart';
import 'package:incluye_app/models/studentAdjustment.dart';
import 'package:incluye_app/models/student_model.dart';
import 'api_service.dart';
import 'package:incluye_app/models/adjustment_model.dart'; // Ajusta según tu estructura
import 'package:incluye_app/models/document_model.dart'; // Ajusta según tu estructura

class AdjustmentService {
  static Future<List<Adjustment>> getAdjustmentHistory(
    String studentId, {
    bool? active,
    String? courseNrc,
    String? semester,
  }) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final queryParams = <String, dynamic>{};
      if (active != null) queryParams['active'] = active.toString();
      if (courseNrc != null) queryParams['courseNrc'] = courseNrc;
      if (semester != null) queryParams['semester'] = semester;

      final response = await ApiService.dio.get(
        '/adjustments/student/$studentId',
        queryParameters: queryParams,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => Adjustment.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      ApiService.handleApiError('Obtener historial ajustes', e);
      return [];
    }
  }

  static Future<bool> saveAdjustment(Adjustment adjustment) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final isUpdate = adjustment.id != null;
      final endpoint =
          isUpdate ? '/adjustments/${adjustment.id}' : '/adjustments';

      final Response response =
          isUpdate
              ? await ApiService.dio.put(endpoint, data: adjustment.toJson())
              : await ApiService.dio.post(endpoint, data: adjustment.toJson());

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      ApiService.handleApiError('Guardar ajuste', e);
      return false;
    }
  }

  static Future<bool> associateDocumentToAdjustment(
    String adjustmentId,
    String documentId,
  ) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final response = await ApiService.dio.post(
        '/adjustments/$adjustmentId/documents',
        data: {'documentId': documentId},
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      ApiService.handleApiError('Asociar documento con ajuste', e);
      return false;
    }
  }

  static Future<List<Document>> getAdjustmentDocuments(
    String adjustmentId,
  ) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final response = await ApiService.dio.get(
        '/adjustments/$adjustmentId/documents',
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => Document.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      ApiService.handleApiError('Obtener documentos ajuste', e);
      return [];
    }
  }

  static Future<bool> updateAdjustmentStatus(
    String adjustmentId,
    String status,
  ) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final response = await ApiService.dio.patch(
        '/adjustments/$adjustmentId/status',
        data: {'status': status.toUpperCase()},
      );

      return response.statusCode == 200;
    } catch (e) {
      ApiService.handleApiError('Actualizar estado ajuste', e);
      return false;
    }
  }

  static Future<bool> deleteAdjustment(String id) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final response = await ApiService.dio.delete('/adjustments/$id');

      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      ApiService.handleApiError('Eliminar ajuste', e);
      return false;
    }
  }

  static Future<List<Map<String, dynamic>>> getAdjustmentCategories() async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final response = await ApiService.dio.get('/adjustments/categories');

      if (response.statusCode == 200) {
        return List<Map<String, dynamic>>.from(response.data);
      }
      return [];
    } catch (e) {
      ApiService.handleApiError('Obtener categorías ajustes', e);
      return [];
    }
  }

  static Future<void> setReadAdjustment(String adjustmentId) async {
    final token = await ApiService.getToken();
    if (token == null) throw Exception('Token nulo');
    final dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000'));
    final response = await dio.patch(
      '/teachers/adjustments/${adjustmentId}/acknowledge',
      options: Options(
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ),
    );
    if (response.statusCode != 200) {
      throw Exception(
        'Error al confirmar lectura del ajuste: ${response.data}',
      );
    }
  }

  static Future<List<StudentAdjustment>> getCourseAdjustments(
    String courseNrc,
  ) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');
      final dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000'));
      final response = await dio.get(
        '/teachers/adjustments/my-courses/$courseNrc',
        options: Options(
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
      );
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((json) => StudentAdjustment.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Error al obtener cursos.$e');
    }
  }

  static Future<List<CourseAdjustment>> getAdjustmenBySubject(
    String IdSubject,
  ) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');
      final dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000'));
      final response = await dio.get(
        '/teachers/adjustments/my-courses/${IdSubject}',
        options: Options(
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
      );
      if (response.statusCode == 200) {
        final List data = response.data['data'];

        return data.map((json) => CourseAdjustment.fromJson(json)).toList();
      } else {
        throw Exception('Error al cargar los cursos');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }
}
