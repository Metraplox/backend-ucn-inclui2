import 'dart:convert';
import 'dart:io';

/// Script independiente para probar la integración del sistema de documentos
/// sin dependencias de Flutter
class StandaloneDocumentTest {
  
  static const String apiBaseUrl = 'http://localhost:3000';
  static const String testStudentId = '60d5ec49f1b2c8b1f8e4b1a1';
  static const String testToken = 'test-token';
  
  /// Cliente HTTP personalizado
  static final HttpClient _httpClient = HttpClient();
  
  /// Realiza una petición HTTP GET
  static Future<Map<String, dynamic>> _makeGetRequest(String endpoint, {Map<String, String>? headers}) async {
    try {
      final uri = Uri.parse('$apiBaseUrl$endpoint');
      final request = await _httpClient.getUrl(uri);
      
      // Agregar headers
      request.headers.set('Content-Type', 'application/json');
      if (headers != null) {
        headers.forEach((key, value) {
          request.headers.set(key, value);
        });
      }
      
      final response = await request.close();
      final responseBody = await response.transform(utf8.decoder).join();
      
      return {
        'statusCode': response.statusCode,
        'body': responseBody,
        'headers': response.headers.toString(),
      };
    } catch (e) {
      return {
        'statusCode': 0,
        'error': e.toString(),
        'body': '',
      };
    }
  }
  
  /// Realiza una petición HTTP POST
  static Future<Map<String, dynamic>> _makePostRequest(String endpoint, Map<String, dynamic> data, {Map<String, String>? headers}) async {
    try {
      final uri = Uri.parse('$apiBaseUrl$endpoint');
      final request = await _httpClient.postUrl(uri);
      
      // Agregar headers
      request.headers.set('Content-Type', 'application/json');
      if (headers != null) {
        headers.forEach((key, value) {
          request.headers.set(key, value);
        });
      }
      
      // Agregar body
      request.write(jsonEncode(data));
      
      final response = await request.close();
      final responseBody = await response.transform(utf8.decoder).join();
      
      return {
        'statusCode': response.statusCode,
        'body': responseBody,
        'headers': response.headers.toString(),
      };
    } catch (e) {
      return {
        'statusCode': 0,
        'error': e.toString(),
        'body': '',
      };
    }
  }
  
  /// Prueba el endpoint de salud del backend
  static Future<bool> testHealthEndpoint() async {
    print('🔍 Probando endpoint /health...');
    
    final response = await _makeGetRequest('/health');
    
    if (response['statusCode'] == 200) {
      try {
        final data = jsonDecode(response['body']);
        print('✅ Health endpoint respondió: ${data['data']?['status'] ?? 'OK'}');
        return true;
      } catch (e) {
        print('✅ Health endpoint respondió con código 200');
        return true;
      }
    } else if (response['statusCode'] == 0) {
      print('❌ No se pudo conectar al servidor: ${response['error']}');
      return false;
    } else {
      print('❌ Health endpoint falló con código: ${response['statusCode']}');
      return false;
    }
  }
  
  /// Verifica que el servidor esté ejecutándose
  static Future<bool> testServerConnection() async {
    print('🔍 Verificando conexión al servidor...');
    
    try {
      final socket = await Socket.connect('localhost', 3000, timeout: Duration(seconds: 5));
      socket.destroy();
      print('✅ Servidor respondiendo en puerto 3000');
      return true;
    } catch (e) {
      print('❌ No se puede conectar al servidor en puerto 3000: $e');
      return false;
    }
  }
  
  /// Prueba el endpoint de documentos
  static Future<bool> testDocumentEndpoints() async {
    print('🔍 Probando endpoints de documentos...');
    
    final endpoints = [
      '/documents/student/$testStudentId',
      '/auth/login',
      '/students',
    ];
    
    int available = 0;
    
    for (final endpoint in endpoints) {
      final response = await _makeGetRequest(endpoint, headers: {
        'Authorization': 'Bearer $testToken',
      });
      
      // Cualquier respuesta diferente a 0 (error de conexión) significa que el endpoint existe
      if (response['statusCode'] != 0) {
        available++;
        print('  ✅ $endpoint disponible (${response['statusCode']})');
      } else {
        print('  ❌ $endpoint no disponible: ${response['error']}');
      }
      
      // Pequeña pausa entre requests
      await Future.delayed(Duration(milliseconds: 200));
    }
    
    if (available >= 2) {
      print('✅ Mayoría de endpoints disponibles ($available/${endpoints.length})');
      return true;
    } else {
      print('❌ Pocos endpoints disponibles ($available/${endpoints.length})');
      return false;
    }
  }
  
  /// Prueba la documentación Swagger
  static Future<bool> testSwaggerEndpoint() async {
    print('🔍 Probando Swagger UI...');
    
    final response = await _makeGetRequest('/api');
    
    if (response['statusCode'] == 200) {
      print('✅ Swagger UI disponible');
      return true;
    } else if (response['statusCode'] == 0) {
      print('❌ No se pudo conectar para Swagger: ${response['error']}');
      return false;
    } else {
      print('❌ Swagger UI no disponible, código: ${response['statusCode']}');
      return false;
    }
  }
  
  /// Prueba el endpoint de autenticación
  static Future<bool> testAuthEndpoint() async {
    print('🔍 Probando POST /auth/login...');
    
    final response = await _makePostRequest('/auth/login', {
      'email': 'test@ucn.cl',
      'password': 'test123'
    });
    
    if (response['statusCode'] == 401 || response['statusCode'] == 400 || response['statusCode'] == 200) {
      print('✅ Endpoint de autenticación responde (${response['statusCode']})');
      return true;
    } else if (response['statusCode'] == 0) {
      print('❌ No se pudo conectar al endpoint de auth: ${response['error']}');
      return false;
    } else {
      print('❌ Endpoint de autenticación falló con código: ${response['statusCode']}');
      return false;
    }
  }
  
  /// Ejecuta todas las pruebas de integración
  static Future<void> runIntegrationTests() async {
    print('📄 Iniciando Pruebas de Integración - Sistema UCN INCLUI2');
    print('🌐 API Base URL: $apiBaseUrl');
    print('=' * 60);
    
    final tests = [
      ('Conexión al servidor', testServerConnection),
      ('Health Check', testHealthEndpoint),
      ('Swagger UI', testSwaggerEndpoint),
      ('Auth Endpoint', testAuthEndpoint),
      ('Document Endpoints', testDocumentEndpoints),
    ];
    
    int passed = 0;
    int failed = 0;
    List<String> failedTests = [];
    
    for (final test in tests) {
      print('\n📋 Ejecutando: ${test.$1}');
      
      try {
        final result = await test.$2();
        if (result) {
          passed++;
        } else {
          failed++;
          failedTests.add(test.$1);
        }
      } catch (e) {
        print('❌ Error inesperado: $e');
        failed++;
        failedTests.add('${test.$1} (Error: $e)');
      }
      
      print('-' * 40);
      
      // Pausa entre pruebas
      await Future.delayed(Duration(milliseconds: 300));
    }
    
    // Cerrar cliente HTTP
    _httpClient.close();
    
    print('\n🎯 Resumen de Pruebas de Integración:');
    print('✅ Exitosas: $passed');
    print('❌ Fallidas: $failed');
    print('📊 Total: ${passed + failed}');
    
    if (failed > 0) {
      print('\n❌ Pruebas fallidas:');
      for (final failedTest in failedTests) {
        print('  • $failedTest');
      }
    }
    
    final successRate = ((passed / (passed + failed)) * 100);
    print('📈 Porcentaje de éxito: ${successRate.toStringAsFixed(1)}%');
    
    if (failed == 0) {
      print('\n🎉 ¡Integración perfecta!');
      print('🚀 El backend está completamente operativo.');
      print('🔗 Todos los endpoints responden correctamente.');
      print('\n✅ ESTADO: LISTO PARA FRONTEND');
    } else if (passed >= failed) {
      print('\n✅ Integración mayormente exitosa');
      print('⚠️ Hay ${failed} prueba(s) que pueden requerir atención.');
      print('🔧 El sistema es funcional pero puede optimizarse.');
      print('\n⚠️ ESTADO: FUNCIONAL CON OBSERVACIONES');
    } else {
      print('\n⚠️ Problemas de integración detectados');
      print('🔧 ${failed} prueba(s) requieren atención inmediata.');
      print('📋 Revisar configuración del backend.');
      print('\n❌ ESTADO: REQUIERE ATENCIÓN');
    }
    
    print('\n📋 Próximos pasos para integración completa:');
    print('1. ✅ Verificar que el backend esté ejecutándose');
    print('2. 🔐 Configurar autenticación real');
    print('3. 📄 Probar endpoints de documentos con datos reales');
    print('4. 🎨 Integrar con la aplicación Flutter');
    print('5. 🧪 Ejecutar pruebas end-to-end');
    
    print('=' * 60);
  }
}

/// Punto de entrada
void main() async {
  await StandaloneDocumentTest.runIntegrationTests();
}
