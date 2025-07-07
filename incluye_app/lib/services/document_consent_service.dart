import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:incluye_app/config/app_config.dart';
import 'package:incluye_app/services/auth_service.dart';

class ConsentService {
  static Future<Map<String, dynamic>> getStudentConsent(String studentId) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/consent/student/$studentId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al obtener consentimiento: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al obtener consentimiento: $e');
    }
  }

  static Future<Map<String, dynamic>> updateConsent({
    required String studentId,
    required bool allowTeachers,
    required List<String> allowedCourses,
    String? restrictions,
  }) async {
    try {
      final token = await AuthService.getToken();
      final body = {
        'allowTeachers': allowTeachers,
        'allowedCourses': allowedCourses,
        if (restrictions != null) 'restrictions': restrictions,
      };

      final response = await http.patch(
        Uri.parse('${AppConfig.apiBaseUrl}/consent/student/$studentId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al actualizar consentimiento: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al actualizar consentimiento: $e');
    }
  }

  static Future<Uint8List> downloadConsentForm(String studentId) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/consent/download/$studentId'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return response.bodyBytes;
      } else {
        throw Exception('Error al descargar formulario: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al descargar formulario: $e');
    }
  }

  static Future<Map<String, dynamic>> uploadSignedConsent({
    required String studentId,
    required Uint8List fileBytes,
    required String fileName,
  }) async {
    try {
      final token = await AuthService.getToken();
      
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('${AppConfig.apiBaseUrl}/consent/upload/$studentId'),
      );
      
      request.headers['Authorization'] = 'Bearer $token';
      
      request.files.add(
        http.MultipartFile.fromBytes(
          'consentFile',
          fileBytes,
          filename: fileName,
        ),
      );

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al subir consentimiento: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al subir consentimiento: $e');
    }
  }
}

class DocumentService {
  // Obtener documentos de un estudiante
  static Future<List<dynamic>> getStudentDocuments(String studentId) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/documents/student/$studentId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        // El backend puede devolver los documentos directamente o dentro de un objeto data
        if (responseData is List) {
          return responseData;
        } else if (responseData is Map && responseData.containsKey('data')) {
          return responseData['data'] as List;
        } else {
          return [];
        }
      } else {
        throw Exception('Error al obtener documentos: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al obtener documentos: $e');
    }
  }

  // Subir documento por parte del staff (coordinadora/educadora) a un estudiante
  static Future<Map<String, dynamic>> uploadDocumentByStaff({
    required String studentId,
    required String documentType,
    required String fileName,
    required Uint8List fileBytes,
    String? description,
    String? category,
  }) async {
    try {
      final token = await AuthService.getToken();
      
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('${AppConfig.apiBaseUrl}/documents/upload'),
      );
      
      request.headers['Authorization'] = 'Bearer $token';
      
      request.fields['studentId'] = studentId;
      request.fields['documentType'] = documentType;
      if (description != null && description.isNotEmpty) {
        request.fields['description'] = description;
      }
      if (category != null && category.isNotEmpty) {
        request.fields['category'] = category;
      }
      
      request.files.add(
        http.MultipartFile.fromBytes(
          'document',
          fileBytes,
          filename: fileName,
        ),
      );

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al subir documento: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      throw Exception('Error al subir documento: $e');
    }
  }

  // Subir documento por parte del estudiante
  static Future<Map<String, dynamic>> uploadDocumentByStudent({
    required String documentType,
    required String fileName,
    required Uint8List fileBytes,
    String? description,
    String? category,
  }) async {
    try {
      final token = await AuthService.getToken();
      
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('${AppConfig.apiBaseUrl}/documents/student/upload'),
      );
      
      request.headers['Authorization'] = 'Bearer $token';
      
      request.fields['documentType'] = documentType;
      if (description != null && description.isNotEmpty) {
        request.fields['description'] = description;
      }
      if (category != null && category.isNotEmpty) {
        request.fields['category'] = category;
      }
      
      request.files.add(
        http.MultipartFile.fromBytes(
          'document',
          fileBytes,
          filename: fileName,
        ),
      );

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al subir documento: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      throw Exception('Error al subir documento: $e');
    }
  }

  // Método genérico para subir documentos (detecta automáticamente el rol)
  static Future<Map<String, dynamic>> uploadDocument({
    String? studentId, // null si es un estudiante subiendo su propio documento
    required String documentType,
    required String fileName,
    required Uint8List fileBytes,
    String? description,
    String? category,
  }) async {
    // Si se proporciona studentId, es staff subiendo a un estudiante
    // Si no se proporciona, es un estudiante subiendo su propio documento
    if (studentId != null) {
      return uploadDocumentByStaff(
        studentId: studentId,
        documentType: documentType,
        fileName: fileName,
        fileBytes: fileBytes,
        description: description,
        category: category,
      );
    } else {
      return uploadDocumentByStudent(
        documentType: documentType,
        fileName: fileName,
        fileBytes: fileBytes,
        description: description,
        category: category,
      );
    }
  }

  // Descargar documento
  static Future<Uint8List> downloadDocument(String documentId) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/documents/$documentId/download'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return response.bodyBytes;
      } else {
        throw Exception('Error al descargar documento: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al descargar documento: $e');
    }
  }

  // Eliminar documento
  static Future<void> deleteDocument(String documentId) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.delete(
        Uri.parse('${AppConfig.apiBaseUrl}/documents/$documentId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception('Error al eliminar documento: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al eliminar documento: $e');
    }
  }

  // Obtener tipos de documentos disponibles
  static List<String> getDocumentTypes() {
    return [
      'CERTIFICADO_MEDICO',
      'INFORME_PSICOEDUCATIVO',
      'CERTIFICADO_DISCAPACIDAD',
      'INFORME_MEDICO_ESPECIALISTA',
      'EVALUACION_DIFERENCIAL',
      'PLAN_EDUCATIVO_INDIVIDUALIZADO',
      'EVALUACION_PSICOPEDAGOGICA',
      'INFORME_FONOAUDIOLOGICO',
      'OTRO_DOCUMENTO',
    ];
  }

  // Obtener nombre amigable del tipo de documento
  static String getDocumentTypeName(String type) {
    const typeNames = {
      'CERTIFICADO_MEDICO': 'Certificado Médico',
      'INFORME_PSICOEDUCATIVO': 'Informe Psicoeducativo',
      'CERTIFICADO_DISCAPACIDAD': 'Certificado de Discapacidad',
      'INFORME_MEDICO_ESPECIALISTA': 'Informe Médico Especialista',
      'EVALUACION_DIFERENCIAL': 'Evaluación Diferencial',
      'PLAN_EDUCATIVO_INDIVIDUALIZADO': 'Plan Educativo Individualizado (PEI)',
      'EVALUACION_PSICOPEDAGOGICA': 'Evaluación Psicopedagógica',
      'INFORME_FONOAUDIOLOGICO': 'Informe Fonoaudiológico',
      'OTRO_DOCUMENTO': 'Otro Documento',
    };
    return typeNames[type] ?? type;
  }

  // Obtener categorías de documentos
  static List<String> getDocumentCategories() {
    return [
      'MEDICO',
      'PSICOEDUCATIVO',
      'LEGAL',
      'ACADEMICO',
      'TERAPEUTICO',
      'ADMINISTRATIVO',
      'OTRO',
    ];
  }

  // Obtener nombre amigable de la categoría
  static String getCategoryName(String category) {
    const categoryNames = {
      'MEDICO': 'Médico',
      'PSICOEDUCATIVO': 'Psicoeducativo',
      'LEGAL': 'Legal',
      'ACADEMICO': 'Académico',
      'TERAPEUTICO': 'Terapéutico',
      'ADMINISTRATIVO': 'Administrativo',
      'OTRO': 'Otro',
    };
    return categoryNames[category] ?? category;
  }

  // Obtener extensión de archivo válidas
  static List<String> getAllowedExtensions() {
    return ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
  }

  // Validar si una extensión de archivo es permitida
  static bool isAllowedExtension(String fileName) {
    final extension = fileName.split('.').last.toLowerCase();
    return getAllowedExtensions().contains(extension);
  }

  // Obtener tamaño máximo de archivo (en bytes)
  static int getMaxFileSize() {
    return 10 * 1024 * 1024; // 10 MB
  }

  // Validar tamaño de archivo
  static bool isValidFileSize(Uint8List fileBytes) {
    return fileBytes.length <= getMaxFileSize();
  }

  // Obtener información del documento para mostrar en la UI
  static Map<String, String> getDocumentDisplayInfo(Map<String, dynamic> document) {
    final fileName = document['fileName'] ?? 'Sin nombre';
    final documentType = document['documentType'] ?? 'OTRO_DOCUMENTO';
    final category = document['category'] ?? 'OTRO';
    final uploadDate = document['uploadDate'] ?? document['createdAt'];
    final uploaderName = document['uploaderName'] ?? 'Desconocido';

    return {
      'fileName': fileName,
      'typeName': getDocumentTypeName(documentType),
      'categoryName': getCategoryName(category),
      'uploadDate': uploadDate,
      'uploaderName': uploaderName,
      'description': document['description'] ?? '',
    };
  }
}
