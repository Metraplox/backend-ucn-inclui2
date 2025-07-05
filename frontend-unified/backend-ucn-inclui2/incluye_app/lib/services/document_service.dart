// services/document_service.dart
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'api_service.dart';
import 'package:incluye_app/models/document_model.dart';
import 'auth_service.dart';
import 'package:url_launcher/url_launcher.dart';

class DocumentService {
  static Future<Document?> uploadDocument(
    PlatformFile file,
    String studentId, {
    String description = '',
    String category = 'GENERAL',
    Function(int, int)? onSendProgress,
  }) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final isStudent = await _isStudent();

      final formData = FormData.fromMap({
        'file': MultipartFile.fromBytes(file.bytes!, filename: file.name),
        'studentId': studentId,
        'description': description,
        'category': category,
      });

      final endpoint =
          isStudent ? '/documents/upload/student' : '/documents/upload';

      final response = await ApiService.dio.post(
        endpoint,
        data: formData,
        onSendProgress: onSendProgress,
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        // La respuesta del backend puede estar anidada
        var responseData = response.data;
        if (responseData is Map<String, dynamic> &&
            responseData.containsKey('data')) {
          responseData = responseData['data'];
        }
        return Document.fromJson(responseData);
      }
      return null;
    } catch (e) {
      ApiService.handleApiError('Subir documento', e);
      return null;
    }
  }

  // Implementa tu método para verificar rol estudiante
  static Future<bool> _isStudent() async {
    final roles = await AuthService.getUserRoles();
    return roles.contains('ESTUDIANTE');
  }

  static Future<List<Document>> getStudentDocuments(
    String studentId, {
    String? category,
    String? status,
  }) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final queryParams = <String, dynamic>{};
      if (category != null) queryParams['category'] = category;
      if (status != null) queryParams['status'] = status;

      final response = await ApiService.dio.get(
        '/documents/student/$studentId',
        queryParameters: queryParams,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => Document.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      ApiService.handleApiError('Obtener documentos estudiante', e);
      return [];
    }
  }

  static Future<String?> getDocumentDownloadUrl(String documentId) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final response = await ApiService.dio.get(
        '/documents/$documentId/download',
      );

      if (response.statusCode == 200 && response.data['fileUrl'] != null) {
        return response.data['fileUrl'];
      }
      return null;
    } catch (e) {
      ApiService.handleApiError('Obtener URL de descarga', e);
      return null;
    }
  }

  static Future<Document?> verifyDocument(
    String documentId, {
    String comments = '',
  }) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final response = await ApiService.dio.patch(
        '/documents/verify/$documentId',
        data: {'comments': comments},
      );

      if (response.statusCode == 200) {
        return Document.fromJson(response.data);
      }
      return null;
    } catch (e) {
      ApiService.handleApiError('Verificar documento', e);
      return null;
    }
  }

  static Future<Document?> rejectDocument(
    String documentId, {
    String comments = '',
  }) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final response = await ApiService.dio.patch(
        '/documents/reject/$documentId',
        data: {'comments': comments},
      );

      if (response.statusCode == 200) {
        return Document.fromJson(response.data);
      }
      return null;
    } catch (e) {
      ApiService.handleApiError('Rechazar documento', e);
      return null;
    }
  }

  static Future<bool> deleteDocument(String documentId) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final response = await ApiService.dio.delete('/documents/$documentId');

      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      ApiService.handleApiError('Eliminar documento', e);
      return false;
    }
  }

  static Future<String?> getDocumentTemplateUrl(String templateType) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final response = await ApiService.dio.get(
        '/documents/templates/$templateType',
      );

      if (response.statusCode == 200) {
        return response.data['url'];
      }
      return null;
    } catch (e) {
      ApiService.handleApiError('Obtener URL plantilla', e);
      return null;
    }
  }

  /// Obtiene todos los documentos pendientes de revisión
  static Future<List<Document>> getPendingDocuments() async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final response = await ApiService.dio.get('/documents/pending');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List<dynamic>;
        return data
            .map((json) => Document.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      ApiService.handleApiError('getPendingDocuments', e);
      return [];
    }
  }

  // Nuevo método para descargar el formulario de consentimiento
  static Future<void> downloadConsentForm() async {
    const String endpoint = '/documents/templates/consent-form';
    final String url = '${ApiService.dio.options.baseUrl}$endpoint';

    final Uri uri = Uri.parse(url);

    if (await canLaunchUrl(uri)) {
      await launchUrl(
        uri,
        mode: LaunchMode.externalApplication, // Abre en navegador externo
      );
    } else {
      throw 'No se pudo abrir la URL: $url';
    }
  }
}
