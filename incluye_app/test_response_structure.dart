import 'dart:convert';

/**
 * Script de prueba para demostrar el problema de estructura anidada
 * Este script simula las llamadas que hace el frontend Flutter
 */

void main() async {
  print('🔍 PRUEBA: Problema de estructura anidada data.data.data\n');
  
  // Simular las diferentes estructuras de respuesta del backend
  
  print('📱 CASO 1: Endpoint con ResponseInterceptor SOLAMENTE');
  testResponseStructure({
    'success': true,
    'statusCode': 200,
    'data': {
      '_id': '507f1f77bcf86cd799439011',
      'rut': '12345678-9',
      'nombres': 'Juan Carlos',
      'apellidos': 'Pérez González'
    }
  }, 'students/profile (ideal)');
  
  print('\n📱 CASO 2: Endpoint con doble wrapping (PROBLEMÁTICO)');
  testResponseStructure({
    'success': true,
    'statusCode': 200,
    'data': {
      'success': true,
      'data': {
        '_id': '507f1f77bcf86cd799439011',
        'filename': 'reporte_diddec.xlsx',
        'downloadUrl': '/diddec/reports/download/reporte_diddec.xlsx'
      }
    }
  }, 'diddec/reports (problemático)');
  
  print('\n📱 CASO 3: Endpoint inconsistente sin interceptor');
  testResponseStructure({
    'success': true,
    'data': {
      'filename': 'reporte_direct.xlsx',
      'downloadUrl': '/direct/download/reporte_direct.xlsx'
    }
  }, 'Hipotético sin interceptor');
}

void testResponseStructure(Map<String, dynamic> response, String endpointName) {
  print('🌐 Simulando respuesta de: $endpointName');
  print('📦 Estructura de respuesta:');
  print(JsonEncoder.withIndent('  ').convert(response));
  
  print('\n💻 Código Frontend necesario:');
  
  // Simular el código actual del frontend
  try {
    if (response.containsKey('data')) {
      final firstData = response['data'];
      
      if (firstData is Map && firstData.containsKey('data')) {
        // Caso problemático: data.data
        final actualData = firstData['data'];
        print('✅ Acceso exitoso con: response[\"data\"][\"data\"]');
        print('📊 Datos finales: ${actualData.runtimeType}');
        print('🔧 Contenido: ${JsonEncoder.withIndent('    ').convert(actualData)}');
      } else {
        // Caso normal: solo data
        print('✅ Acceso exitoso con: response[\"data\"]');
        print('📊 Datos finales: ${firstData.runtimeType}');
        print('🔧 Contenido: ${JsonEncoder.withIndent('    ').convert(firstData)}');
      }
    }
  } catch (e) {
    print('❌ Error de parsing: $e');
  }
  
  print('\n${'='*50}');
}
