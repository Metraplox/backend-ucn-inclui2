// services/consent_service.dart
import 'api_service.dart';

class ConsentService {
  static Future<bool> giveConsent(String studentId) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final response = await ApiService.dio.post(
        '/consents',
        data: {'studentId': studentId},
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (e) {
      ApiService.handleApiError('Dar consentimiento', e);
      return false;
    }
  }
}
