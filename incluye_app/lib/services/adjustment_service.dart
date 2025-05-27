
import 'dart:developer';
import 'package:dio/dio.dart';
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
        options: ApiService.authHeaders(token),
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
      final endpoint = isUpdate ? '/adjustments/${adjustment.id}' : '/adjustments';

      final Response response = isUpdate
          ? await ApiService.dio.put(
              endpoint,
              data: adjustment.toJson(),
              options: ApiService.authHeaders(token),
            )
          : await ApiService.dio.post(
              endpoint,
              data: adjustment.toJson(),
              options: ApiService.authHeaders(token),
            );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      ApiService.handleApiError('Guardar ajuste', e);
      return false;
    }
  }

  static Future<bool> associateDocumentToAdjustment(String adjustmentId, String documentId) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final response = await ApiService.dio.post(
        '/adjustments/$adjustmentId/documents',
        data: {'documentId': documentId},
        options: ApiService.authHeaders(token),
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      ApiService.handleApiError('Asociar documento con ajuste', e);
      return false;
    }
  }

  static Future<List<Document>> getAdjustmentDocuments(String adjustmentId) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final response = await ApiService.dio.get(
        '/adjustments/$adjustmentId/documents',
        options: ApiService.authHeaders(token),
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

  static Future<bool> updateAdjustmentStatus(String adjustmentId, String status) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final response = await ApiService.dio.patch(
        '/adjustments/$adjustmentId/status',
        data: {'status': status.toUpperCase()},
        options: ApiService.authHeaders(token),
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

      final response = await ApiService.dio.delete(
        '/adjustments/$id',
        options: ApiService.authHeaders(token),
      );

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

      final response = await ApiService.dio.get(
        '/adjustments/categories',
        options: ApiService.authHeaders(token),
      );

      if (response.statusCode == 200) {
        return List<Map<String, dynamic>>.from(response.data);
      }
      return [];
    } catch (e) {
      ApiService.handleApiError('Obtener categorías ajustes', e);
      return [];
    }
  }
}
