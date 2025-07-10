import 'dart:convert';

class ApiResponseNormalizer {
  /// Normaliza las respuestas del backend que pueden tener estructura anidada
  /// debido a inconsistencias entre el ResponseInterceptor y controladores manuales
  static Map<String, dynamic>? extractData(Map<String, dynamic> response) {
    // Verificar si tiene estructura del ResponseInterceptor
    if (response.containsKey('success') && response.containsKey('data')) {
      final data = response['data'];
      
      // Verificar si hay doble anidación (problema de controladores manuales)
      if (data is Map<String, dynamic> && 
          data.containsKey('success') && 
          data.containsKey('data')) {
        
        print('⚠️ DETECTADO: Doble anidación en respuesta del backend');
        print('📦 Estructura original: ${JsonEncoder.withIndent('  ').convert(response)}');
        
        // Extraer el nivel más profundo
        return data['data'] as Map<String, dynamic>?;
      }
      
      // Estructura normal con solo ResponseInterceptor
      return data as Map<String, dynamic>?;
    }
    
    // Respuesta directa sin wrapping
    return response;
  }

  /// Extrae datos que pueden ser List o Map con estructura anidada
  static dynamic extractDataGeneric(Map<String, dynamic> response) {
    // Verificar si tiene estructura del ResponseInterceptor
    if (response.containsKey('success') && response.containsKey('data')) {
      final data = response['data'];
      
      // Verificar si hay doble anidación (problema de controladores manuales)
      if (data is Map<String, dynamic> && 
          data.containsKey('success') && 
          data.containsKey('data')) {
        
        print('⚠️ DETECTADO: Doble anidación en respuesta del backend');
        print('📦 Estructura original: ${JsonEncoder.withIndent('  ').convert(response)}');
        
        // Extraer el nivel más profundo
        return data['data'];
      }
      
      // Estructura normal con solo ResponseInterceptor
      return data;
    }
    
    // Respuesta directa sin wrapping
    return response;
  }

  /// Extrae datos de respuestas que pueden tener diferentes estructuras
  /// Maneja tanto respuestas con ResponseInterceptor como respuestas directas
  static T? extractTypedData<T>(Map<String, dynamic> response, T Function(Map<String, dynamic>) fromJson) {
    final normalizedData = extractData(response);
    if (normalizedData != null) {
      try {
        return fromJson(normalizedData);
      } catch (e) {
        print('❌ Error parsing data: $e');
        print('📦 Data que falló: ${JsonEncoder.withIndent('  ').convert(normalizedData)}');
        return null;
      }
    }
    return null;
  }

  /// Para debugging: imprime la estructura de la respuesta
  static void debugResponseStructure(Map<String, dynamic> response, String endpoint) {
    print('🔍 DEBUG: Estructura de respuesta para $endpoint');
    print('📦 ${JsonEncoder.withIndent('  ').convert(response)}');
    
    final normalized = extractData(response);
    if (normalized != response['data']) {
      print('✨ Datos normalizados:');
      print('📦 ${JsonEncoder.withIndent('  ').convert(normalized)}');
    }
  }
}
