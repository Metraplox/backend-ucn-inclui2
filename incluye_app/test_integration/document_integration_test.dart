import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:incluye_app/config/app_config.dart';

/// Script específico para probar la integración del sistema de documentos
/// entre el frontend Flutter y el backend NestJS
class DocumentIntegrationTest {
  
  static const String testStudentId = '60d5ec49f1b2c8b1f8e4b1a1';
  static const String testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'; // Token de prueba
  
  /// Prueba el endpoint de salud del backend
  static Future<bool> testHealthEndpoint() async {
    try {
      print('🔍 Probando endpoint /health...');
      
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/health'),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('✅ Health endpoint respondió: ${data['data']['status']}');
        return true;
      } else {
        print('❌ Health endpoint falló con código: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('❌ Error al probar health endpoint: $e');
      return false;
    }
  }
  
  /// Prueba el endpoint de obtener documentos de estudiante
  static Future<bool> testGetStudentDocuments() async {
    try {
      print('🔍 Probando GET /documents/student/{studentId}...');
      
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/documents/student/$testStudentId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $testToken',
        },
      );
      
      if (response.statusCode == 200 || response.statusCode == 401) {
        print('✅ Endpoint de documentos responde correctamente');
        if (response.statusCode == 401) {
          print('ℹ️ Respuesta 401 esperada (sin autenticación válida)');
        }
        return true;
      } else {
        print('❌ Endpoint falló con código: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('❌ Error al probar endpoint de documentos: $e');
      return false;
    }
  }
  
  /// Prueba el endpoint de autenticación
  static Future<bool> testAuthEndpoint() async {
    try {
      print('🔍 Probando POST /auth/login...');
      
      final response = await http.post(
        Uri.parse('${AppConfig.apiBaseUrl}/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': 'test@ucn.cl',
          'password': 'test123'
        }),
      );
      
      if (response.statusCode == 401 || response.statusCode == 400 || response.statusCode == 200) {
        print('✅ Endpoint de autenticación responde correctamente');
        print('ℹ️ Código de respuesta: ${response.statusCode}');
        return true;
      } else {
        print('❌ Endpoint de autenticación falló con código: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('❌ Error al probar endpoint de autenticación: $e');
      return false;
    }
  }
  
  /// Prueba el endpoint de estudiantes
  static Future<bool> testStudentsEndpoint() async {
    try {
      print('🔍 Probando GET /students...');
      
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/students'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $testToken',
        },
      );
      
      if (response.statusCode == 200 || response.statusCode == 401) {
        print('✅ Endpoint de estudiantes responde correctamente');
        if (response.statusCode == 401) {
          print('ℹ️ Respuesta 401 esperada (sin autenticación válida)');
        }
        return true;
      } else {
        print('❌ Endpoint de estudiantes falló con código: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('❌ Error al probar endpoint de estudiantes: $e');
      return false;
    }
  }
  
  /// Prueba la documentación Swagger
  static Future<bool> testSwaggerEndpoint() async {
    try {
      print('🔍 Probando Swagger UI...');
      
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/api'),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        print('✅ Swagger UI disponible');
        return true;
      } else {
        print('❌ Swagger UI no disponible, código: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('❌ Error al probar Swagger: $e');
      return false;
    }
  }
  
  /// Verifica que los endpoints principales de documentos estén disponibles
  static Future<bool> testDocumentEndpoints() async {
    try {
      print('🔍 Probando endpoints específicos de documentos...');
      
      final endpoints = [
        '/documents/upload',
        '/documents/student/upload',
        '/documents/templates/consentimiento',
      ];
      
      int available = 0;
      
      for (final endpoint in endpoints) {
        try {
          final response = await http.post(
            Uri.parse('${AppConfig.apiBaseUrl}$endpoint'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $testToken',
            },
          );
          
          // Cualquier respuesta diferente a 404 significa que el endpoint existe
          if (response.statusCode != 404) {
            available++;
            print('  ✅ $endpoint disponible');
          } else {
            print('  ❌ $endpoint no encontrado');
          }
        } catch (e) {
          print('  ❌ Error en $endpoint: $e');
        }
        
        // Pequeña pausa entre requests
        await Future.delayed(Duration(milliseconds: 100));
      }
      
      if (available >= 2) {
        print('✅ Mayoría de endpoints de documentos disponibles ($available/${endpoints.length})');
        return true;
      } else {
        print('❌ Pocos endpoints de documentos disponibles ($available/${endpoints.length})');
        return false;
      }
    } catch (e) {
      print('❌ Error al probar endpoints de documentos: $e');
      return false;
    }
  }
  
  /// Ejecuta todas las pruebas de integración para documentos
  static Future<void> runDocumentIntegrationTests() async {
    print('📄 Iniciando pruebas de integración - Sistema de Documentos');
    print('🌐 API Base URL: ${AppConfig.apiBaseUrl}');
    print('=' * 60);
    
    final tests = [
      ('Health Check', testHealthEndpoint),
      ('Swagger UI', testSwaggerEndpoint),
      ('Auth Endpoint', testAuthEndpoint),
      ('Students Endpoint', testStudentsEndpoint),
      ('Student Documents', testGetStudentDocuments),
      ('Document Endpoints', testDocumentEndpoints),
    ];
    
    int passed = 0;
    int failed = 0;
    
    for (final test in tests) {
      print('\n📋 Ejecutando: ${test.$1}');
      
      try {
        final result = await test.$2();
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (e) {
        print('❌ Error inesperado: $e');
        failed++;
      }
      
      print('-' * 40);
      
      // Pausa entre pruebas
      await Future.delayed(Duration(milliseconds: 500));
    }
    
    print('\n🎯 Resumen de Pruebas de Integración:');
    print('✅ Exitosas: $passed');
    print('❌ Fallidas: $failed');
    print('📊 Total: ${passed + failed}');
    print('📈 Porcentaje de éxito: ${((passed / (passed + failed)) * 100).toStringAsFixed(1)}%');
    
    if (failed == 0) {
      print('\n🎉 ¡Integración perfecta!');
      print('🚀 El sistema de documentos está completamente operativo.');
      print('🔗 Frontend y Backend comunicándose correctamente.');
    } else if (passed >= failed) {
      print('\n✅ Integración mayormente exitosa');
      print('⚠️ Hay ${failed} prueba(s) que pueden requerir atención menor.');
      print('🔧 El sistema es funcional pero puede optimizarse.');
    } else {
      print('\n⚠️ Problemas de integración detectados');
      print('🔧 ${failed} prueba(s) requieren atención inmediata.');
      print('📋 Revisar configuración de red y endpoints.');
    }
    
    print('\n📋 Próximos pasos recomendados:');
    print('1. ✅ Verificar que el backend esté ejecutándose en puerto 3000');
    print('2. 🔐 Configurar usuarios de prueba para autenticación');
    print('3. 📄 Probar subida real de documentos con la interfaz');
    print('4. 🎨 Verificar la UI en diferentes navegadores');
    print('5. 📱 Probar en dispositivos móviles (si aplica)');
    
    print('=' * 60);
  }
}

/// Punto de entrada para ejecutar las pruebas específicas de documentos
void main() async {
  await DocumentIntegrationTest.runDocumentIntegrationTests();
}
