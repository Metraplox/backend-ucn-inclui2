// services/document_service.dart
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'api_service.dart';
import 'package:incluye_app/models/document_model.dart';

class DocumentService {
  static Future<Document?> uploadDocument(
    PlatformFile
    pickedFile, // <-- Usamos PlatformFile, compatible con todas las plataformas
    String studentId, {
    String documentType = 'general',
    String description = '',
    String category = 'GENERAL',
  }) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final isStudent = await _isStudent();

      MultipartFile multipartFile;

      if (kIsWeb) {
        // Web o escritorio
        if (pickedFile.bytes == null)
          throw Exception('Bytes nulos en plataforma Web/PC');
        multipartFile = MultipartFile.fromBytes(
          pickedFile.bytes!,
          filename: pickedFile.name,
        );
      } else {
        // Android / iOS
        if (pickedFile.path == null)
          throw Exception('Ruta nula en Android/iOS');
        multipartFile = await MultipartFile.fromFile(
          pickedFile.path!,
          filename: pickedFile.name,
        );
      }

      final formData = FormData.fromMap({
        'file': multipartFile,
        'studentId': studentId,
        'documentType': documentType,
        'description': description,
        'category': category,
      });

      final endpoint =
          isStudent ? '/documents/student/upload' : '/documents/upload';

      final response = await ApiService.dio.post(endpoint, data: formData);

      if (response.statusCode == 201 || response.statusCode == 200) {
        return Document.fromJson(response.data);
      }
      return null;
    } catch (e) {
      ApiService.handleApiError('Subir documento', e);
      return null;
    }
  }

  // Implementa tu método para verificar rol estudiante
  static Future<bool> _isStudent() async {
    // Aquí tu lógica para verificar el rol del usuario
    // Ejemplo: obtener rol desde SharedPreferences o API
    return true; // placeholder
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
}
