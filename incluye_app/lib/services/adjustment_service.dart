import 'package:dio/dio.dart';
import 'package:incluye_app/models/courseWithAdjustment_model.dart';
import 'package:incluye_app/models/course_model.dart';
import 'package:incluye_app/models/studentAdjustment.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/services/student_service.dart';
import 'api_service.dart';
import 'package:incluye_app/models/adjustment_model.dart'; // Ajusta según tu estructura
import 'package:incluye_app/models/document_model.dart'; // Ajusta según tu estructura

class AdjustmentService {

    // ✅ MODIFICADO: Ahora acepta el Map del DTO directamente
  static Future<bool> saveAdjustment(Map<String, dynamic> adjustmentDto) async {
    try {
      final endpoint = '/adjustments';
      final response = await ApiService.dio.post(endpoint, data: adjustmentDto);
      return response.statusCode == 201;
    } catch (e) {
      ApiService.handleApiError('Guardar ajuste', e);
      if (e is DioException && e.response?.data?['message'] != null) {
        // Propaga el mensaje de error del backend
        throw Exception(e.response!.data['message']);
      }
      throw Exception('No se pudo guardar el ajuste.');
    }
  }

  
   /// Edita un ajuste específico dentro de un documento de ajuste.
  static Future<bool> editSpecificAdjustment({
    required String docId,
    required int adjustmentIndex,
    required Map<String, dynamic> data,
  }) async {
    try {
      // ✅ IMPORTANTE: Este endpoint debe existir en tu backend.
      // Ej: PATCH /adjustments/{docId}/current/{adjustmentIndex}
      final response = await ApiService.dio.patch(
        '/adjustments/$docId/current/$adjustmentIndex',
        data: data,
      );
      return response.statusCode == 200;
    } catch (e) {
      ApiService.handleApiError('editSpecificAdjustment', e);
      rethrow;
    }
  }

   // ✅ NUEVO: Este método coincide con tu endpoint PATCH /adjustments/:id
  static Future<bool> updateAdjustmentDocument(String docId, Map<String, dynamic> data) async {
    try {
      final response = await ApiService.dio.patch('/adjustments/$docId', data: data);
      return response.statusCode == 200;
    } catch (e) {
      ApiService.handleApiError('updateAdjustmentDocument', e);
      rethrow;
    }
  }

  // ✅ NUEVO: Para obtener las categorías
  static Future<List<Map<String, dynamic>>> getAdjustmentCategories() async {
    try {
      final response = await ApiService.dio.get('/categories');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data']['data'];
        return List<Map<String, dynamic>>.from(data);
      }
      return [];
    } catch (e) {
      ApiService.handleApiError('Obtener categorías de ajustes', e);
      return [];
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

  

  

  static Future<List<Map<String, dynamic>>> getAdjustmentDocumentsRaw(String studentId) async {
    try {
      final response = await ApiService.dio.get('/adjustments/student/$studentId');
      if (response.statusCode == 200) {
        final List<dynamic> docsJson = response.data['data']['data'];
        return List<Map<String, dynamic>>.from(docsJson);
      }
      return [];
    } catch (e) {
      ApiService.handleApiError('getAdjustmentDocumentsRaw', e);
      return [];
    }
  }

  /// Obtiene una lista aplanada de todos los ajustes para un estudiante.
  /// Usa tu modelo 'Adjustment' antiguo.
  static Future<List<Adjustment>> getAdjustmentHistory(String studentId, {bool? active}) async {
    try {
      final List<Map<String, dynamic>> adjustmentsDocs = await getAdjustmentDocumentsRaw(studentId);
        
      List<Adjustment> allCurrentAdjustments = [];
      for (var doc in adjustmentsDocs) {
        if (doc['currentAdjustments'] != null && doc['currentAdjustments'] is List) {
          final List<dynamic> currentList = doc['currentAdjustments'];
          // Mapeamos cada sub-ajuste al modelo 'Adjustment'
          allCurrentAdjustments.addAll(
            currentList.map((adj) => Adjustment.fromJson(adj as Map<String, dynamic>))
          );
        }
      }

      if (active == true) {
        return allCurrentAdjustments.where((adj) => adj.isActive).toList();
      }
      return allCurrentAdjustments;
    } catch (e) {
      ApiService.handleApiError('getAdjustmentHistory', e);
      return [];
    }
  }

  /// Cambia el estado de un ajuste específico (ej: a 'cancelado').
  static Future<bool> updateAdjustmentStatus({
    required String adjustmentDocId,
    required int adjustmentIndex,
    required String newStatus,
    String? comments,
  }) async {
    try {
      final response = await ApiService.dio.patch(
        '/adjustments/$adjustmentDocId/status/$newStatus',
        queryParameters: {'adjustmentIndex': adjustmentIndex},
        data: {if (comments != null) 'comments': comments},
      );
      return response.statusCode == 200;
    } catch (e) {
      ApiService.handleApiError('updateAdjustmentStatus', e);
      rethrow;
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



  static Future<void> setReadAdjustment(
    String adjustmentId,
    int index, {
    String? comments,
  }) async {
    final token = await ApiService.getToken();
    if (token == null) throw Exception('Token nulo');
    final dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000'));
    final response = await dio.patch(
      '/adjustments/${adjustmentId}/read',
      queryParameters: {'adjustmentIndex': index},
      data: comments != null ? {'comments': comments} : null,
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
        '/adjustments/course/$courseNrc',
        options: Options(
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
      );
      final List<dynamic> data = response.data['data']['data'] ?? [];
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

  static Future<List<StudentAdjustment>> getStudentAdjustments(
    String idStudent,
  ) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) {
        throw Exception('Token nulo');
      }
      final response = await ApiService.dio.get(
        '/adjustments/student/${idStudent}',
      );
      if (response.statusCode == 200) {
        final responseData = response.data;
        final List<dynamic> dataList = responseData['data']['data'];
        return dataList
            .map((json) => StudentAdjustment.fromJson(json))
            .toList();
      } else {
        throw Exception('Error al obtener los ajustes');
      }
    } catch (e) {
      print('Error en getStudentAdjustment');
      rethrow;
    }
  }
  
}
