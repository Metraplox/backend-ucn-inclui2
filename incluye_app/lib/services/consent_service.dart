// services/consent_service.dart
import 'api_service.dart';

class ConsentService {
  // Crear o actualizar consentimiento del estudiante autenticado
  static Future<Map<String, dynamic>?> createOrUpdateConsent({
    required bool allowsDataSharing,
    String? comments,
  }) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token no disponible');

      final response = await ApiService.dio.post(
        '/consents',
        data: {
          'allowsDataSharing': allowsDataSharing,
          if (comments != null && comments.isNotEmpty) 'comments': comments,
        },
      );
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        return response.data;
      }
      return null;
    } catch (e) {
      ApiService.handleApiError('Crear/actualizar consentimiento', e);
      return null;
    }
  }

  // Obtener consentimiento del estudiante autenticado
  static Future<Map<String, dynamic>?> getMyConsent() async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token no disponible');

      final response = await ApiService.dio.get('/consents/my-consent');
      
      if (response.statusCode == 200) {
        return response.data;
      }
      return null;
    } catch (e) {
      ApiService.handleApiError('Obtener mi consentimiento', e);
      return null;
    }
  }

  // Revocar consentimiento del estudiante autenticado
  static Future<bool> revokeConsent({String? reason}) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token no disponible');

      final response = await ApiService.dio.patch(
        '/consents/revoke',
        data: {
          if (reason != null && reason.isNotEmpty) 'reason': reason,
        },
      );
      
      return response.statusCode == 200;
    } catch (e) {
      ApiService.handleApiError('Revocar consentimiento', e);
      return false;
    }
  }

  // Obtener consentimiento de un estudiante específico (solo roles autorizados)
  static Future<Map<String, dynamic>?> getStudentConsent(String studentId) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token no disponible');

      final response = await ApiService.dio.get('/consents/student/$studentId');
      
      if (response.statusCode == 200) {
        return response.data;
      }
      return null;
    } catch (e) {
      ApiService.handleApiError('Obtener consentimiento del estudiante', e);
      return null;
    }
  }

  // Obtener todos los consentimientos (solo administradores)
  static Future<List<dynamic>?> getAllConsents() async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token no disponible');

      final response = await ApiService.dio.get('/consents/all');
      
      if (response.statusCode == 200) {
        return response.data is List ? response.data : [response.data];
      }
      return null;
    } catch (e) {
      ApiService.handleApiError('Obtener todos los consentimientos', e);
      return null;
    }
  }

  // Obtener estadísticas de consentimientos (solo administradores)
  static Future<Map<String, dynamic>?> getConsentStats() async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token no disponible');

      final response = await ApiService.dio.get('/consents/stats');
      
      if (response.statusCode == 200) {
        return response.data;
      }
      return null;
    } catch (e) {
      ApiService.handleApiError('Obtener estadísticas de consentimientos', e);
      return null;
    }
  }

  // Verificar si un estudiante tiene consentimiento activo
  static Future<bool> hasActiveConsent(String studentId) async {
    final consent = await getStudentConsent(studentId);
    return consent != null && 
           consent['isActive'] == true && 
           consent['allowsDataSharing'] == true;
  }

  // Verificar permisos basados en consentimiento y rol
  static bool canAccessData({
    required Map<String, dynamic>? consent,
    required String userRole,
    required String dataType, // 'documents', 'diagnosis', 'adjustments'
  }) {
    // El estudiante siempre puede ver sus propios datos
    if (userRole == 'estudiante') return true;

    // Sin consentimiento, solo se permiten ajustes
    if (consent == null || consent['allowsDataSharing'] != true) {
      return dataType == 'adjustments';
    }

    // Con consentimiento
    switch (userRole) {
      case 'coordinadora':
      case 'educadora':
        return true; // Acceso completo
      case 'docente':
        return dataType != 'documents'; // No documentos
      default:
        return dataType == 'adjustments'; // Solo ajustes
    }
  }
}
