import 'package:http/http.dart' as http;
import 'package:incluye_app/config/app_config.dart';

class ConnectivityTestHelper {
  static Future<bool> testBackendConnectivity() async {
    try {
      // Test básico de conectividad al backend
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/health'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 5));
      
      return response.statusCode == 200;
    } catch (e) {
      print('Error de conectividad: $e');
      return false;
    }
  }
  
  static Future<Map<String, dynamic>> getBackendInfo() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/health'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 5));
      
      return {
        'connected': response.statusCode == 200,
        'statusCode': response.statusCode,
        'responseTime': DateTime.now().millisecondsSinceEpoch,
        'url': '${AppConfig.apiBaseUrl}/health',
      };
    } catch (e) {
      return {
        'connected': false,
        'error': e.toString(),
        'url': '${AppConfig.apiBaseUrl}/health',
      };
    }
  }
}
