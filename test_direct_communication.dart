import 'package:dio/dio.dart';

void main() async {
  print('🔍 PRUEBA DIRECTA DE COMUNICACIÓN FLUTTER-BACKEND');
  print('=================================================');
  
  try {
    final dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000'));
    
    // Probar endpoint de salud primero
    print('📡 Probando endpoint de salud...');
    final healthResponse = await dio.get('/health');
    print('✅ Health Check - Status: ${healthResponse.statusCode}');
    print('✅ Health Check - Data: ${healthResponse.data}');
    
    // Probar login
    print('\n📡 Probando login...');
    final loginResponse = await dio.post('/auth/login', data: {
      'email': 'coordinador@ucn.cl',
      'password': 'password123'
    });
    
    print('✅ Login - Status: ${loginResponse.statusCode}');
    print('✅ Login - Data: ${loginResponse.data}');
    
  } catch (e) {
    print('❌ Error en prueba directa: $e');
    if (e is DioException) {
      print('❌ DioException - Response: ${e.response?.data}');
      print('❌ DioException - Status: ${e.response?.statusCode}');
    }
  }
}
